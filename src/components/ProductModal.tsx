import React, { useEffect, useState } from 'react';
import { Check, Heart, ShoppingBag, X } from 'lucide-react';
import type { Language, Product } from '../types';
import { getT } from '../i18n/translations';
import { buildProductWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductArtwork } from './ProductArtwork';
import { WhatsAppIcon } from './WhatsAppIcon';

interface ProductModalProps {
  lang: Language;
  product: Product | null;
  whatsappNumber: string;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: (product: Product, storage?: string, color?: string) => void;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  lang,
  product,
  whatsappNumber,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onClose,
}) => {
  const t = getT(lang);
  const [selectedStorage, setSelectedStorage] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    if (!product) return;
    setSelectedStorage(product.storageOptions?.[0] || '');
    setSelectedColor(product.colorOptions?.[0] || '');
    setActiveImageIdx(0);
    setAddedFeedback(false);
  }, [product]);

  if (!product) return null;

  const name = lang === 'ar' ? product.nameAr : product.nameEn;
  const description = lang === 'ar' ? product.descriptionAr : product.descriptionEn;
  const conditionText =
    product.condition === 'new' ? t.products.conditionNew : t.products.conditionUsed;
  const images = product.images?.filter(Boolean) || [];
  const activeImg = images[activeImageIdx];

  const whatsappUrl = buildWhatsAppUrl(
    whatsappNumber,
    buildProductWhatsAppMessage(lang, product, selectedStorage, selectedColor)
  );

  const handleAdd = () => {
    onAddToCart(product, selectedStorage, selectedColor);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-black/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-black/10 flex items-center justify-between gap-4">
          <div className="text-xs font-semibold text-zinc-500">
            {product.brand} · {conditionText}
            {product.gulfSpec ? ` · ${t.products.gulfSpec}` : ''}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className="w-10 h-10 rounded-xl border border-black/15 flex items-center justify-center hover:bg-[#F2F2F2] cursor-pointer"
              aria-label={isWishlisted ? t.products.wishlistRemove : t.products.wishlistAdd}
            >
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-[#E4002B] text-[#E4002B]' : 'text-[#0D0D0D]'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl border border-black/15 flex items-center justify-center hover:bg-[#F2F2F2] cursor-pointer"
              aria-label={t.manager.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Gallery */}
          <div className="md:col-span-6 space-y-3">
            <div className="aspect-[4/3] rounded-2xl bg-[#F2F2F2] overflow-hidden border border-black/8">
              {activeImg ? (
                <img
                  src={activeImg}
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

            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto">
                {images.map((imgUrl, idx) => (
                  <button
                    key={imgUrl + idx}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-14 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer ${
                      idx === activeImageIdx ? 'border-[#0D0D0D]' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${name} ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Purchase module */}
          <div className="md:col-span-6 flex flex-col justify-between gap-5">
            <div className="space-y-4">
              <h3 className="font-display text-2xl font-bold text-[#0D0D0D]">{name}</h3>

              <div className="flex items-baseline gap-3 tabular-nums">
                <span className="text-2xl font-bold text-[#0D0D0D]">${product.priceUsd}</span>
                {product.oldPriceUsd && product.oldPriceUsd > product.priceUsd ? (
                  <span className="text-sm text-zinc-400 line-through">${product.oldPriceUsd}</span>
                ) : null}
                <span
                  className={`text-xs font-semibold ms-auto ${
                    product.inStock ? 'text-emerald-700' : 'text-zinc-500'
                  }`}
                >
                  {product.inStock ? t.products.inStock : t.products.soldOut}
                </span>
              </div>

              {description && (
                <p className="text-sm text-zinc-600 leading-relaxed">{description}</p>
              )}

              {product.storageOptions?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    {t.products.storage}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.storageOptions.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setSelectedStorage(opt)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          selectedStorage === opt
                            ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                            : 'bg-[#F2F2F2] text-[#0D0D0D] border-black/10 hover:bg-zinc-200'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {product.colorOptions?.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-700 block">
                    {t.products.color}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.colorOptions.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          selectedColor === col
                            ? 'bg-[#0D0D0D] text-white border-[#0D0D0D]'
                            : 'bg-[#F2F2F2] text-[#0D0D0D] border-black/10 hover:bg-zinc-200'
                        }`}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2.5 pt-4 border-t border-black/10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#0D0D0D] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                <span>{t.products.orderWhatsapp}</span>
              </a>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAdd}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl border border-black/15 bg-[#F2F2F2] text-[#0D0D0D] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all cursor-pointer"
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-700" />
                    <span>{t.products.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.products.addToCart}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
