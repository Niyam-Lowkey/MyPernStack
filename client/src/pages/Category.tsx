import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogService } from '../services/catalogService';
import type { Product } from '../services/catalogService';
import { SlidersHorizontal, Search, RotateCcw, AlertTriangle, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock products as fallback for offline mode
const mockCategoryProducts: Record<string, Product[]> = {
  'disposable-vapes': [
    {
      id: 'p1',
      category_id: 'c1',
      name: 'Apex 10k Disposable',
      slug: 'apex-10k-disposable',
      description: 'The Apex 10k features an advanced dual-mesh coil, a clear LED screen indicating battery levels, and robust airflow adjustability. Enjoy 10,000 puffs of dense, flavorful satisfaction.',
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
      description: 'Compact disposable vape pre-filled with premium 5% nicotine salt. Delivers a smooth throat hit with a draw-activated firing mechanism.',
      image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600',
      puff_count: 5000,
      nicotine_strength: 5.0,
      price: 14.99,
      availability: 'in_stock',
      status: 'active',
      created_at: '',
      category_name: 'Disposable Vapes',
      category_slug: 'disposable-vapes'
    }
  ],
  'pod-systems': [
    {
      id: 'p3',
      category_id: 'c2',
      name: 'Pulse Pod System Kit',
      slug: 'pulse-pod-kit',
      description: 'The Pulse Pod Kit is a sleek open-system device featuring an 800mAh battery, custom wattage adjustment (5-30W), and a 2ml refillable pod.',
      image: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600',
      puff_count: null,
      nicotine_strength: 0.0,
      price: 34.99,
      availability: 'in_stock',
      status: 'active',
      created_at: '',
      category_name: 'Pod Systems',
      category_slug: 'pod-systems'
    }
  ],
  'e-liquids': [
    {
      id: 'p4',
      category_id: 'c3',
      name: 'Cloud Nine Strawberry Ice Salt',
      slug: 'cloud-nine-strawberry-ice-salt',
      description: 'Indulge in the flavor of sweet summer strawberries blended with a crisp, cool menthol breeze. Specially formulated for high nicotine salts.',
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
  ]
};

export const Category: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [availability, setAvailability] = useState('');
  const [nicotine, setNicotine] = useState('');
  const [puffMin, setPuffMin] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Queries
  const { data: categoryRes } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => catalogService.getCategory(slug || ''),
    enabled: !!slug,
    retry: 1,
  });

  const { data: productsRes, isLoading: prodsLoading } = useQuery({
    queryKey: ['products', slug, searchTerm, availability, nicotine, puffMin],
    queryFn: () =>
      catalogService.getProducts({
        category: slug,
        search: searchTerm || undefined,
        availability: availability || undefined,
        nicotineStrength: nicotine || undefined,
        puffCountMin: puffMin || undefined,
      }),
    enabled: !!slug,
    retry: 1,
  });

  const category = categoryRes?.data?.category;
  
  // Local/Offline Fallbacks
  const fallbacks = mockCategoryProducts[slug || ''] || [];
  const rawProducts = productsRes?.data?.products?.length ? productsRes.data.products : fallbacks;

  // Filter client-side if using fallbacks
  const products = productsRes?.data?.products?.length 
    ? rawProducts 
    : fallbacks.filter(p => {
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        if (availability && p.availability !== availability) return false;
        if (nicotine && p.nicotine_strength !== parseFloat(nicotine)) return false;
        if (puffMin && (!p.puff_count || p.puff_count < parseInt(puffMin))) return false;
        return true;
      });

  const handleResetFilters = () => {
    setSearchTerm('');
    setAvailability('');
    setNicotine('');
    setPuffMin('');
  };

  const getPuffsDisplay = (count: number | null) => {
    return count ? `${count} Puffs` : 'Refillable';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Category Banner Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border bg-zinc-950 h-56 flex items-center p-8 text-white">
        {category?.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40"
            style={{ backgroundImage: `url(${category.image})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-primary dark:text-violet-400">
            Category
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {category?.name || slug?.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </h2>
          <p className="text-sm text-zinc-300 font-medium line-clamp-2">
            {category?.description || 'Browse our selection of premium quality vaping products.'}
          </p>
        </div>
      </div>

      {/* Main Grid: Filters + List */}
      <div className="flex gap-8 items-start">
        
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden md:block w-64 shrink-0 bg-card border border-muted p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-muted">
            <span className="text-sm font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filters
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Search inside category */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Find product..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-secondary/40 border border-muted rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="w-full p-2.5 bg-secondary/40 border border-muted rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">All Statuses</option>
              <option value="in_stock">In Stock Only</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>

          {/* Nicotine Strength */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strength</label>
            <select
              value={nicotine}
              onChange={(e) => setNicotine(e.target.value)}
              className="w-full p-2.5 bg-secondary/40 border border-muted rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">Any Strength</option>
              <option value="0">Nicotine Free (0%)</option>
              <option value="3">3% Nicotine</option>
              <option value="3.5">3.5% Nicotine</option>
              <option value="5">5% Nicotine</option>
            </select>
          </div>

          {/* Puff Count Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Min Puff Count</label>
            <select
              value={puffMin}
              onChange={(e) => setPuffMin(e.target.value)}
              className="w-full p-2.5 bg-secondary/40 border border-muted rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            >
              <option value="">Any Puff Count</option>
              <option value="1000">1,000+ Puffs</option>
              <option value="3000">3,000+ Puffs</option>
              <option value="5000">5,000+ Puffs</option>
              <option value="8000">8,000+ Puffs</option>
              <option value="10000">10,000+ Puffs</option>
            </select>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="flex-1 space-y-6">
          
          {/* Top Info Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-muted">
            <span className="text-sm text-muted-foreground font-semibold">
              Showing <span className="text-foreground font-bold">{products.length}</span> products
            </span>

            {/* Mobile Filters Trigger */}
            <button
              onClick={() => setShowFiltersMobile(true)}
              className="md:hidden flex items-center gap-1.5 px-4 py-2 bg-secondary border border-muted hover:bg-secondary/80 rounded-xl text-xs font-semibold"
            >
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              <span>Filter Catalog</span>
            </button>
          </div>

          {/* Grid list */}
          {prodsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-muted bg-card rounded-3xl p-5 space-y-4 animate-pulse">
                  <div className="aspect-square bg-secondary/50 rounded-2xl" />
                  <div className="h-4 bg-secondary/50 rounded-md w-1/3" />
                  <div className="h-6 bg-secondary/50 rounded-md w-2/3" />
                  <div className="h-8 bg-secondary/50 rounded-md w-full mt-4" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod, i) => (
                <motion.div
                  key={prod.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group bg-card text-card-foreground rounded-3xl border border-muted hover:shadow-xl hover:border-primary/20 transition-all flex flex-col overflow-hidden"
                >
                  <div className="relative aspect-square overflow-hidden bg-secondary/30 flex items-center justify-center p-4">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />

                    {prod.availability === 'in_stock' ? (
                      <span className="absolute top-4 left-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                        In Stock
                      </span>
                    ) : (
                      <span className="absolute top-4 left-4 bg-zinc-500/10 border border-zinc-500/20 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                        Out of Stock
                      </span>
                    )}

                    {prod.puff_count && (
                      <span className="absolute bottom-4 right-4 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                        <Zap className="h-3 w-3" />
                        {getPuffsDisplay(prod.puff_count)}
                      </span>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                        Nicotine: {prod.nicotine_strength}%
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
                        View Details
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card border border-muted rounded-3xl space-y-4">
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold">No Products Found</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  We couldn't find any products matching your filter selections. Try resetting the filters.
                </p>
              </div>
              <button
                onClick={handleResetFilters}
                className="px-5 py-2 bg-primary text-primary-foreground font-semibold rounded-2xl text-xs hover:opacity-90 shadow-md shadow-primary/20"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFiltersMobile && (
          <>
            {/* Dark Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFiltersMobile(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-card border-t p-6 rounded-t-3xl overflow-y-auto space-y-6 flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-muted">
                <span className="text-base font-bold flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-primary" />
                  Filters
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFiltersMobile(false)}
                    className="text-xs font-bold text-primary"
                  >
                    Done
                  </button>
                </div>
              </div>

              {/* Mobile Inputs */}
              <div className="space-y-4 flex-grow">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</label>
                  <input
                    type="text"
                    placeholder="Find product..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2.5 bg-secondary border border-muted rounded-xl text-sm outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Availability</label>
                  <select
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full p-2.5 bg-secondary border border-muted rounded-xl text-sm"
                  >
                    <option value="">All Statuses</option>
                    <option value="in_stock">In Stock Only</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nicotine Strength</label>
                  <select
                    value={nicotine}
                    onChange={(e) => setNicotine(e.target.value)}
                    className="w-full p-2.5 bg-secondary border border-muted rounded-xl text-sm"
                  >
                    <option value="">Any Strength</option>
                    <option value="0">0% Nicotine</option>
                    <option value="3">3% Nicotine</option>
                    <option value="3.5">3.5% Nicotine</option>
                    <option value="5">5% Nicotine</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Puff Count</label>
                  <select
                    value={puffMin}
                    onChange={(e) => setPuffMin(e.target.value)}
                    className="w-full p-2.5 bg-secondary border border-muted rounded-xl text-sm"
                  >
                    <option value="">Any Puff Count</option>
                    <option value="1000">1,000+ Puffs</option>
                    <option value="3000">3,000+ Puffs</option>
                    <option value="5000">5,000+ Puffs</option>
                    <option value="8000">8,000+ Puffs</option>
                    <option value="10000">10,000+ Puffs</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Category;
