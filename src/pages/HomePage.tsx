import React, { useState } from 'react';
import { ArrowRight, Sparkles, Shield, Compass, ChevronRight, Star, Quote, Tag } from 'lucide-react';
import { Product, Category, HomepageContent, Banner } from '../types';
import { ProductCard } from '../components/products/ProductCard';
import { motion } from 'motion/react';
import { formatINR } from '../utils/currency';

interface HomePageProps {
  products: Product[];
  categories: Category[];
  homepageContent?: HomepageContent | null;
  banners?: Banner[];
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (categorySlug: string) => void;
  onNavigateShop: () => void;
  onNavigateAbout: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  categories,
  homepageContent,
  banners = [],
  onSelectProduct,
  onSelectCategory,
  onNavigateShop,
  onNavigateAbout
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'audio-tech' | 'apparel-wardrobe' | 'minimalist-living'>('all');

  const filteredProducts = products.filter(p => {
    if (activeTab === 'all') return p.isFeatured;
    return p.categorySlug === activeTab;
  });

  const heroFeaturedProduct = products.find(p => p.id === 'prod-aura-pro-headphones') || products[0];

  const activeBanners = banners.filter(b => b.isActive);
  const heroBadge = homepageContent?.heroBadge || '2026 Archive Collection';
  const heroHeadline = homepageContent?.heroHeadline || 'Harmonizing Bespoke Utility With Form.';
  const heroSubheadline =
    homepageContent?.heroSubheadline ||
    'Precision acoustic instruments, tailored virgin Merino textiles, and tactile homeware designed for an intentional, enduring lifestyle.';
  const heroPrimaryText = homepageContent?.heroPrimaryCtaText || 'Explore Catalog';
  const heroSecondaryText = homepageContent?.heroSecondaryCtaText || 'Our Philosophy';

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 sm:pt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Copy */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-800">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{heroBadge}</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-zinc-950 tracking-tight leading-[1.05]">
                {heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-xl font-normal leading-relaxed">
                {heroSubheadline}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  id="hero-explore-btn"
                  onClick={onNavigateShop}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white px-7 py-4 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer group"
                >
                  <span>{heroPrimaryText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="hero-story-btn"
                  onClick={onNavigateAbout}
                  className="bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-900 px-6 py-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {heroSecondaryText}
                </button>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-200/80 max-w-lg">
                <div>
                  <div className="text-2xl font-bold text-zinc-950">99.4%</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">Satisfaction</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-950">2-Year</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">Full Warranty</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-zinc-950">Carbon 0</div>
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mt-0.5">Neutral Cargo</div>
                </div>
              </div>
            </motion.div>

            {/* Right Hero Product Card Showcase */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-tr from-zinc-200 via-zinc-100 to-zinc-50 p-3 shadow-2xl border border-zinc-200/80">
                <div
                  onClick={() => heroFeaturedProduct && onSelectProduct(heroFeaturedProduct)}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={heroFeaturedProduct?.images[0]}
                    alt={heroFeaturedProduct?.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="text-xs uppercase tracking-widest text-amber-300 font-semibold mb-1">
                      Featured Instrument
                    </span>
                    <h3 className="font-display text-xl sm:text-2xl font-bold leading-tight">
                      {heroFeaturedProduct?.name}
                    </h3>
                    <p className="text-xs text-zinc-300 line-clamp-2 mt-1 mb-3">
                      {heroFeaturedProduct?.tagline}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-white">
                        {formatINR(heroFeaturedProduct?.price || 0)}
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-wider bg-white text-zinc-950 px-3 py-1.5 rounded-md group-hover:bg-amber-400 transition-colors">
                        View Details
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Curation by Discipline
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              Explore Collections
            </h2>
          </div>
          <button
            onClick={onNavigateShop}
            className="text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:text-zinc-600 flex items-center gap-1.5 group"
          >
            <span>All Archive Items</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => onSelectCategory(cat.slug)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-100"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-300">
                  {cat.productCount} Instruments
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white mt-0.5 group-hover:text-amber-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {cat.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* DYNAMIC PROMOTIONAL BANNERS FROM ADMIN */}
      {activeBanners.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBanners.map(banner => (
              <div
                key={banner.id}
                className="relative rounded-2xl overflow-hidden bg-zinc-950 text-white min-h-[260px] p-8 flex flex-col justify-end shadow-xl group cursor-pointer"
                onClick={onNavigateShop}
              >
                <div className="absolute inset-0 opacity-40 group-hover:scale-105 transition-transform duration-700">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
                <div className="relative z-10 space-y-2">
                  {banner.badge && (
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-amber-400 text-zinc-950 rounded shadow-xs">
                      {banner.badge}
                    </span>
                  )}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-xs text-zinc-300 max-w-md line-clamp-2">
                      {banner.subtitle}
                    </p>
                  )}
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 group-hover:translate-x-1 transition-transform">
                      <span>{banner.ctaText || 'Explore Collection'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. FEATURED PRODUCTS & TAB SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-zinc-200 pb-5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              Selected Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
              Curated Masterpieces
            </h2>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'All Featured' },
              { id: 'audio-tech', label: 'Audio & Tech' },
              { id: 'apparel-wardrobe', label: 'Apparel' },
              { id: 'minimalist-living', label: 'Living' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-zinc-950 text-white'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} onSelect={onSelectProduct} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button
            onClick={onNavigateShop}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            <span>View Complete 2026 Catalog ({products.length} Items)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. ATELIER EDITORIAL BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-zinc-950 text-white p-8 sm:p-16 lg:p-20 shadow-2xl">
          <div className="absolute inset-0 opacity-25 mix-blend-overlay">
            <img
              src="https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80"
              alt="Atelier Craft Background"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="relative max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <Compass className="w-3.5 h-3.5" />
              <span>Material Provenance</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Designed To Be Kept. <br />
              Never Replaced.
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
              We reject planned obsolescence in all forms. Every audio chassis is milled from solid billet aluminum, our leathers are vegetable-tanned using fallen oak bark in Tuscany, and our ceramics are fired with local earthen clay.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={onNavigateAbout}
                className="bg-white text-zinc-950 hover:bg-zinc-200 px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Read The Atelier Manifesto
              </button>
              <button
                onClick={onNavigateShop}
                className="border border-zinc-700 hover:border-zinc-500 text-zinc-200 px-6 py-3.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors"
              >
                Shop By Material
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CLIENT TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Collector Experiences
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 tracking-tight mt-1">
            Voices From The Atelier
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote:
                'The AURA Pro headphones redefined my daily studio workflow. The acoustic separation and absence of ear fatigue make them a permanent fixture on my desk.',
              author: 'Julian M.',
              role: 'Composer & Sound Designer',
              product: 'AURA Pro ANC Headphones'
            },
            {
              quote:
                'The Komorebi coat has the most commanding silhouette of any wool overcoat I have owned. The heavy drape withstands biting winter winds effortlessly.',
              author: 'Dr. Evelyn Sato',
              role: 'Architectural Historian',
              product: 'Tailored Merino Wool Coat'
            },
            {
              quote:
                'Unboxing the Horizon Chronograph felt like unwrapping a museum relic. The exhibition caseback and sweep of the mechanical seconds hand are pure mechanical art.',
              author: 'Henri Delacroix',
              role: 'Industrial Designer',
              product: 'Horizon Automatic Chronograph'
            }
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <Quote className="w-8 h-8 text-zinc-200 mb-2" />
                <p className="text-sm text-zinc-700 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100">
                <div className="font-semibold text-zinc-950 text-sm">{t.author}</div>
                <div className="text-xs text-zinc-400">{t.role}</div>
                <div className="text-[11px] font-medium text-amber-700 mt-1">Verified Owner · {t.product}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
