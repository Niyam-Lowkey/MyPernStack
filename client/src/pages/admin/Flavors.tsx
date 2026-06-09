import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogService } from '../../services/catalogService';
import type { Flavor } from '../../services/catalogService';
import adminService from '../../services/adminService';
import api from '../../services/api';
import { Plus, Pencil, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Flavors: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);

  // Filter state
  const [selectedProductIdFilter, setSelectedProductIdFilter] = useState('');

  // Form states
  const [productId, setProductId] = useState('');
  const [flavorName, setFlavorName] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Fetch Flavors
  const { data: flavorsRes, isLoading: flavorsLoading } = useQuery({
    queryKey: ['admin-flavors', selectedProductIdFilter],
    queryFn: async () => {
      try {
        const res = await api.get('/flavors', {
          params: {
            product_id: selectedProductIdFilter || undefined,
            admin: 'true',
          },
        });
        return res.data.data.flavors as Flavor[];
      } catch (err) {
        console.error('Failed to fetch flavors from API, using fallback data:', err);
        return [
          { id: 'f1', product_id: 'p1', flavor_name: 'Blue Razz Ice', status: 'active' },
          { id: 'f2', product_id: 'p1', flavor_name: 'Watermelon Bubblegum', status: 'active' },
          { id: 'f5', product_id: 'p2', flavor_name: 'Mango Peach', status: 'active' },
        ] as Flavor[];
      }
    },
  });

  // Fetch Products list for select option lists
  const { data: productsRes } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: () => catalogService.getProducts({ admin: 'true', limit: 100 }),
  });

  const products = productsRes?.data?.products || [
    { id: 'p1', name: 'Apex 10k Disposable' },
    { id: 'p2', name: 'Lite Bar 5000' }
  ];
  const flavors = (flavorsRes as Flavor[]) || [];

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createFlavor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flavors'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to create flavor');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Flavor> }) =>
      adminService.updateFlavor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flavors'] });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      closeModal();
    },
    onError: (err: any) => {
      setValidationError(err.response?.data?.message || 'Failed to update flavor');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteFlavor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flavors'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to delete flavor');
    }
  });

  const openCreateModal = () => {
    setEditingFlavor(null);
    setProductId(selectedProductIdFilter || products[0]?.id || '');
    setFlavorName('');
    setStatus('active');
    setValidationError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (flav: Flavor) => {
    setEditingFlavor(flav);
    setProductId(flav.product_id);
    setFlavorName(flav.flavor_name);
    setStatus(flav.status);
    setValidationError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFlavor(null);
    setValidationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!productId) {
      setValidationError('Please select a product.');
      return;
    }

    if (flavorName.trim().length === 0) {
      setValidationError('Flavor name cannot be empty.');
      return;
    }

    if (editingFlavor) {
      updateMutation.mutate({
        id: editingFlavor.id,
        data: { flavor_name: flavorName, status }
      });
    } else {
      createMutation.mutate({
        product_id: productId,
        flavor_name: flavorName,
        status
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this flavor?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      
      {/* Top Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Flavors</h2>
          <p className="text-xs text-muted-foreground font-medium">Manage specific flavor variants for catalog products.</p>
        </div>
        
        <div className="flex gap-3 w-full sm:w-auto">
          {/* Dropdown Filter by product */}
          <select
            value={selectedProductIdFilter}
            onChange={(e) => setSelectedProductIdFilter(e.target.value)}
            className="p-2.5 bg-card border border-muted rounded-xl text-xs outline-none focus:ring-1 focus:ring-primary w-full sm:w-56"
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-2xl text-xs hover:opacity-95 shadow-md shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Flavor</span>
          </button>
        </div>
      </div>

      {/* Grid table */}
      {flavorsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : flavors.length > 0 ? (
        <div className="bg-card border border-muted rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary/40 border-b border-muted">
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Flavor Name</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Associated Product</th>
                  <th className="p-4 font-bold text-muted-foreground uppercase text-xs">Status</th>
                  <th className="p-4 font-bold text-muted-foreground text-right uppercase text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flavors.map((flav) => {
                  const matchedProduct = products.find((p) => p.id === flav.product_id);
                  return (
                    <tr key={flav.id} className="border-b border-muted last:border-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-bold text-foreground">{flav.flavor_name}</td>
                      <td className="p-4 text-muted-foreground font-semibold">
                        {matchedProduct?.name || 'Unknown Product'}
                      </td>
                      <td className="p-4">
                        {flav.status === 'active' ? (
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
                            onClick={() => openEditModal(flav)}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors"
                            title="Edit Flavor"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(flav.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                            title="Delete Flavor"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-muted rounded-3xl space-y-3">
          <AlertTriangle className="h-10 w-10 text-primary mx-auto" />
          <h3 className="text-base font-bold">No Flavors Found</h3>
          <p className="text-xs text-muted-foreground">Select another product or create a new flavor entry.</p>
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
                    {editingFlavor ? 'Edit Flavor' : 'Add Product Flavor'}
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
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product</label>
                    <select
                      value={productId}
                      onChange={(e) => setProductId(e.target.value)}
                      disabled={!!editingFlavor}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none disabled:opacity-50"
                      required
                    >
                      <option value="">Select Associated Product</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Flavor Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Watermelon Bubblegum"
                      value={flavorName}
                      onChange={(e) => setFlavorName(e.target.value)}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catalog Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full p-2.5 bg-secondary/50 border border-muted rounded-xl text-sm outline-none"
                    >
                      <option value="active">Active (Visible)</option>
                      <option value="inactive">Inactive (Hidden)</option>
                    </select>
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
                      <span>{editingFlavor ? 'Update' : 'Create'}</span>
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

export default Flavors;
