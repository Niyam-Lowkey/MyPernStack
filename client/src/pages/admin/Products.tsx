import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService, Product } from '../../services/catalogService';
import adminService from '../../services/adminService';
import { Plus, Pencil, Trash2, X, Upload, Save, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [puffCount, setPuffCount] = useState('');
  const [nicotineStrength, setNicotineStrength] = useState('');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState<'in_stock' | 'out_of_stock' | 'discontinued'>('in_stock');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [flavorsInput, setFlavorsInput] = useState(''); // Comma separated for initial creation
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch Products
  const { data: productsRes, isLoading: prodsLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => catalogService.getProducts({ admin: 'true', limit: 100 }),
  });

  // Fetch Categories for dropdown selector
  const { data: categoriesRes } = useQuery({
    queryKey: ['admin-categories-select'],
    queryFn: () => catalogService.getCategories(true),
  });

  const products = productsRes?.data?.products || [];
  const categories = categoriesRes?.data?.categories || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to create product');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Product> }) =>
      adminService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to update product');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategoryId(categories[0]?.id || '');
    setDescription('');
    setImage('');
    setPuffCount('');
    setNicotineStrength('');
    setPrice('');
    setAvailability('in_stock');
    setStatus('active');
    setFlavorsInput('');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setCategoryId(prod.category_id);
    setDescription(prod.description || '');
    setImage(prod.image || '');
    setPuffCount(prod.puff_count ? prod.puff_count.toString() : '');
    setNicotineStrength(prod.nicotine_strength ? prod.nicotine_strength.toString() : '0');
    setPrice(prod.price.toString());
    setAvailability(prod.availability);
    setStatus(prod.status);
    setFlavorsInput(''); // Flavors are managed on their own tab in production
    setValidationError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
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

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setValidationError('Please enter a valid price greater than $0.');
      return;
    }

    if (!categoryId) {
      setValidationError('Please select a category.');
      return;
    }

    const payload: any = {
      category_id: categoryId,
      name,
      description: description || null,
      image: image || null,
      puff_count: puffCount ? parseInt(puffCount, 10) : null,
      nicotine_strength: nicotineStrength ? parseFloat(nicotineStrength) : 0.0,
      price: parsedPrice,
      availability,
      status,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: payload });
    } else {
      // On creation, also allow adding initial comma-separated flavor list
      if (flavorsInput.trim()) {
        payload.flavors = flavorsInput
          .split(',')
          .map((f) => f.trim())
          .filter((f) => f.length > 0);
      }
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product? All assigned flavors and secondary images will be permanently removed.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Header controls */}
      <div className="flex justify-between items-center pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-xs text-muted-foreground font-medium">Create and adjust items in the catalog.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-2xl text-xs hover:opacity-95 shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </button>
      </div>

      {/* Grid list or Loading */}
      {prodsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="bg-card border border-muted rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-muted">
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Image</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Name</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Category</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Price</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Specs</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Availability</th>
                  <th className="p-4 font-bold text-muted-foreground text-right uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod) => (
                  <tr key={prod.id} className="border-b border-muted last:border-0 hover:bg-secondary/20 transition-colors">
                    <td className="p-4">
                      <div className="h-12 w-12 rounded-xl bg-secondary/50 overflow-hidden flex items-center justify-center p-1 border">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <Plus className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{prod.name}</div>
                      <div className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]">{prod.slug}</div>
                    </td>
                    <td className="p-4 font-semibold text-muted-foreground">{prod.category_name}</td>
                    <td className="p-4 font-extrabold text-foreground">${Number(prod.price).toFixed(2)}</td>
                    <td className="p-4 space-y-0.5 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1 font-semibold">
                        <Zap className="h-3 w-3 text-primary" />
                        {prod.puff_count ? `${prod.puff_count} Puffs` : 'Refillable'}
                      </div>
                      <div>Nicotine: {prod.nicotine_strength}%</div>
                    </td>
                    <td className="p-4">
                      {prod.availability === 'in_stock' ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                          In Stock
                        </span>
                      ) : prod.availability === 'out_of_stock' ? (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="bg-zinc-500/10 border border-zinc-500/20 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                          Discontinued
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(prod)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                          title="Edit Product"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prod.id)}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          title="Delete Product"
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
          <h3 className="text-base font-bold">No Products Exist</h3>
          <p className="text-xs text-muted-foreground">Start adding items by clicking the button above.</p>
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
              <div className="bg-card text-card-foreground border rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative pointer-events-auto flex flex-col space-y-6 max-h-[90vh] overflow-y-auto">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center pb-3 border-b">
                  <h3 className="text-lg font-bold">
                    {editingProduct ? 'Edit Product' : 'Create Product'}
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

                {/* Form Inputs Grid */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Pro 8000"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="e.g. 19.99"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Puff Count</label>
                      <input
                        type="number"
                        placeholder="e.g. 8000 (leave blank if refillable)"
                        value={puffCount}
                        onChange={(e) => setPuffCount(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nicotine Strength (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 5.0"
                        value={nicotineStrength}
                        onChange={(e) => setNicotineStrength(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                    <textarea
                      placeholder="Product details specifications..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none resize-none"
                    />
                  </div>

                  {/* Comma-separated flavors selector (only for creation) */}
                  {!editingProduct && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Initial Flavors (Comma Separated)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Blue Razz Ice, Watermelon Bubblegum, Peach Ice"
                        value={flavorsInput}
                        onChange={(e) => setFlavorsInput(e.target.value)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      />
                    </div>
                  )}

                  {/* Image upload preview */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Product Image</label>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Availability</label>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value as any)}
                        className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      >
                        <option value="in_stock">In Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
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
                  </div>

                  {/* Action Buttons */}
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
                      <span>{editingProduct ? 'Update' : 'Create'}</span>
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

export default Products;
