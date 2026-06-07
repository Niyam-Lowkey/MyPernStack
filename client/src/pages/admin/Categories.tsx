import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService, Category } from '../../services/catalogService';
import adminService from '../../services/adminService';
import { Plus, Pencil, Trash2, X, Upload, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Categories: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch Categories
  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => catalogService.getCategories(true),
  });

  const categories = categoriesRes?.data?.categories || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to create category');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
      adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to update category');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('');
    setStatus('active');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImage(cat.image || '');
    setStatus(cat.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setValidationError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setValidationError(null);
    try {
      const res = await adminService.uploadImage(file);
      setImage(res.data.url);
    } catch (err: any) {
      console.error(err);
      setValidationError(err.response?.data?.message || 'Image upload failed. Size limit is 5MB.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (name.trim().length < 2) {
      setValidationError('Category name must be at least 2 characters.');
      return;
    }

    const payload = {
      name,
      description: description || null,
      image: image || null,
      status,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category? All assigned products will have their category set to null.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Top Header Controls */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-xs text-muted-foreground font-medium">Create and adjust product categories.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-2xl text-xs hover:opacity-95 shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Grid list or Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-card border border-muted rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-muted">
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Image</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Name</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Slug</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-4 font-bold text-muted-foreground text-right uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-muted last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center p-1 border">
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <FolderTree className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-foreground">{cat.name}</td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">{cat.slug}</td>
                    <td className="p-4">
                      {cat.status === 'active' ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="bg-zinc-500/10 border border-zinc-500/20 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                          title="Edit Category"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-muted rounded-3xl space-y-3">
          <AlertTriangle className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-base font-bold">No Categories Exist</h3>
          <p className="text-xs text-muted-foreground">Get started by creating your first product category.</p>
        </div>
      )}

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 z-50 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-card text-card-foreground border rounded-3xl p-6 w-full max-w-lg shadow-2xl relative pointer-events-auto flex flex-col space-y-6">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg font-bold">
                    {editingCategory ? 'Edit Category' : 'Create Category'}
                  </h3>
                  <button onClick={closeModal} className="p-1 hover:bg-secondary rounded-full">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Validation Banner */}
                {validationError && (
                  <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-xl font-medium">
                    {validationError}
                  </div>
                )}

                {/* Modal Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Disposable Vapes"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 bg-secondary/50 border border-muted focus:ring-1 focus:ring-primary focus:border-primary rounded-xl text-sm outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea
                      placeholder="Brief category description..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-secondary/50 border border-muted focus:ring-1 focus:ring-primary focus:border-primary rounded-xl text-sm outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Image upload selector & Preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Category Image</label>
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 bg-secondary/50 rounded-2xl overflow-hidden flex items-center justify-center p-1 border">
                        {image ? (
                          <img src={image} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          placeholder="Image URL or upload below..."
                          value={image}
                          onChange={(e) => setImage(e.target.value)}
                          className="w-full p-2 bg-secondary/30 border border-muted rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-xs font-semibold cursor-pointer border">
                          <Upload className="h-3.5 w-3.5" />
                          <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                          <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" disabled={uploading} />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catalog Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                    >
                      <option value="active">Active (Visible to Customers)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="pt-4 border-t flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex items-center gap-1.5 px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 disabled:opacity-50"
                    >
                      <Save className="h-3.5 w-3.5" />
                      <span>{editingCategory ? 'Update' : 'Create'}</span>
                    </button>
                  </div>

                </form>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Categories;
