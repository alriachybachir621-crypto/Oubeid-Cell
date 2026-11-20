import React from 'react';
import { ArrowUpRight, Headphones, Shield, Smartphone, Wrench, Zap } from 'lucide-react';
import type { Language, ServiceItem } from '../types';
import { getT } from '../i18n/translations';
import { buildWhatsAppUrl } from '../utils/whatsapp';

interface ServicesSectionProps {
  lang: Language;
  services: ServiceItem[];
  whatsappNumber: string;
}

function renderServiceIcon(icon: string) {
  switch (icon) {
    case 'wrench':
      return <Wrench className="w-6 h-6" />;
    case 'smartphone':
      return <Smartphone className="w-6 h-6" />;
    case 'headphones':
      return <Headphones className="w-6 h-6" />;
    case 'shield':
      return <Shield className="w-6 h-6" />;
    case 'sim':
    case 'zap':
    default:
      return <Zap className="w-6 h-6" />;
  }
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  lang,
  services,
  whatsappNumber,
}) => {
  const t = getT(lang);

  return (
    <section id="services" className="bg-[#F2F2F2] py-12 sm:py-16 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="space-y-1.5">
            <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
              {t.services.eyebrow}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
              {t.services.title}
            </h2>
          </div>
          <p className="text-sm text-zinc-600 max-w-md">{t.services.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((svc) => {
            const title = lang === 'ar' ? svc.titleAr : svc.titleEn;
            const desc = lang === 'ar' ? svc.descriptionAr : svc.descriptionEn;
            const msg = lang === 'ar' ? svc.whatsappMessageAr : svc.whatsappMessageEn;
            const iconBoxClass =
              svc.accent === 'touch'
                ? 'bg-[#6A2C91] text-white'
                : svc.accent === 'alfa'
                  ? 'bg-[#E4002B] text-white'
                  : 'bg-[#0D0D0D] text-white';

            return (
              <a
                key={svc.id}
                href={buildWhatsAppUrl(whatsappNumber, msg)}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl p-6 border border-black/10 flex flex-col justify-between gap-6 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBoxClass}`}
                    >
                      {renderServiceIcon(svc.icon)}
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-[#0D0D0D] transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-lg font-bold text-[#0D0D0D]">{title}</h3>
                    <p className="text-sm text-zinc-600 leading-relaxed">{desc}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-black/8 text-xs font-semibold text-[#0D0D0D] flex items-center justify-between">
                  <span>{t.services.action}</span>
                  <span className="text-[#25D366]">WhatsApp</span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};
