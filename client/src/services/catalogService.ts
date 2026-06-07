import api from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Flavor {
  id: string;
  product_id: string;
  flavor_name: string;
  status: 'active' | 'inactive';
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  puff_count: number | null;
  nicotine_strength: number;
  price: number;
  availability: 'in_stock' | 'out_of_stock' | 'discontinued';
  status: 'active' | 'inactive';
  created_at: string;
  category_name?: string;
  category_slug?: string;
  flavors?: Flavor[];
  images?: ProductImage[];
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  sort_order: number;
  is_active: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductsResponse {
  status: string;
  data: {
    products: Product[];
    pagination: PaginationInfo;
  };
}

export interface ProductDetailResponse {
  status: string;
  data: {
    product: Product;
  };
}

export interface CategoriesResponse {
  status: string;
  data: {
    categories: Category[];
  };
}

export interface BannersResponse {
  status: string;
  data: {
    banners: Banner[];
  };
}

export const catalogService = {
  getCategories: async (adminMode = false): Promise<CategoriesResponse> => {
    const response = await api.get('/categories', {
      params: { admin: adminMode ? 'true' : 'false' },
    });
    return response.data;
  },

  getCategory: async (idOrSlug: string): Promise<{ status: string; data: { category: Category } }> => {
    const response = await api.get(`/categories/${idOrSlug}`);
    return response.data;
  },

  getProducts: async (params?: Record<string, any>): Promise<ProductsResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProduct: async (idOrSlug: string): Promise<ProductDetailResponse> => {
    const response = await api.get(`/products/${idOrSlug}`);
    return response.data;
  },

  getBanners: async (adminMode = false): Promise<BannersResponse> => {
    const response = await api.get('/banners', {
      params: { admin: adminMode ? 'true' : 'false' },
    });
    return response.data;
  },
};

export default catalogService;
