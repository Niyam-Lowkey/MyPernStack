import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';
import type { Product } from '../services/catalogService';
import { Search as SearchIcon, AlertTriangle, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mock list as search fallback for local demo
const mockSearchProducts: Product[] = [
  {
    id: 'p1',
    category_id: 'c1',
    name: 'Apex 10k Disposable',
    slug: 'apex-10k-disposable',
    description: 'The Apex 10k disposable vape features an integrated 650mAh Type-C rechargeable battery.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    puff_count: 10000,
    nicotine_strength: 5.0,
    price: 21.99,
    availability: 'in_stock',
    status: 'active',
    created_at: '',
    category_name: 'Disposable Vapes',
    category_slug: 'disposable-vapes'
  },
  {
    id: 'p2',
    category_id: 'c1',
    name: 'Lite Bar 5000',
    slug: 'lite-bar-5000',
    description: 'Compact disposable vape pre-filled with premium 5% nicotine salt.',
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600',
    puff_count: 5000,
    nicotine_strength: 5.0,
    price: 14.99,
    availability: 'in_stock',
    status: 'active',
    created_at: '',
    category_name: 'Disposable Vapes',
    category_slug: 'disposable-vapes'
  },
  {
    id: 'p3',
    category_id: 'c2',
    name: 'Pulse Pod System Kit',
    slug: 'pulse-pod-kit',
    description: 'Refillable pod kit with adjustable 5-30W power and mesh coils.',
    image: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600',
    puff_count: null,
    nicotine_strength: 0.0,
    price: 34.99,
    availability: 'in_stock',
    status: 'active',
    created_at: '',
    category_name: 'Pod Systems',
    category_slug: 'pod-systems'
  },
  {
    id: 'p4',
    category_id: 'c3',
    name: 'Cloud Nine Strawberry Ice Salt',
    slug: 'cloud-nine-strawberry-ice-salt',
    description: 'Strawberry menthol nicotine salt blend.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600',
    puff_count: null,
    nicotine_strength: 3.5,
    price: 15.99,
    availability: 'in_stock',
    status: 'active',
    created_at: '',
    category_name: 'E-Liquids',
    category_slug: 'e-liquids'
  }
];

export const Search: React.FC = () => {
  const [queryTerm, setQueryTerm] = useState('');

  // Fetch results based on search input
  const { data: searchRes, isLoading } = useQuery({
    queryKey: ['search', queryTerm],
    queryFn: () => catalogService.getProducts({ search: queryTerm }),
    enabled: queryTerm.trim().length > 0,
    retry: 1,
  });

  const rawProducts = searchRes?.data?.products?.length ? searchRes.data.products : mockSearchProducts;

  // Filter local list when database is missing
  const products = queryTerm.trim().length > 0
    ? (searchRes?.data?.products?.length 
        ? rawProducts 
        : mockSearchProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(queryTerm.toLowerCase()) ||
              p.description.toLowerCase().includes(queryTerm.toLowerCase())
          ))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 min-h-[60vh]">
      
      {/* Search Bar Input Container */}
      <div className="max-w-2xl mx-auto space-y-4 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight">Global Product Search</h2>
        <p className="text-sm text-muted-foreground">Type product names or categories to browse inventory.</p>
        
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground">
            <SearchIcon className="h-5 w-5" />
          </span>
          <input
            type="text"
            placeholder="Search flavor profile, puff count, disposable kit..."
            value={queryTerm}
            onChange={(e) => setQueryTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-card border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none rounded-3xl shadow-md"
            autoFocus
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {queryTerm.trim().length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            Please type a keyword above to start searching.
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border border-muted bg-card rounded-3xl p-5 space-y-4">
                <div className="aspect-square bg-secondary/50 rounded-2xl" />
                <div className="h-4 bg-secondary/50 rounded-md w-2/3" />
                <div className="h-4 bg-secondary/50 rounded-md w-1/3" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="pb-4 border-b border-muted">
              <span className="text-sm font-semibold text-muted-foreground">
                Found <span className="text-foreground font-bold">{products.length}</span> results matching "{queryTerm}"
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((prod, i) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card text-card-foreground rounded-3xl border border-muted hover:shadow-xl hover:border-primary/20 transition-all flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary/35 flex items-center justify-center p-4">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl transition-transform duration-300 group-hover:scale-105"
                    />

                    {prod.puff_count && (
                      <span className="absolute bottom-4 right-4 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                        <Zap className="h-3 w-3" />
                        {prod.puff_count} Puffs
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                        {prod.category_name || 'Vape'}
                      </span>
                      <Link
                        to={`/product/${prod.slug}`}
                        className="text-base font-bold text-foreground hover:text-primary transition-colors block line-clamp-1"
                      >
                        {prod.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                        {prod.description}
                      </p>
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-muted mt-4">
                      <span className="text-lg font-extrabold text-foreground">${Number(prod.price).toFixed(2)}</span>
                      <Link
                        to={`/product/${prod.slug}`}
                        className="px-3.5 py-1.5 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold rounded-xl transition-all"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-card border border-muted rounded-3xl space-y-4">
            <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold">No Match Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                We couldn't find any products matching your query. Verify the spelling or try searching generic terms.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Search;
