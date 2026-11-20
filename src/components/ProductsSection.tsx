import React, { useMemo, useState } from 'react';
import { Heart, Search, ShoppingBag } from 'lucide-react';
import type { Brand, Language, Product, ProductCategory } from '../types';
import { getT } from '../i18n/translations';
import { ProductArtwork } from './ProductArtwork';

interface ProductsSectionProps {
  lang: Language;
  products: Product[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
}

type CategoryFilter = 'all' | 'phone' | 'accessories' | ProductCategory;
type PriceFilter = 'any' | '100' | '400' | '900';

const BRANDS: Array<'all' | Brand> = ['all', 'iPhone', 'Samsung', 'Xiaomi', 'Huawei', 'Other'];

export const ProductsSection: React.FC<ProductsSectionProps> = ({
  lang,
  products,
  wishlistIds,
  onToggleWishlist,
  onSelectProduct,
  onQuickAddToCart,
}) => {
  const t = getT(lang);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [brandFilter, setBrandFilter] = useState<'all' | Brand>('all');
  const [priceFilter, setPriceFilter] = useState<PriceFilter>('any');
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const categoryTabs: Array<{ id: CategoryFilter; label: string }> = [
    { id: 'all', label: t.products.allCategories },
    { id: 'phone', label: t.products.phones },
    { id: 'accessories', label: t.products.accessories },
    { id: 'case', label: t.products.cases },
    { id: 'charger', label: t.products.chargers },
    { id: 'cable', label: t.products.cables },
    { id: 'earbuds', label: t.products.earbuds },
    { id: 'screen_protector', label: t.products.screen_protectors },
  ];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((item) => {
      if (categoryFilter === 'accessories') {
        if (item.category === 'phone') return false;
      } else if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      if (brandFilter !== 'all' && item.brand !== brandFilter) {
        return false;
      }

      if (priceFilter === '100' && item.priceUsd > 100) return false;
      if (priceFilter === '400' && item.priceUsd > 400) return false;
      if (priceFilter === '900' && item.priceUsd > 900) return false;

      if (q) {
        const hay = `${item.nameEn} ${item.nameAr} ${item.brand} ${item.descriptionEn} ${item.descriptionAr}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [products, categoryFilter, brandFilter, priceFilter, search]);

  const resetAll = () => {
    setSearch('');
    setCategoryFilter('all');
    setBrandFilter('all');
    setPriceFilter('any');
  };

  return (
    <section id="products" className="bg-white py-12 sm:py-16 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {t.products.eyebrow}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
              {t.products.title}
            </h2>
            <p className="text-sm text-zinc-600">{t.products.subtitle}</p>
          </div>

          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute top-1/2 -translate-y-1/2 start-3.5 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.products.searchPlaceholder}
              className="w-full min-h-[44px] ps-10 pe-4 rounded-xl bg-[#F2F2F2] border border-black/10 text-sm text-[#0D0D0D] placeholder:text-zinc-500 focus:outline-none focus:border-[#0D0D0D] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 pb-6 border-b border-black/10">
          {/* Category segmented control */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categoryTabs.map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0D0D0D] text-white'
                      : 'bg-[#F2F2F2] text-zinc-700 hover:text-[#0D0D0D] hover:bg-zinc-200/70'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Brand & Price dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value as 'all' | Brand)}
              aria-label={t.products.allBrands}
              className="min-h-[40px] px-3 rounded-lg bg-[#F2F2F2] border border-black/10 text-xs font-semibold text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] cursor-pointer"
            >
              {BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b === 'all' ? t.products.allBrands : b}
                </option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value as PriceFilter)}
              aria-label={t.products.maxPrice}
              className="min-h-[40px] px-3 rounded-lg bg-[#F2F2F2] border border-black/10 text-xs font-semibold text-[#0D0D0D] focus:outline-none focus:border-[#0D0D0D] cursor-pointer"
            >
              <option value="any">{t.products.anyPrice}</option>
              <option value="100">{t.products.under100}</option>
              <option value="400">{t.products.under400}</option>
              <option value="900">{t.products.under900}</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="bg-[#F2F2F2] rounded-2xl p-10 text-center space-y-4">
            <p className="text-sm font-medium text-zinc-700">{t.products.empty}</p>
            <button
              type="button"
              onClick={resetAll}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {t.products.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((product) => {
              const name = lang === 'ar' ? product.nameAr : product.nameEn;
              const isWishlisted = wishlistIds.includes(product.id);
              const firstImg = product.images?.[0];
              const showImg = firstImg && !brokenImages[product.id];
              const conditionText =
                product.condition === 'new' ? t.products.conditionNew : t.products.conditionUsed;
              const stockText = product.inStock ? t.products.inStock : t.products.soldOut;

              // Single crisp corner tag (max 1 to avoid badge spam)
              const cornerTag = !product.inStock
                ? t.products.soldOut
                : product.isOnSale
                  ? t.products.onSale
                  : product.isNewArrival
                    ? t.products.newArrival
                    : null;

              return (
                <article
                  key={product.id}
                  className="group rounded-2xl border border-black/10 bg-white overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  {/* Visual frame */}
                  <div className="relative aspect-[4/3] bg-[#F2F2F2] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="w-full h-full block cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0D0D0D]"
                      aria-label={name}
                    >
                      {showImg ? (
                        <img
                          src={firstImg}
                          alt={name}
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenImages((prev) => ({ ...prev, [product.id]: true }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                        />
                      ) : (
                        <ProductArtwork
                          artworkKey={product.artworkKey}
                          category={product.category}
                          brand={product.brand}
                          label={name}
                        />
                      )}
                    </button>

                    {cornerTag && (
                      <span
                        className={`absolute top-3 start-3 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide pointer-events-none ${
                          !product.inStock
                            ? 'bg-zinc-900 text-white'
                            : product.isOnSale
                              ? 'bg-[#E4002B] text-white'
                              : 'bg-[#0D0D0D] text-white'
                        }`}
                      >
                        {cornerTag}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      className="absolute top-2.5 end-2.5 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm border border-black/10 flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
                      aria-label={isWishlisted ? t.products.wishlistRemove : t.products.wishlistAdd}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isWishlisted ? 'fill-[#E4002B] text-[#E4002B]' : 'text-[#0D0D0D]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      {/* Clean unboxed metadata */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
                        <span className="font-semibold text-zinc-700">{product.brand}</span>
                        <span aria-hidden="true">·</span>
                        <span>{conditionText}</span>
                        {product.gulfSpec && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-[#6A2C91] font-medium">{t.products.gulfSpec}</span>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="text-start font-display text-base font-bold text-[#0D0D0D] hover:underline underline-offset-4 cursor-pointer"
                      >
                        {name}
                      </button>

                      <div className="flex items-baseline justify-between pt-1">
                        <div className="flex items-baseline gap-2 tabular-nums">
                          <span className="text-lg font-bold text-[#0D0D0D]">
                            ${product.priceUsd}
                          </span>
                          {product.oldPriceUsd && product.oldPriceUsd > product.priceUsd ? (
                            <span className="text-xs text-zinc-400 line-through">
                              ${product.oldPriceUsd}
                            </span>
                          ) : null}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            product.inStock ? 'text-emerald-700' : 'text-zinc-500'
                          }`}
                        >
                          {stockText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-black/8">
                      <button
                        type="button"
                        onClick={() => onSelectProduct(product)}
                        className="flex-1 min-h-[42px] px-3 py-2 rounded-xl bg-[#F2F2F2] text-[#0D0D0D] text-xs font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        {t.products.details}
                      </button>
                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => onQuickAddToCart(product)}
                        className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t.products.addToCart}</span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
