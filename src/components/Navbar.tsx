import React from 'react';
import { Globe, Heart, ShoppingBag } from 'lucide-react';
import type { Language } from '../types';
import { getT } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onToggleLang: () => void;
  onLogoTap: () => void;
  wishlistCount: number;
  cartCount: number;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  onLogoTap,
  wishlistCount,
  cartCount,
  onOpenWishlist,
  onOpenCart,
}) => {
  const t = getT(lang);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-black/10">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand lockup with 5-tap logo trigger */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onLogoTap}
            className="w-10 h-10 rounded-full overflow-hidden border border-black/10 bg-white shrink-0 focus-visible:outline-2 focus-visible:outline-[#0D0D0D] active:scale-95 transition-transform cursor-pointer"
            aria-label="Oubeid Cell Logo"
          >
            <img
              src="/logo.png"
              alt="Oubeid Cell"
              className="w-full h-full object-cover"
            />
          </button>
          <a
            href="#top"
            className="font-display text-base sm:text-lg font-bold tracking-tight text-[#0D0D0D] whitespace-nowrap shrink-0"
          >
            {t.brandLatin}
          </a>
        </div>

        {/* Zone 2: Clean single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600">
          <a
            href="#services"
            className="hover:text-[#0D0D0D] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.nav.services}
          </a>
          <a
            href="#products"
            className="hover:text-[#0D0D0D] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.nav.products}
          </a>
          <a
            href="#telecom"
            className="hover:text-[#0D0D0D] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.nav.telecom}
          </a>
          <a
            href="#repair"
            className="hover:text-[#0D0D0D] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.nav.repair}
          </a>
          <a
            href="#contact"
            className="hover:text-[#0D0D0D] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            {t.nav.contact}
          </a>
        </nav>

        {/* Zone 3: Language switch + Wishlist + Cart */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={onToggleLang}
            className="min-h-[40px] px-2.5 sm:px-3 rounded-lg border border-black/15 text-xs font-semibold text-[#0D0D0D] hover:bg-[#F2F2F2] active:scale-[0.97] transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            className="relative min-h-[40px] min-w-[40px] px-2.5 rounded-lg border border-black/15 text-[#0D0D0D] hover:bg-[#F2F2F2] active:scale-[0.97] transition-all flex items-center justify-center cursor-pointer"
            aria-label={t.cart.titleWishlist}
          >
            <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#E4002B] text-[#E4002B]' : ''}`} />
            {wishlistCount > 0 && (
              <span className="ms-1 text-xs font-semibold tabular-nums">{wishlistCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="min-h-[40px] px-3 rounded-lg bg-[#0D0D0D] text-white hover:bg-zinc-800 active:scale-[0.97] transition-all flex items-center gap-1.5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={t.cart.titleCart}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="tabular-nums">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
