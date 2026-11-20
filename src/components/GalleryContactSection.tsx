import React, { useState } from 'react';
import { Clock, ExternalLink, MapPin, Phone } from 'lucide-react';
import type { GalleryItem, Language, ShopConfig } from '../types';
import { getT } from '../i18n/translations';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { ProductArtwork } from './ProductArtwork';
import { WhatsAppIcon } from './WhatsAppIcon';

interface GalleryContactSectionProps {
  lang: Language;
  gallery: GalleryItem[];
  config: ShopConfig;
  onLogoTap: () => void;
}

export const GalleryContactSection: React.FC<GalleryContactSectionProps> = ({
  lang,
  gallery,
  config,
  onLogoTap,
}) => {
  const t = getT(lang);
  const [brokenGallery, setBrokenGallery] = useState<Record<string, boolean>>({});

  const generalWaMsg =
    lang === 'ar'
      ? 'مرحباً عبيد سيل، أتواصل معكم من الموقع.'
      : 'Hello Oubeid Cell, reaching out from your website.';

  return (
    <>
      {/* Gallery + Facebook Section */}
      <section id="gallery" className="bg-[#F2F2F2] py-12 sm:py-16 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                {t.gallery.eyebrow}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
                {t.gallery.title}
              </h2>
              <p className="text-sm text-zinc-600">{t.gallery.subtitle}</p>
            </div>

            <a
              href={config.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#0D0D0D] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all whitespace-nowrap shrink-0"
            >
              <span>{t.gallery.facebookBtn}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gallery.map((item) => {
              const title = lang === 'ar' ? item.titleAr : item.titleEn;
              const caption = lang === 'ar' ? item.captionAr : item.captionEn;
              const showImg = item.imageUrl && !brokenGallery[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden border border-black/10 flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#F2F2F2] overflow-hidden">
                    {showImg ? (
                      <img
                        src={item.imageUrl}
                        alt={title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenGallery((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ProductArtwork artworkKey={item.artworkKey || 'iphone-pro'} />
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-display text-sm font-bold text-[#0D0D0D]">{title}</h3>
                    {caption && <p className="text-xs text-zinc-600 leading-relaxed">{caption}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact & Zahle Google Maps Embed */}
      <section id="contact" className="bg-white py-12 sm:py-16 border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-5 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
                  {t.contact.eyebrow}
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
                  {t.contact.title}
                </h2>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-[#F2F2F2] border border-black/10 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0D0D0D] text-white flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">{t.contact.phoneLabel}</div>
                      <div className="text-base font-bold text-[#0D0D0D] tabular-nums" dir="ltr">
                        {config.phoneDisplay}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F2F2F2] border border-black/10 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0D0D0D] text-white flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">{t.contact.hoursLabel}</div>
                      <div className="text-sm font-bold text-[#0D0D0D]">
                        {lang === 'ar' ? config.hoursAr : config.hoursEn}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#F2F2F2] border border-black/10 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[#0D0D0D] text-white flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs text-zinc-500">{t.contact.addressLabel}</div>
                      <div className="text-sm font-bold text-[#0D0D0D]">
                        {lang === 'ar' ? config.addressAr : config.addressEn}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={buildWhatsAppUrl(config.whatsappNumber, generalWaMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-h-[48px] px-5 py-3 rounded-xl bg-[#0D0D0D] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                >
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                  <span>{t.contact.openWhatsapp}</span>
                </a>
                <a
                  href={`tel:+${config.whatsappNumber}`}
                  className="min-h-[48px] px-5 py-3 rounded-xl border border-black/15 bg-[#F2F2F2] text-[#0D0D0D] text-sm font-semibold flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.contact.callNow}</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col gap-3">
              <div className="w-full h-full min-h-[320px] sm:min-h-[380px] rounded-2xl overflow-hidden border border-black/10 bg-[#F2F2F2]">
                <iframe
                  title="Oubeid Cell Zahle Map"
                  src={config.mapsEmbedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-full min-h-[320px] sm:min-h-[380px] border-0"
                />
              </div>
              {config.mapsLink && (
                <a
                  href={config.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-end text-xs font-semibold text-[#0D0D0D] hover:underline inline-flex items-center gap-1"
                >
                  <span>{t.contact.openMaps}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onLogoTap}
              className="w-12 h-12 rounded-full overflow-hidden border border-white/20 bg-white shrink-0 cursor-pointer active:scale-95 transition-transform"
              aria-label="Oubeid Cell Footer Logo"
            >
              <img
                src="/logo.png"
                alt="Oubeid Cell"
                className="w-full h-full object-cover"
              />
            </button>
            <div>
              <div className="font-display text-base font-bold tracking-tight">OUBEID CELL</div>
              <p className="text-xs text-zinc-400">{t.footer.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-xs text-zinc-400">
            <a
              href={config.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Facebook: {config.facebookHandle}
            </a>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums" dir="ltr">
              {config.phoneDisplay}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              © {new Date().getFullYear()} Oubeid Cell · {t.footer.rights}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
};
