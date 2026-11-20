import type { CartItem, Language, Product, TelecomPlan } from '../types';

export function buildWhatsAppUrl(whatsappNumber: string, message: string): string {
  const cleanNum = whatsappNumber.replace(/[^0-9]/g, '') || '9613048511';
  return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppMessage(
  lang: Language,
  product: Product,
  selectedStorage?: string,
  selectedColor?: string
): string {
  const name = lang === 'ar' ? product.nameAr : product.nameEn;
  const condition =
    lang === 'ar'
      ? product.condition === 'new'
        ? 'جديد'
        : 'مستعمل'
      : product.condition === 'new'
        ? 'New'
        : 'Used';
  const options = [selectedStorage, selectedColor].filter(Boolean).join(' / ');

  if (lang === 'ar') {
    return [
      'مرحباً عبيد سيل، أود طلب المنتج التالي:',
      `• المنتج: ${name}`,
      options ? `• الخيار: ${options}` : null,
      `• الحالة: ${condition}`,
      `• السعر: $${product.priceUsd}`,
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    'Hello Oubeid Cell, I would like to order:',
    `• Product: ${name}`,
    options ? `• Option: ${options}` : null,
    `• Condition: ${condition}`,
    `• Price: $${product.priceUsd}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildTelecomWhatsAppMessage(lang: Language, plan: TelecomPlan): string {
  const carrier = plan.carrier === 'touch' ? 'Touch' : 'Alfa';
  const title = lang === 'ar' ? plan.titleAr : plan.titleEn;
  if (lang === 'ar') {
    return `مرحباً عبيد سيل، أود طلب خدمة ${carrier}:\n• ${title}\n• السعر: $${plan.priceUsd}`;
  }
  return `Hello Oubeid Cell, I would like to order ${carrier}:\n• ${title}\n• Price: $${plan.priceUsd}`;
}

export function buildRepairFormWhatsAppMessage(
  lang: Language,
  model: string,
  problem: string
): string {
  if (lang === 'ar') {
    return `مرحباً عبيد سيل، أحتاج تسعيرة صيانة:\n• موديل الهاتف: ${model}\n• المشكلة: ${problem}`;
  }
  return `Hello Oubeid Cell, I need a repair quote:\n• Phone Model: ${model}\n• Problem: ${problem}`;
}

export function buildCartWhatsAppMessage(lang: Language, items: CartItem[], totalUsd: number): string {
  const lines = items.map((item, idx) => {
    const name = lang === 'ar' ? item.nameAr : item.nameEn;
    const cond =
      lang === 'ar'
        ? item.condition === 'new'
          ? 'جديد'
          : 'مستعمل'
        : item.condition === 'new'
          ? 'New'
          : 'Used';
    const opt = [item.storage, item.color].filter(Boolean).join(' / ');
    return `${idx + 1}. ${name}${opt ? ` (${opt})` : ''} [${cond}] × ${item.quantity} — $${item.priceUsd * item.quantity}`;
  });

  if (lang === 'ar') {
    return ['مرحباً عبيد سيل، أود تأكيد الطلب التالي:', ...lines, `المجموع: $${totalUsd}`].join('\n');
  }
  return ['Hello Oubeid Cell, I would like to order:', ...lines, `Total: $${totalUsd}`].join('\n');
}
