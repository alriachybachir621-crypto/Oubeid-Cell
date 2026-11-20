import { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { collection, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { ADMIN_EMAIL, auth, db, handleFirestoreError, OperationType } from './firebase';
import {
  DEFAULT_GALLERY,
  DEFAULT_PRODUCTS,
  DEFAULT_REPAIRS,
  DEFAULT_SERVICES,
  DEFAULT_SHOP_CONFIG,
  DEFAULT_TELECOM_PLANS,
} from './data/defaults';
import type {
  CartItem,
  GalleryItem,
  Language,
  Product,
  RepairItem,
  ServiceItem,
  ShopConfig,
  TelecomPlan,
} from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ServicesSection } from './components/ServicesSection';
import { ProductsSection } from './components/ProductsSection';
import { ProductModal } from './components/ProductModal';
import { TelecomSection } from './components/TelecomSection';
import { RepairSection } from './components/RepairSection';
import { GalleryContactSection } from './components/GalleryContactSection';
import { CartWishlistDrawer } from './components/CartWishlistDrawer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { PinModal } from './components/PinModal';
import { AdminDashboard } from './components/AdminDashboard';

const LANG_KEY = 'oubeid_lang';
const WISHLIST_KEY = 'oubeid_wishlist';
const CART_KEY = 'oubeid_cart';

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const [user, setUser] = useState<User | null>(null);
  const [adminInitialized, setAdminInitialized] = useState(false);

  const [config, setConfig] = useState<ShopConfig>(DEFAULT_SHOP_CONFIG);
  const [fsProducts, setFsProducts] = useState<Product[]>([]);
  const [fsServices, setFsServices] = useState<ServiceItem[]>([]);
  const [fsTelecom, setFsTelecom] = useState<TelecomPlan[]>([]);
  const [fsRepairs, setFsRepairs] = useState<RepairItem[]>([]);
  const [fsGallery, setFsGallery] = useState<GalleryItem[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [drawerMode, setDrawerMode] = useState<'cart' | 'wishlist' | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const tapRef = useRef<{ count: number; lastTap: number }>({ count: 0, lastTap: 0 });

  // Sync HTML lang & dir
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  // Persist wishlist & cart
  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Firestore real-time listeners
  useEffect(() => {
    const unsubConfig = onSnapshot(
      doc(db, 'shop_config', 'main'),
      (snap) => {
        if (snap.exists()) {
          setConfig({ ...DEFAULT_SHOP_CONFIG, ...(snap.data() as Partial<ShopConfig>) });
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'shop_config/main')
    );

    const unsubMeta = onSnapshot(
      doc(db, 'app_meta', 'admin_status'),
      (snap) => {
        if (snap.exists()) {
          setAdminInitialized(Boolean(snap.data()?.initialized));
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, 'app_meta/admin_status')
    );

    const unsubProducts = onSnapshot(
      query(collection(db, 'products'), orderBy('sortOrder', 'asc')),
      (snap) => {
        setFsProducts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Product, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'products')
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'services'), orderBy('sortOrder', 'asc')),
      (snap) => {
        setFsServices(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'services')
    );

    const unsubTelecom = onSnapshot(
      query(collection(db, 'telecom_plans'), orderBy('sortOrder', 'asc')),
      (snap) => {
        setFsTelecom(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<TelecomPlan, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'telecom_plans')
    );

    const unsubRepairs = onSnapshot(
      query(collection(db, 'repairs'), orderBy('sortOrder', 'asc')),
      (snap) => {
        setFsRepairs(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<RepairItem, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'repairs')
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'gallery_items'), orderBy('sortOrder', 'asc')),
      (snap) => {
        setFsGallery(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GalleryItem, 'id'>) }))
        );
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'gallery_items')
    );

    return () => {
      unsubConfig();
      unsubMeta();
      unsubProducts();
      unsubServices();
      unsubTelecom();
      unsubRepairs();
      unsubGallery();
    };
  }, []);

  const products = fsProducts.length > 0 ? fsProducts : DEFAULT_PRODUCTS;
  const services = fsServices.length > 0 ? fsServices : DEFAULT_SERVICES;
  const telecomPlans = fsTelecom.length > 0 ? fsTelecom : DEFAULT_TELECOM_PLANS;
  const repairs = fsRepairs.length > 0 ? fsRepairs : DEFAULT_REPAIRS;
  const gallery = fsGallery.length > 0 ? fsGallery : DEFAULT_GALLERY;

  const isAdminAuthenticated = user?.email === ADMIN_EMAIL;

  const handleLogoTap = () => {
    const now = Date.now();
    if (now - tapRef.current.lastTap > 2500) {
      tapRef.current.count = 1;
    } else {
      tapRef.current.count += 1;
    }
    tapRef.current.lastTap = now;

    if (tapRef.current.count >= 5) {
      tapRef.current.count = 0;
      if (isAdminAuthenticated) {
        setManagerOpen(true);
      } else {
        setPinModalOpen(true);
      }
    }
  };

  const toggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const addToCart = (product: Product, storage?: string, color?: string) => {
    if (!product.inStock) return;
    const optStorage = storage ?? product.storageOptions?.[0] ?? '';
    const optColor = color ?? product.colorOptions?.[0] ?? '';
    const key = `${product.id}__${optStorage}__${optColor}`;

    setCartItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          nameEn: product.nameEn,
          nameAr: product.nameAr,
          brand: product.brand,
          condition: product.condition,
          storage: optStorage || undefined,
          color: optColor || undefined,
          priceUsd: product.priceUsd,
          quantity: 1,
          image: product.images?.[0],
          artworkKey: product.artworkKey,
        },
      ];
    });
  };

  const updateCartQty = (key: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeCartItem = (key: string) => {
    setCartItems((prev) => prev.filter((item) => item.key !== key));
  };

  const wishlistProducts = useMemo(
    () => products.filter((p) => wishlistIds.includes(p.id)),
    [products, wishlistIds]
  );

  const totalCartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  return (
    <div className="min-h-screen bg-white text-[#0D0D0D]">
      <Navbar
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'ar' ? 'en' : 'ar'))}
        onLogoTap={handleLogoTap}
        wishlistCount={wishlistProducts.length}
        cartCount={totalCartCount}
        onOpenWishlist={() => setDrawerMode('wishlist')}
        onOpenCart={() => setDrawerMode('cart')}
      />

      <main>
        <Hero lang={lang} config={config} onLogoTap={handleLogoTap} />

        <ServicesSection
          lang={lang}
          services={services}
          whatsappNumber={config.whatsappNumber}
        />

        <ProductsSection
          lang={lang}
          products={products}
          wishlistIds={wishlistIds}
          onToggleWishlist={toggleWishlist}
          onSelectProduct={setSelectedProduct}
          onQuickAddToCart={(p) => {
            addToCart(p);
            setDrawerMode('cart');
          }}
        />

        <TelecomSection
          lang={lang}
          plans={telecomPlans}
          whatsappNumber={config.whatsappNumber}
        />

        <RepairSection
          lang={lang}
          repairs={repairs}
          whatsappNumber={config.whatsappNumber}
        />

        <GalleryContactSection
          lang={lang}
          gallery={gallery}
          config={config}
          onLogoTap={handleLogoTap}
        />
      </main>

      <FloatingWhatsApp lang={lang} whatsappNumber={config.whatsappNumber} />

      <ProductModal
        lang={lang}
        product={selectedProduct}
        whatsappNumber={config.whatsappNumber}
        isWishlisted={selectedProduct ? wishlistIds.includes(selectedProduct.id) : false}
        onToggleWishlist={toggleWishlist}
        onAddToCart={addToCart}
        onClose={() => setSelectedProduct(null)}
      />

      <CartWishlistDrawer
        lang={lang}
        mode={drawerMode}
        cartItems={cartItems}
        wishlistProducts={wishlistProducts}
        whatsappNumber={config.whatsappNumber}
        onClose={() => setDrawerMode(null)}
        onUpdateQty={updateCartQty}
        onRemoveCartItem={removeCartItem}
        onClearCart={() => setCartItems([])}
        onToggleWishlist={toggleWishlist}
        onMoveWishlistToCart={(p) => {
          addToCart(p);
          setDrawerMode('cart');
        }}
      />

      <PinModal
        lang={lang}
        open={pinModalOpen}
        adminInitialized={adminInitialized}
        onClose={() => setPinModalOpen(false)}
        onSuccess={() => {
          setPinModalOpen(false);
          setManagerOpen(true);
        }}
      />

      {isAdminAuthenticated && (
        <AdminDashboard
          lang={lang}
          open={managerOpen}
          onClose={() => setManagerOpen(false)}
          config={config}
          products={products}
          services={services}
          telecomPlans={telecomPlans}
          repairs={repairs}
          gallery={gallery}
          hasFirestoreProducts={fsProducts.length > 0}
        />
      )}
    </div>
  );
}
