import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { catalogService, Product } from '../services/catalogService';
import { ShieldCheck, ArrowLeft, RefreshCw, Layers, Sparkles, Check, Heart, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Mock product detail values as fallback
const mockProductDetails: Record<string, Product> = {
  'apex-10k-disposable': {
    id: 'p1',
    category_id: 'c1',
    name: 'Apex 10k Disposable',
    slug: 'apex-10k-disposable',
    description: 'The Apex 10k disposable vape features an integrated 650mAh Type-C rechargeable battery, a built-in LED indicator panel tracking real-time liquid volume and battery percentages, and custom dual-mesh coil technology. Delivers up to 10,000 puffs of vibrant aroma with adjustable bottom airflow controls.',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600',
    puff_count: 10000,
    nicotine_strength: 5.0,
    price: 21.99,
    availability: 'in_stock',
    status: 'active',
    created_at: '',
    category_name: 'Disposable Vapes',
    category_slug: 'disposable-vapes',
    flavors: [
      { id: 'f1', product_id: 'p1', flavor_name: 'Blue Razz Ice', status: 'active' },
      { id: 'f2', product_id: 'p1', flavor_name: 'Watermelon Bubblegum', status: 'active' },
      { id: 'f3', product_id: 'p1', flavor_name: 'Strawberry Kiwi', status: 'active' },
      { id: 'f4', product_id: 'p1', flavor_name: 'Mint Chill', status: 'active' }
    ],
    images: [
      { id: 'img1', product_id: 'p1', image_url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=600', sort_order: 0 },
      { id: 'img2', product_id: 'p1', image_url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600', sort_order: 1 }
    ]
  },
  'lite-bar-5000': {
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
    category_slug: 'disposable-vapes',
    flavors: [
      { id: 'f5', product_id: 'p2', flavor_name: 'Mango Peach', status: 'active' },
      { id: 'f6', product_id: 'p2', flavor_name: 'Grape Soda', status: 'active' },
      { id: 'f7', product_id: 'p2', flavor_name: 'Double Apple', status: 'active' }
    ],
    images: [
      { id: 'img3', product_id: 'p2', image_url: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600', sort_order: 0 }
    ]
  },
  'pulse-pod-kit': {
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
    category_slug: 'pod-systems',
    flavors: [
      { id: 'f8', product_id: 'p3', flavor_name: 'Classic Charcoal', status: 'active' },
      { id: 'f9', product_id: 'p3', flavor_name: 'Aurora Blue', status: 'active' },
      { id: 'f10', product_id: 'p3', flavor_name: 'Sunset Pink', status: 'active' }
    ],
    images: [
      { id: 'img4', product_id: 'p3', image_url: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600', sort_order: 0 }
    ]
  },
  'cloud-nine-strawberry-ice-salt': {
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
    category_slug: 'e-liquids',
    flavors: [
      { id: 'f11', product_id: 'p4', flavor_name: '35mg Salt Nic', status: 'active' },
      { id: 'f12', product_id: 'p4', flavor_name: '50mg Salt Nic', status: 'active' }
    ],
    images: [
      { id: 'img5', product_id: 'p4', image_url: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=600', sort_order: 0 }
    ]
  }
};

const fallbackRelatedProducts = [
  {
    id: 'p2',
    name: 'Lite Bar 5000',
    slug: 'lite-bar-5000',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?q=80&w=600',
    category_name: 'Disposable Vapes',
    availability: 'in_stock',
    puff_count: 5000,
    nicotine_strength: 5.0
  },
  {
    id: 'p3',
    name: 'Pulse Pod System Kit',
    slug: 'pulse-pod-kit',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1606166325012-7da4a0fc06d9?q=80&w=600',
    category_name: 'Pod Systems',
    availability: 'in_stock',
    puff_count: null,
    nicotine_strength: 0.0
  }
];

export const ProductDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedFlavor, setSelectedFlavor] = useState<string>('');

  // Main Query
  const { data: productRes, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => catalogService.getProduct(slug || ''),
    enabled: !!slug,
    retry: 1,
  });

  // Related products query
  const categoryId = productRes?.data?.product?.category_id;
  const { data: relatedRes } = useQuery({
    queryKey: ['related-products', categoryId],
    queryFn: () => catalogService.getProducts({ category_id: categoryId, limit: 4 }),
    enabled: !!categoryId,
    retry: 1,
  });

  const product = productRes?.data?.product || mockProductDetails[slug || ''];
  const relatedProducts = relatedRes?.data?.products?.filter(p => p.id !== product?.id) || fallbackRelatedProducts;

  // Set initial selected image and flavor on product load
  React.useEffect(() => {
    if (product) {
      setSelectedImage(product.image);
      if (product.flavors && product.flavors.length > 0) {
        setSelectedFlavor(product.flavors[0].flavor_name);
      }
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-muted-foreground mt-4 font-medium">Fetching details...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <h3 className="text-xl font-bold">Product Not Found</h3>
        <p className="text-sm text-muted-foreground">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-2xl text-sm">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'main', image_url: product.image, sort_order: 0 }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Back link */}
      <div>
        <Link
          to={`/category/${product.category_slug || 'disposable-vapes'}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Category</span>
        </Link>
      </div>

      {/* Main product showcase sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Image Showcase (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-secondary/35 border border-muted rounded-3xl p-6 flex items-center justify-center relative overflow-hidden">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={selectedImage || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-2xl"
            />
          </div>

          {/* Secondary images thumb list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-20 h-20 shrink-0 bg-secondary/35 border rounded-2xl p-2 flex items-center justify-center transition-all ${
                    selectedImage === img.image_url ? 'border-primary ring-2 ring-primary/20' : 'border-muted'
                  }`}
                >
                  <img
                    src={img.image_url}
                    alt="Product Thumbnail"
                    className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-lg"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Specs & Copy (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-widest text-primary dark:text-violet-400">
              {product.category_name}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {product.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-2xl font-extrabold">${Number(product.price).toFixed(2)}</span>
              
              {product.availability === 'in_stock' ? (
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                  In Stock
                </span>
              ) : (
                <span className="bg-zinc-500/10 border border-zinc-500/20 text-zinc-600 dark:text-zinc-400 text-xs font-bold py-1 px-3 rounded-full uppercase tracking-wider">
                  Out of Stock
                </span>
              )}

              {product.puff_count && (
                <span className="bg-primary/10 border border-primary/20 text-primary text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1 uppercase tracking-wider">
                  <Sparkles className="h-3.5 w-3.5" />
                  {product.puff_count} Puffs
                </span>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Flavor Selector */}
          {product.flavors && product.flavors.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-muted">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Flavor Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedFlavor(f.flavor_name)}
                    className={`px-4 py-2 border text-sm font-semibold rounded-2xl transition-all ${
                      selectedFlavor === f.flavor_name
                        ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'border-muted hover:border-foreground hover:bg-secondary text-foreground'
                    }`}
                  >
                    {f.flavor_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specs Sheet Grid */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-muted">
            <div className="p-4 bg-secondary/35 rounded-2xl border border-muted flex items-start gap-3">
              <Layers className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Nicotine Strength</span>
                <span className="text-sm font-bold">{product.nicotine_strength}% Salt Nic</span>
              </div>
            </div>
            <div className="p-4 bg-secondary/35 rounded-2xl border border-muted flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Verification</span>
                <span className="text-sm font-bold">21+ Age Verification</span>
              </div>
            </div>
          </div>

          {/* Informational Disclaimer Box */}
          <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-muted rounded-2xl flex gap-3 text-muted-foreground text-xs leading-relaxed">
            <HelpCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-foreground">Informational Catalog Disclaimer:</span> This website is strictly informational. Products listed here are nicotine formulations. Nicotine is an addictive substance. Ordering options are currently offline.
            </div>
          </div>

        </div>
      </div>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-12 border-t border-muted">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">You Might Also Like</h2>
            <p className="text-sm text-muted-foreground mt-1">Other products in the same category.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                className="group bg-card text-card-foreground rounded-3xl border border-muted hover:shadow-xl hover:border-primary/20 transition-all flex flex-col overflow-hidden"
              >
                <div className="relative aspect-square bg-secondary/30 flex items-center justify-center p-4">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  {prod.puff_count && (
                    <span className="absolute bottom-4 right-4 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold py-1 px-2.5 rounded-full uppercase tracking-wider">
                      {prod.puff_count} Puffs
                    </span>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link
                      to={`/product/${prod.slug}`}
                      className="text-sm font-bold text-foreground hover:text-primary transition-colors block line-clamp-1"
                    >
                      {prod.name}
                    </Link>
                    <span className="text-xs text-muted-foreground mt-1 block">${Number(prod.price).toFixed(2)}</span>
                  </div>
                  <Link
                    to={`/product/${prod.slug}`}
                    className="w-full text-center mt-4 py-2 bg-secondary hover:bg-primary hover:text-primary-foreground text-foreground text-xs font-semibold rounded-xl transition-all block"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
