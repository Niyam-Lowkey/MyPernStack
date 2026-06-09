import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../../services/catalogService';
import type { Banner } from '../../services/catalogService';
import adminService from '../../services/adminService';
import { Plus, Pencil, Trash2, X, Upload, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Banners: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch Banners
  const { data: bannersRes, isLoading } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => catalogService.getBanners(true),
  });

  const banners = bannersRes?.data?.banners || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to create banner');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Banner> }) =>
      adminService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to update banner');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteBanner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete banner');
    }
  });

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setLinkUrl('');
    setSortOrder('0');
    setIsActive(true);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (ban: Banner) => {
    setEditingBanner(ban);
    setTitle(ban.title);
    setSubtitle(ban.subtitle || '');
    setImageUrl(ban.image_url);
    setLinkUrl(ban.link_url || '');
    setSortOrder(ban.sort_order.toString());
    setIsActive(ban.is_active);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setValidationError(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setValidationError(null);
    try {
      const res = await adminService.uploadImage(file);
      setImageUrl(res.data.url);
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

    if (!title.trim() || !imageUrl.trim()) {
      setValidationError('Title and Image URL are required.');
      return;
    }

    const payload = {
      title,
      subtitle: subtitle || undefined,
      image_url: imageUrl,
      link_url: linkUrl || undefined,
      sort_order: parseInt(sortOrder, 10) || 0,
      is_active: isActive,
    };

    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promotional banner?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Header controls */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Promotional Banners</h2>
          <p className="text-xs text-muted-foreground font-medium">Manage slides in the main homepage hero slider.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-2xl text-xs hover:opacity-95 shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Banner</span>
        </button>
      </div>

      {/* Grid table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : banners.length > 0 ? (
        <div className="bg-card border border-muted rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-muted">
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Preview</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Title</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Link Url</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Order</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-4 font-bold text-muted-foreground text-right uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((ban) => (
                  <tr key={ban.id} className="border-b border-muted last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="h-12 w-20 rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center p-1 border">
                        <img src={ban.image_url} alt={ban.title} className="h-full w-full object-cover rounded-lg" />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{ban.title}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{ban.subtitle}</div>
                    </td>
                    <td className="p-4 text-xs font-mono text-muted-foreground">{ban.link_url || 'N/A'}</td>
                    <td className="p-4 font-bold">{ban.sort_order}</td>
                    <td className="p-4">
                      {ban.is_active ? (
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
                          onClick={() => openEditModal(ban)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                          title="Edit Banner"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ban.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          title="Delete Banner"
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
          <h3 className="text-base font-bold">No Banners Exist</h3>
          <p className="text-xs text-muted-foreground">Add your first promotional hero slide slide above.</p>
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
                    {editingBanner ? 'Edit Banner' : 'Create Banner'}
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

                {/* Form Fields */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banner Title</label>
                    <input
                      type="text"
                      placeholder="e.g. VapePro Apex 10k"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subtitle / Pitch</label>
                    <textarea
                      placeholder="Brief promotion details..."
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Link URL</label>
                      <input
                        type="text"
                        placeholder="e.g. /category/pod-systems"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sort Order</label>
                      <input
                        type="number"
                        placeholder="e.g. 0"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>

                  {/* Image upload selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Slide Banner Image</label>
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-28 bg-secondary/50 rounded-2xl overflow-hidden flex items-center justify-center p-1 border">
                        {imageUrl ? (
                          <img src={imageUrl} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          placeholder="Image URL or upload below..."
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="w-full p-2 bg-secondary/30 border border-muted rounded-lg text-xs outline-none"
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
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Banner Status</label>
                    <div className="flex items-center">
                      <input
                        id="isActive"
                        type="checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4 w-4 text-primary focus:ring-primary border-muted rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-xs font-semibold text-muted-foreground cursor-pointer">
                        Active (Display in Slider Carousel)
                      </label>
                    </div>
                  </div>

                  {/* Action buttons */}
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
                      <span>{editingBanner ? 'Update' : 'Create'}</span>
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

export default Banners;
