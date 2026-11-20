import React from 'react';
import type { Language, TelecomPlan } from '../types';
import { getT } from '../i18n/translations';
import { buildTelecomWhatsAppMessage, buildWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';

interface TelecomSectionProps {
  lang: Language;
  plans: TelecomPlan[];
  whatsappNumber: string;
}

export const TelecomSection: React.FC<TelecomSectionProps> = ({
  lang,
  plans,
  whatsappNumber,
}) => {
  const t = getT(lang);
  const touchPlans = plans.filter((p) => p.carrier === 'touch');
  const alfaPlans = plans.filter((p) => p.carrier === 'alfa');

  const renderPlanRow = (plan: TelecomPlan, carrier: 'touch' | 'alfa') => {
    const title = lang === 'ar' ? plan.titleAr : plan.titleEn;
    const subtitle = lang === 'ar' ? plan.subtitleAr : plan.subtitleEn;
    const typeLabel = plan.type === 'line' ? t.telecom.lineLabel : t.telecom.topupLabel;
    const btnBg =
      carrier === 'touch'
        ? 'bg-[#6A2C91] hover:bg-[#562277] text-white'
        : 'bg-[#E4002B] hover:bg-[#c20024] text-white';

    return (
      <div
        key={plan.id}
        className="bg-white rounded-xl p-4 border border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-zinc-500">{typeLabel}</div>
          <h4 className="font-display text-base font-bold text-[#0D0D0D]">{title}</h4>
          {subtitle && <p className="text-xs text-zinc-600">{subtitle}</p>}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
          <span className="text-lg font-bold text-[#0D0D0D] tabular-nums">
            ${plan.priceUsd}
          </span>
          {plan.inStock ? (
            <a
              href={buildWhatsAppUrl(whatsappNumber, buildTelecomWhatsAppMessage(lang, plan))}
              target="_blank"
              rel="noopener noreferrer"
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 active:scale-[0.98] transition-all whitespace-nowrap ${btnBg}`}
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>{t.telecom.orderNow}</span>
            </a>
          ) : (
            <span className="text-xs font-medium text-zinc-400">{t.telecom.unavailable}</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <section id="telecom" className="bg-[#F2F2F2] py-12 sm:py-16 border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="space-y-1.5 mb-8 max-w-2xl">
          <p className="text-xs font-semibold tracking-wide text-zinc-500 uppercase">
            {t.telecom.eyebrow}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0D0D0D]">
            {t.telecom.title}
          </h2>
          <p className="text-sm text-zinc-600">{t.telecom.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Touch Panel */}
          <div className="rounded-2xl bg-white border border-[#6A2C91]/25 overflow-hidden">
            <div className="bg-[#6A2C91] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-display text-xl font-bold tracking-tight">touch</div>
                <div className="text-xs text-white/80">{t.telecom.touchTitle}</div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                24/7
              </span>
            </div>
            <div className="p-4 sm:p-5 space-y-3 bg-[#F2F2F2]/60">
              {touchPlans.map((plan) => renderPlanRow(plan, 'touch'))}
            </div>
          </div>

          {/* Alfa Panel */}
          <div className="rounded-2xl bg-white border border-[#E4002B]/25 overflow-hidden">
            <div className="bg-[#E4002B] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="font-display text-xl font-bold tracking-tight">alfa</div>
                <div className="text-xs text-white/85">{t.telecom.alfaTitle}</div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/85">
                24/7
              </span>
            </div>
            <div className="p-4 sm:p-5 space-y-3 bg-[#F2F2F2]/60">
              {alfaPlans.map((plan) => renderPlanRow(plan, 'alfa'))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
