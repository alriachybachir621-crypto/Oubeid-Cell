import React, { useState } from 'react';
import { BatteryCharging, Cpu, MonitorSmartphone, PlugZap, Wrench } from 'lucide-react';
import type { Language, RepairItem } from '../types';
import { getT } from '../i18n/translations';
import { buildRepairFormWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';

interface RepairSectionProps {
  lang: Language;
  repairs: RepairItem[];
  whatsappNumber: string;
}

function renderRepairIcon(icon: string) {
  switch (icon) {
    case 'monitor':
      return <MonitorSmartphone className="w-5 h-5" />;
    case 'battery':
      return <BatteryCharging className="w-5 h-5" />;
    case 'plug':
      return <PlugZap className="w-5 h-5" />;
    case 'cpu':
      return <Cpu className="w-5 h-5" />;
    default:
      return <Wrench className="w-5 h-5" />;
  }
}

export const RepairSection: React.FC<RepairSectionProps> = ({
  lang,
  repairs,
  whatsappNumber,
}) => {
  const t = getT(lang);
  const [phoneModel, setPhoneModel] = useState('');
  const [problem, setProblem] = useState('');

  const handleRepairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneModel.trim() || !problem.trim()) return;
    const msg = buildRepairFormWhatsAppMessage(lang, phoneModel.trim(), problem.trim());
    window.open(buildWhatsAppUrl(whatsappNumber, msg), '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="repair" className="bg-white py-12 sm:py-16 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-1.5 mb-8 max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {t.repair.eyebrow}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
            {t.repair.title}
          </h2>
          <p className="text-sm text-zinc-600">{t.repair.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Common repairs list */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {repairs.map((item) => {
              const title = lang === 'ar' ? item.titleAr : item.titleEn;
              const desc = lang === 'ar' ? item.descriptionAr : item.descriptionEn;
              const priceLabel = lang === 'ar' ? item.startingPriceAr : item.startingPriceEn;
              const waMsg =
                (lang === 'ar' ? item.whatsappMessageAr : item.whatsappMessageEn) ||
                (lang === 'ar'
                  ? `مرحباً عبيد سيل، أريد السؤال عن سعر: ${title}`
                  : `Hello Oubeid Cell, I would like a price for: ${title}`);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#F2F2F2] p-5 border border-black/10 flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#0D0D0D] text-white flex items-center justify-center">
                        {renderRepairIcon(item.icon)}
                      </div>
                      {priceLabel && (
                        <span className="text-xs font-semibold text-zinc-600">{priceLabel}</span>
                      )}
                    </div>
                    <h3 className="font-display text-base font-bold text-[#0D0D0D]">{title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">{desc}</p>
                  </div>

                  <a
                    href={buildWhatsAppUrl(whatsappNumber, waMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-white border border-black/15 text-[#0D0D0D] text-xs font-semibold flex items-center justify-center gap-2 hover:bg-[#0D0D0D] hover:text-white active:scale-[0.98] transition-all"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>{t.repair.askPrice}</span>
                  </a>
                </div>
              );
            })}
          </div>

          {/* Interactive repair quote form */}
          <form
            onSubmit={handleRepairSubmit}
            className="lg:col-span-5 rounded-2xl bg-[#0D0D0D] text-white p-6 sm:p-7 space-y-5 border border-black/10"
          >
            <div className="space-y-1.5">
              <h3 className="font-display text-xl font-bold">{t.repair.formTitle}</h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {t.repair.formSubtitle}
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="repair-model" className="text-xs font-semibold text-zinc-200 block">
                  {t.repair.modelLabel}
                </label>
                <input
                  id="repair-model"
                  type="text"
                  required
                  value={phoneModel}
                  onChange={(e) => setPhoneModel(e.target.value)}
                  placeholder={t.repair.modelPlaceholder}
                  className="w-full min-h-[46px] px-4 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="repair-problem" className="text-xs font-semibold text-zinc-200 block">
                  {t.repair.problemLabel}
                </label>
                <textarea
                  id="repair-problem"
                  required
                  rows={3}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  placeholder={t.repair.problemPlaceholder}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-white transition-colors resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-white text-[#0D0D0D] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
            >
              <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
              <span>{t.repair.sendRepair}</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
