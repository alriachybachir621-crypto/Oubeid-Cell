export type Language = 'ar' | 'en';

export type Brand = 'Samsung' | 'iPhone' | 'Huawei' | 'Xiaomi' | 'Other';

export type ProductCategory =
  | 'phone'
  | 'case'
  | 'charger'
  | 'cable'
  | 'earbuds'
  | 'screen_protector'
  | 'accessory';

export type ProductCondition = 'new' | 'used';

export interface ShopConfig {
  heroTitleEn: string;
  heroTitleAr: string;
  heroSubtitleEn: string;
  heroSubtitleAr: string;
  heroImages: string[];
  whatsappNumber: string;
  phoneDisplay: string;
  hoursEn: string;
  hoursAr: string;
  addressEn: string;
  addressAr: string;
  mapsEmbedUrl: string;
  mapsLink: string;
  facebookUrl: string;
  facebookHandle: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  brand: Brand;
  category: ProductCategory;
  priceUsd: number;
  oldPriceUsd?: number;
  condition: ProductCondition;
  storageOptions: string[];
  colorOptions: string[];
  images: string[];
  inStock: boolean;
  isNewArrival: boolean;
  isOnSale: boolean;
  gulfSpec: boolean;
  descriptionEn: string;
  descriptionAr: string;
  artworkKey?: string;
  sortOrder?: number;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  whatsappMessageEn: string;
  whatsappMessageAr: string;
  accent?: 'default' | 'touch' | 'alfa';
  sortOrder?: number;
}

export interface TelecomPlan {
  id: string;
  carrier: 'touch' | 'alfa';
  type: 'line' | 'topup';
  titleEn: string;
  titleAr: string;
  subtitleEn: string;
  subtitleAr: string;
  priceUsd: number;
  inStock: boolean;
  sortOrder?: number;
}

export interface RepairItem {
  id: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  icon: string;
  startingPriceEn: string;
  startingPriceAr: string;
  whatsappMessageEn: string;
  whatsappMessageAr: string;
  sortOrder?: number;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleAr: string;
  captionEn: string;
  captionAr: string;
  imageUrl: string;
  artworkKey?: string;
  tag: 'shop' | 'repair' | 'devices' | 'accessories';
  sortOrder?: number;
}

export interface CartItem {
  key: string;
  productId: string;
  nameEn: string;
  nameAr: string;
  brand: Brand;
  condition: ProductCondition;
  storage?: string;
  color?: string;
  priceUsd: number;
  quantity: number;
  image?: string;
  artworkKey?: string;
}
