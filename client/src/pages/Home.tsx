import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogService, Product, Category, Banner } from '../services/catalogService';
import { ArrowRight, ChevronLeft, ChevronRight, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock values as fallback to ensure a beautiful UI out-of-the-box
const mockBanners: Banner[] = [
  {
    id: 'b1',
    title: 'Apex 10k Disposable Series',
    subtitle: 'Experience vaping at its absolute peak. 10,000 puffs of pure satisfaction with advanced dual-mesh coils.',
    image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1200',
    link_url: '/product/apex-10k-disposable',
    sort_order: 0,
    is_active: true
  },
  {
    id: 'b2',
    title: 'Sleek Pod Starter Kits',
    subtitle: 'Ultra-portable setups crafted for unmatched daily flexibility and crisp flavor extraction.',
    image_url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=1200',
    link_url: '/category/pod-systems',
    sort_order: 1,
    is_active: true
  }
];

const mockCategories: Category[] = [
  {
    id: 'c1',
    name: 'Disposable Vapes',
    slug: 'disposable-vapes',
    description: 'All-in-one puff devices pre-filled with delicious nic-salts.',
    image: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600',
    status: 'active',
    created_at: ''
  },
  {
    id: 'c2',
    name: 'Pod Systems',
    slug: 'pod-systems',
    description: 'Refillable, rechargeable devices with replaceable pods.',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600',
    status: 'active',
    created_at: ''
  },
  {
    id: 'c3',
    name: 'E-Liquids',
    slug: 'e-liquids',
    description: 'Vibrant juices, freebase e-liquids and nicotine salts.',
    image: 'https://images.unsplash.com/photo-1509315811347-67fd3b15144a?q=80&w=600',
    status: 'active',
    created_at: ''
  }
];

const mockProducts: Product[] = [
  {
    id: 'p1',
    category_id: 'c1',
    name: 'Apex 10k Disposable',
    slug: 'apex-10k-disposable',
    description: 'Rechargeable disposable device featuring dual mesh coils and LED monitoring.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    puff_count: 10000,
    nicotine_strength: 5.0,
    price: 21.99,
    availability: 'in_stock',
    status: 'active',
    created_at: '',
    category_slug: 'disposable-vapes',
    category_name: 'Disposable Vapes'
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
    category_slug: 'disposable-vapes',
    category_name: 'Disposable Vapes'
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
    category_slug: 'pod-systems',
    category_name: 'Pod Systems'
  }
];

export const Home: React.FC = () => {
  const [activeBanner, setActiveBanner] = React.useState(0);

  // Queries
  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => catalogService.getBanners(),
    retry: 1,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories(),
    retry: 1,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => catalogService.getProducts({ limit: 4 }),
    retry: 1,
  });

  // Fallbacks
  const banners = bannersData?.data?.banners?.length ? bannersData.data.banners : mockBanners;
  const categories = categoriesData?.data?.categories?.length ? categoriesData.data.categories : mockCategories;
  const products = productsData?.data?.products?.length ? productsData.data.products : mockProducts;

  const nextBanner = () => {
    setActiveBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setActiveBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  React.useEffect(() => {
    const timer = setInterval(nextBanner, 6000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Hero Slider Section */}
      <section className="relative h-[550px] md:h-[620px] bg-zinc-950 overflow-hidden w-full">
        <AnimatePresence mode="wait">
          {banners.map((banner, index) => {
            if (index !== activeBanner) return null;
            return (
              <motion.div
                key={banner.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${banner.image_url})` }}
                />
                {/* Dark Overlay with Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

                {/* Banner Copy */}
                <div className="absolute inset-0 flex items-center">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl space-y-6">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 border border-primary/30 text-primary text-xs font-bold rounded-full uppercase tracking-wider"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Featured Collection
                      </motion.div>
                      <motion.h2
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight"
                      >
                        {banner.title}
                      </motion.h2>
                      <motion.p
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="text-lg text-zinc-300 font-medium"
                      >
                        {banner.subtitle}
                      </motion.p>
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="pt-4"
                      >
                        <Link
                          to={banner.link_url}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-2xl hover:opacity-95 transition-all shadow-lg shadow-primary/20"
                        >
                          <span>Explore Now</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 flex items-center space-x-2 z-10">
            <button
              onClick={prevBanner}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextBanner}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white backdrop-blur-md transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Browse Categories</h2>
            <p className="text-sm text-muted-foreground mt-1">Select your preferred device architecture.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group relative h-72 rounded-3xl overflow-hidden shadow-lg"
            >
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url(${cat.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

              {/* Copy */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white space-y-2">
                <span className="text-2xl font-bold">{cat.name}</span>
                <p className="text-xs text-zinc-300 line-clamp-2 font-medium">{cat.description}</p>
                <Link
                  to={`/category/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary dark:text-violet-400 group-hover:underline pt-2"
                >
                  <span>Browse Products</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">Featured Series</h2>
            <p className="text-sm text-muted-foreground mt-1">Our most popular designs and performance profiles.</p>
          </div>
          <Link
            to="/category/disposable-vapes"
            className="flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod, i) => (
            <motion.div
              key={prod.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="group bg-card text-card-foreground rounded-3xl border border-muted hover:shadow-xl hover:border-primary/20 transition-all flex flex-col overflow-hidden"
            >
              {/* Product Image */}
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
                    {prod.puff_count} Puffs
                  </span>
                )}
              </div>

              {/* Product Copy */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
                    {prod.category_name}
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
                    Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Trending Flavors Section */}
      <section className="bg-secondary/40 border-y border-muted py-12 px-4 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
          <div className="max-w-2xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Trending Aromas</h2>
            <p className="text-sm text-muted-foreground">
              Voted best-tasting profiles. Select category items to view flavor sheets.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {['Blue Razz Ice', 'Watermelon Bubblegum', 'Strawberry Kiwi', 'Mint Chill', 'Mango Peach', 'Grape Soda', 'Double Apple'].map((flav, i) => (
              <motion.div
                key={flav}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-5 py-2.5 bg-card text-foreground border border-muted hover:border-primary/30 rounded-2xl text-sm font-semibold transition-all hover:shadow-md cursor-default flex items-center gap-1.5"
              >
                <div className="h-2 w-2 rounded-full bg-primary" />
                {flav}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Age Validation Info / Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass p-8 sm:p-12 rounded-3xl border grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold">100% Authentic Products</h4>
              <p className="text-xs text-muted-foreground">Original products direct from licensed manufacturers.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold">Tested Lab Profiles</h4>
              <p className="text-xs text-muted-foreground">Full flavor analysis and strict compliance standards.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold">Age Verified Sales</h4>
              <p className="text-xs text-muted-foreground">Compliance check on checkout for future orders.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
