import api from './api';
import { Category, Product, Flavor, Banner } from './catalogService';

export const adminService = {
  // Categories CRUD
  createCategory: async (category: Partial<Category>): Promise<{ status: string; data: { category: Category } }> => {
    const response = await api.post('/categories', category);
    return response.data;
  },
  updateCategory: async (id: string, category: Partial<Category>): Promise<{ status: string; data: { category: Category } }> => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },

  // Products CRUD
  createProduct: async (product: Partial<Product> & { flavors?: string[] }): Promise<{ status: string; data: { product: Product } }> => {
    const response = await api.post('/products', product);
    return response.data;
  },
  updateProduct: async (id: string, product: Partial<Product>): Promise<{ status: string; data: { product: Product } }> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  // Flavors CRUD
  createFlavor: async (flavor: { product_id: string; flavor_name: string; status?: string }): Promise<{ status: string; data: { flavor: Flavor } }> => {
    const response = await api.post('/flavors', flavor);
    return response.data;
  },
  updateFlavor: async (id: string, flavor: Partial<Flavor>): Promise<{ status: string; data: { flavor: Flavor } }> => {
    const response = await api.put(`/flavors/${id}`, flavor);
    return response.data;
  },
  deleteFlavor: async (id: string): Promise<void> => {
    await api.delete(`/flavors/${id}`);
  },

  // Banners CRUD
  createBanner: async (banner: Partial<Banner>): Promise<{ status: string; data: { banner: Banner } }> => {
    const response = await api.post('/banners', banner);
    return response.data;
  },
  updateBanner: async (id: string, banner: Partial<Banner>): Promise<{ status: string; data: { banner: Banner } }> => {
    const response = await api.put(`/banners/${id}`, banner);
    return response.data;
  },
  deleteBanner: async (id: string): Promise<void> => {
    await api.delete(`/banners/${id}`);
  },

  // Image upload using FormData
  uploadImage: async (file: File): Promise<{ status: string; data: { url: string; thumbnailUrl: string } }> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default adminService;
