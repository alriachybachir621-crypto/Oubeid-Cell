import React from 'react';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import type { CartItem, Language, Product } from '../types';
import { getT } from '../i18n/translations';
import { buildCartWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductArtwork } from './ProductArtwork';
import { WhatsAppIcon } from './WhatsAppIcon';

interface CartWishlistDrawerProps {
  lang: Language;
  mode: 'cart' | 'wishlist' | null;
  cartItems: CartItem[];
  wishlistProducts: Product[];
  whatsappNumber: string;
  onClose: () => void;
  onUpdateQty: (key: string, delta: number) => void;
  onRemoveCartItem: (key: string) => void;
  onClearCart: () => void;
  onToggleWishlist: (productId: string) => void;
  onMoveWishlistToCart: (product: Product) => void;
}

export const CartWishlistDrawer: React.FC<CartWishlistDrawerProps> = ({
  lang,
  mode,
  cartItems,
  wishlistProducts,
  whatsappNumber,
  onClose,
  onUpdateQty,
  onRemoveCartItem,
  onClearCart,
  onToggleWishlist,
  onMoveWishlistToCart,
}) => {
  const t = getT(lang);
  if (!mode) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.priceUsd * item.quantity, 0);
  const waOrderUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildCartWhatsAppMessage(lang, cartItems, subtotal)
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col justify-between shadow-2xl border-s border-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-black/10 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-[#0D0D0D]">
            {mode === 'cart' ? t.cart.titleCart : t.cart.titleWishlist}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl border border-black/15 flex items-center justify-center hover:bg-[#F2F2F2] cursor-pointer"
            aria-label={t.manager.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {mode === 'cart' ? (
            cartItems.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-500">{t.cart.emptyCart}</div>
            ) : (
              cartItems.map((item) => {
                const name = lang === 'ar' ? item.nameAr : item.nameEn;
                const opts = [item.storage, item.color].filter(Boolean).join(' / ');
                return (
                  <div
                    key={item.key}
                    className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex gap-3.5"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-black/10 shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ProductArtwork artworkKey={item.artworkKey} brand={item.brand} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-[#0D0D0D] truncate">
                            {name}
                          </div>
                          {opts && <div className="text-xs text-zinc-500">{opts}</div>}
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveCartItem(item.key)}
                          className="text-zinc-400 hover:text-[#E4002B] p-1 cursor-pointer"
                          aria-label={t.cart.remove}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-white rounded-lg border border-black/10 p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, -1)}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#F2F2F2] cursor-pointer"
                            aria-label="Decrease"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.key, 1)}
                            className="w-7 h-7 rounded flex items-center justify-center hover:bg-[#F2F2F2] cursor-pointer"
                            aria-label="Increase"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-sm font-bold text-[#0D0D0D] tabular-nums">
                          ${item.priceUsd * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          ) : wishlistProducts.length === 0 ? (
            <div className="py-16 text-center text-sm text-zinc-500">{t.cart.emptyWishlist}</div>
          ) : (
            wishlistProducts.map((product) => {
              const name = lang === 'ar' ? product.nameAr : product.nameEn;
              return (
                <div
                  key={product.id}
                  className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex gap-3.5"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-black/10 shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProductArtwork
                        artworkKey={product.artworkKey}
                        category={product.category}
                        brand={product.brand}
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-[#0D0D0D] truncate">{name}</div>
                      <div className="text-xs font-bold text-[#0D0D0D] tabular-nums">
                        ${product.priceUsd}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => onMoveWishlistToCart(product)}
                        className="flex-1 min-h-[36px] px-3 rounded-lg bg-[#0D0D0D] text-white text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t.cart.moveToCart}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(product.id)}
                        className="min-h-[36px] px-3 rounded-lg bg-white border border-black/15 text-xs font-semibold text-zinc-700 hover:text-[#E4002B] cursor-pointer"
                      >
                        {t.cart.remove}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer for Cart */}
        {mode === 'cart' && cartItems.length > 0 && (
          <div className="p-5 border-t border-black/10 bg-[#F2F2F2]/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-600">{t.cart.subtotal}</span>
              <span className="text-xl font-bold text-[#0D0D0D] tabular-nums">${subtotal}</span>
            </div>

            <a
              href={waOrderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0D0D0D] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              <span>{t.cart.sendOrder}</span>
            </a>

            <button
              type="button"
              onClick={onClearCart}
              className="w-full min-h-[40px] text-xs font-semibold text-zinc-500 hover:text-[#E4002B] cursor-pointer"
            >
              {t.cart.clearCart}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
