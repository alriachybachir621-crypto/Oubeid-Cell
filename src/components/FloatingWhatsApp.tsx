import React from 'react';
import type { Language } from '../types';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import { WhatsAppIcon } from './WhatsAppIcon';

interface FloatingWhatsAppProps {
  lang: Language;
  whatsappNumber: string;
}

export const FloatingWhatsApp: React.FC<FloatingWhatsAppProps> = ({
  lang,
  whatsappNumber,
}) => {
  const msg =
    lang === 'ar'
      ? 'مرحباً عبيد سيل، أحتاج مساعدة بخصوص الهواتف أو الصيانة أو التشريج.'
      : 'Hello Oubeid Cell, I have a question about phones, repair, or recharge.';

  return (
    <a
      href={buildWhatsAppUrl(whatsappNumber, msg)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Oubeid Cell"
      className="fixed bottom-5 end-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl border-2 border-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
    >
      <WhatsAppIcon className="w-7 h-7" />
    </a>
  );
};
