import React, { useEffect, useState } from 'react';
import { ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Language, ShopConfig } from '../types';
import { getT } from '../i18n/translations';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';

interface HeroProps {
  lang: Language;
  config: ShopConfig;
  onLogoTap: () => void;
}

export const Hero: React.FC<HeroProps> = ({ lang, config, onLogoTap }) => {
  const t = getT(lang);
  const [slideIdx, setSlideIdx] = useState(0);
  const heroImages = (config.heroImages || []).filter(Boolean);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = window.setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [heroImages.length]);

  const title = lang === 'ar' ? config.heroTitleAr : config.heroTitleEn;
  const subtitle = lang === 'ar' ? config.heroSubtitleAr : config.heroSubtitleEn;
  const whatsappMessage =
    lang === 'ar'
      ? 'مرحباً عبيد سيل، أحتاج استفساراً عن صيانة أو تشريج خط.'
      : 'Hello Oubeid Cell, I need help with phone repair or Touch / Alfa recharge.';

  return (
    <section id="top" className="bg-white border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left column: Headline, copy, 2 big action buttons */}
          <div className="lg:col-span-7 flex flex-col justify-between gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onLogoTap}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden border border-black/15 bg-white shrink-0 cursor-pointer active:scale-95 transition-transform"
                  aria-label="Oubeid Cell Emblem"
                >
                  <img
                    src="/logo.png"
                    alt="Oubeid Cell"
                    className="w-full h-full object-cover"
                  />
                </button>
                <div className="text-xs sm:text-sm font-medium text-zinc-600">
                  <span>{t.hero.featuredTag}</span>
                  <span className="mx-2 text-zinc-300">·</span>
                  <span className="text-[#0D0D0D] font-semibold">
                    {lang === 'ar' ? config.addressAr : config.addressEn}
                  </span>
                </div>
              </div>

              <h1
                className="font-display text-3xl sm:text-5xl lg:text-[3.35rem] font-bold tracking-tight text-[#0D0D0D] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                {title}
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 max-w-2xl leading-relaxed">
                {subtitle}
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <a
                  href="#products"
                  className="min-h-[52px] px-7 py-3.5 rounded-xl bg-[#0D0D0D] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 hover:bg-zinc-800 active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  <span>{t.hero.ctaShop}</span>
                  <ArrowDown className="w-4 h-4" />
                </a>

                <a
                  href={buildWhatsAppUrl(config.whatsappNumber, whatsappMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[52px] px-7 py-3.5 rounded-xl border-2 border-[#0D0D0D] bg-white text-[#0D0D0D] font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:bg-[#F2F2F2] active:scale-[0.98] transition-all whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
                  <span>{t.hero.ctaWhatsapp}</span>
                </a>
              </div>
            </div>

            {/* Trust strip */}
            <div className="pt-5 border-t border-black/10 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-zinc-700">
              <span className="text-[#0D0D0D] font-semibold">{t.hero.trust1}</span>
              <span aria-hidden="true" className="text-zinc-300">•</span>
              <span>{t.hero.trust2}</span>
              <span aria-hidden="true" className="text-zinc-300">•</span>
              <span>
                <span className="text-[#6A2C91] font-semibold">Touch</span>
                {' & '}
                <span className="text-[#E4002B] font-semibold">Alfa</span>
              </span>
              <span aria-hidden="true" className="text-zinc-300">•</span>
              <span>{t.hero.gulfHighlight}</span>
            </div>
          </div>

          {/* Right column: Dark architectural showcase card */}
          <div className="lg:col-span-5">
            <div className="h-full min-h-[300px] sm:min-h-[360px] rounded-2xl bg-[#0D0D0D] text-white p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden border border-black/10">
              {heroImages.length > 0 ? (
                <>
                  <img
                    src={heroImages[slideIdx % heroImages.length]}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />
                  {heroImages.length > 1 && (
                    <div className="relative z-10 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSlideIdx((prev) => (prev - 1 + heroImages.length) % heroImages.length)
                        }
                        className="w-9 h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black cursor-pointer"
                        aria-label="Previous"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlideIdx((prev) => (prev + 1) % heroImages.length)}
                        className="w-9 h-9 rounded-lg bg-black/60 border border-white/20 flex items-center justify-center hover:bg-black cursor-pointer"
                        aria-label="Next"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
                  <div className="flex items-end justify-center gap-4">
                    {/* Studio hardware silhouettes */}
                    <div className="w-28 h-52 rounded-[26px] bg-gradient-to-b from-zinc-700 via-zinc-800 to-zinc-950 border border-white/20 p-3 shadow-2xl flex flex-col justify-between">
                      <div className="w-11 h-11 rounded-xl bg-black/60 border border-white/15 p-1.5 grid grid-cols-2 gap-1">
                        <div className="rounded-full bg-zinc-900 border border-zinc-400" />
                        <div className="rounded-full bg-zinc-900 border border-zinc-400" />
                        <div className="rounded-full bg-zinc-900 border border-zinc-400 col-start-2" />
                      </div>
                      <div className="text-[10px] tracking-widest text-white/50 uppercase text-center">
                        GULF SPEC
                      </div>
                    </div>

                    <div className="w-24 h-44 rounded-2xl bg-gradient-to-b from-[#6A2C91]/50 via-zinc-900 to-black border border-white/20 p-3 shadow-2xl flex flex-col justify-between">
                      <div className="w-7 h-1 rounded-full bg-white/30 mx-auto" />
                      <div className="space-y-1.5">
                        <div className="px-2 py-1 rounded bg-[#6A2C91] text-[10px] font-bold text-white text-center">
                          touch
                        </div>
                        <div className="px-2 py-1 rounded bg-[#E4002B] text-[10px] font-bold text-white text-center">
                          alfa
                        </div>
                      </div>
                      <div className="text-[9px] text-white/60 text-center tabular-nums">
                        {config.phoneDisplay}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-zinc-300">
                    {lang === 'ar' ? config.hoursAr : config.hoursEn}
                  </div>
                  <div className="text-base font-bold tabular-nums tracking-wide">
                    {config.phoneDisplay}
                  </div>
                </div>
                <a
                  href="#telecom"
                  className="px-3.5 py-2 rounded-lg bg-white text-[#0D0D0D] text-xs font-semibold hover:bg-zinc-200 transition-colors whitespace-nowrap"
                >
                  Touch &amp; Alfa
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
