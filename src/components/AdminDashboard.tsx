import React, { useState } from 'react';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
  updatePassword,
} from 'firebase/auth';
import { deleteDoc, doc, setDoc } from 'firebase/firestore';
import {
  KeyRound,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  PASSCODE_SUFFIX,
  auth,
  db,
  handleFirestoreError,
  OperationType,
  uploadImageToStorage,
} from '../firebase';
import {
  DEFAULT_GALLERY,
  DEFAULT_PRODUCTS,
  DEFAULT_REPAIRS,
  DEFAULT_SERVICES,
  DEFAULT_TELECOM_PLANS,
} from '../data/defaults';
import { getT } from '../i18n/translations';
import type {
  Brand,
  GalleryItem,
  Language,
  Product,
  ProductCategory,
  ProductCondition,
  RepairItem,
  ServiceItem,
  ShopConfig,
  TelecomPlan,
} from '../types';

interface AdminDashboardProps {
  lang: Language;
  open: boolean;
  onClose: () => void;
  config: ShopConfig;
  products: Product[];
  services: ServiceItem[];
  telecomPlans: TelecomPlan[];
  repairs: RepairItem[];
  gallery: GalleryItem[];
  hasFirestoreProducts: boolean;
}

type AdminTab = 'products' | 'services' | 'telecom' | 'repairs' | 'gallery' | 'shop';

function slugId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lang,
  open,
  onClose,
  config,
  products,
  services,
  telecomPlans,
  repairs,
  gallery,
  hasFirestoreProducts,
}) => {
  const t = getT(lang);
  const [activeTab, setActiveTab] = useState<AdminTab>('products');
  const [busy, setBusy] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Change PIN modal state
  const [showChangePin, setShowChangePin] = useState(false);
  const [curPin, setCurPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');

  // Product editor state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [storageInput, setStorageInput] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Service editor state
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Telecom editor state
  const [editingPlan, setEditingPlan] = useState<TelecomPlan | null>(null);

  // Repair editor state
  const [editingRepair, setEditingRepair] = useState<RepairItem | null>(null);

  // Gallery editor state
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);

  // Shop config editor state
  const [shopForm, setShopForm] = useState<ShopConfig>(config);
  const [heroUrlInput, setHeroUrlInput] = useState('');

  if (!open) return null;

  const flash = (msg: string) => {
    setStatusMsg(msg);
    window.setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSeedAll = async () => {
    setBusy(true);
    try {
      const { id: _idCfg, ...cfgPayload } = { id: 'main', ...config };
      void _idCfg;
      await setDoc(doc(db, 'shop_config', 'main'), {
        ...cfgPayload,
        updatedAt: new Date().toISOString(),
      });
      await setDoc(doc(db, 'app_meta', 'admin_status'), {
        initialized: true,
        updatedAt: new Date().toISOString(),
      });

      for (const p of DEFAULT_PRODUCTS) {
        const { id, ...data } = p;
        await setDoc(doc(db, 'products', id), { ...data, updatedAt: new Date().toISOString() });
      }
      for (const s of DEFAULT_SERVICES) {
        const { id, ...data } = s;
        await setDoc(doc(db, 'services', id), data);
      }
      for (const tp of DEFAULT_TELECOM_PLANS) {
        const { id, ...data } = tp;
        await setDoc(doc(db, 'telecom_plans', id), data);
      }
      for (const r of DEFAULT_REPAIRS) {
        const { id, ...data } = r;
        await setDoc(doc(db, 'repairs', id), data);
      }
      for (const g of DEFAULT_GALLERY) {
        const { id, ...data } = g;
        await setDoc(doc(db, 'gallery_items', id), data);
      }
      flash('Synced to Firestore');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'seed');
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onClose();
  };

  const handleChangeCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinMsg('');
    if (!/^\d{4}$/.test(curPin) || !/^\d{4}$/.test(newPin)) {
      setPinMsg('Use 4 digits only.');
      return;
    }
    if (newPin !== confirmPin) {
      setPinMsg(t.pin.mismatch);
      return;
    }
    const user = auth.currentUser;
    if (!user) return;
    setBusy(true);
    try {
      const cred = EmailAuthProvider.credential(ADMIN_EMAIL, curPin + PASSCODE_SUFFIX);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPin + PASSCODE_SUFFIX);
      setCurPin('');
      setNewPin('');
      setConfirmPin('');
      setShowChangePin(false);
      flash(t.manager.codeChanged);
    } catch {
      setPinMsg(t.pin.wrongCode);
    } finally {
      setBusy(false);
    }
  };

  const startNewProduct = () => {
    setEditingProduct({
      id: slugId('prod'),
      nameEn: '',
      nameAr: '',
      brand: 'iPhone',
      category: 'phone',
      priceUsd: 0,
      oldPriceUsd: 0,
      condition: 'new',
      storageOptions: ['128GB', '256GB'],
      colorOptions: ['Black'],
      images: [],
      inStock: true,
      isNewArrival: true,
      isOnSale: false,
      gulfSpec: false,
      descriptionEn: '',
      descriptionAr: '',
      sortOrder: products.length + 1,
    });
    setStorageInput('128GB, 256GB');
    setColorInput('Black');
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct({ ...p });
    setStorageInput((p.storageOptions || []).join(', '));
    setColorInput((p.colorOptions || []).join(', '));
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setBusy(true);
    try {
      const { id, ...rest } = editingProduct;
      const payload = {
        nameEn: rest.nameEn.trim(),
        nameAr: rest.nameAr.trim() || rest.nameEn.trim(),
        brand: rest.brand,
        category: rest.category,
        priceUsd: Number(rest.priceUsd) || 0,
        oldPriceUsd: Number(rest.oldPriceUsd) || 0,
        condition: rest.condition,
        storageOptions: storageInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        colorOptions: colorInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        images: (rest.images || []).filter(Boolean),
        inStock: Boolean(rest.inStock),
        isNewArrival: Boolean(rest.isNewArrival),
        isOnSale: Boolean(rest.isOnSale),
        gulfSpec: Boolean(rest.gulfSpec),
        descriptionEn: rest.descriptionEn || '',
        descriptionAr: rest.descriptionAr || '',
        artworkKey: rest.artworkKey || '',
        sortOrder: Number(rest.sortOrder) || 1,
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'products', id), payload);
      setEditingProduct(null);
      flash('Saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `products/${editingProduct.id}`);
    } finally {
      setBusy(false);
    }
  };

  const deleteDocByPath = async (col: string, id: string) => {
    setBusy(true);
    try {
      await deleteDoc(doc(db, col, id));
      flash('Deleted');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `${col}/${id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleProductImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editingProduct) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImageToStorage(file, 'products');
        urls.push(url);
      }
      setEditingProduct({
        ...editingProduct,
        images: [...(editingProduct.images || []), ...urls],
      });
    } finally {
      setBusy(false);
    }
  };

  const saveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;
    setBusy(true);
    try {
      const { id, ...rest } = editingService;
      await setDoc(doc(db, 'services', id), {
        titleEn: rest.titleEn.trim(),
        titleAr: rest.titleAr.trim() || rest.titleEn.trim(),
        descriptionEn: rest.descriptionEn || '',
        descriptionAr: rest.descriptionAr || '',
        icon: rest.icon || 'wrench',
        whatsappMessageEn: rest.whatsappMessageEn || '',
        whatsappMessageAr: rest.whatsappMessageAr || '',
        accent: rest.accent || 'default',
        sortOrder: Number(rest.sortOrder) || 1,
      });
      setEditingService(null);
      flash('Saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `services/${editingService.id}`);
    } finally {
      setBusy(false);
    }
  };

  const savePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setBusy(true);
    try {
      const { id, ...rest } = editingPlan;
      await setDoc(doc(db, 'telecom_plans', id), {
        carrier: rest.carrier,
        type: rest.type,
        titleEn: rest.titleEn.trim(),
        titleAr: rest.titleAr.trim() || rest.titleEn.trim(),
        subtitleEn: rest.subtitleEn || '',
        subtitleAr: rest.subtitleAr || '',
        priceUsd: Number(rest.priceUsd) || 0,
        inStock: Boolean(rest.inStock),
        sortOrder: Number(rest.sortOrder) || 1,
      });
      setEditingPlan(null);
      flash('Saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `telecom_plans/${editingPlan.id}`);
    } finally {
      setBusy(false);
    }
  };

  const saveRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRepair) return;
    setBusy(true);
    try {
      const { id, ...rest } = editingRepair;
      await setDoc(doc(db, 'repairs', id), {
        titleEn: rest.titleEn.trim(),
        titleAr: rest.titleAr.trim() || rest.titleEn.trim(),
        descriptionEn: rest.descriptionEn || '',
        descriptionAr: rest.descriptionAr || '',
        icon: rest.icon || 'wrench',
        startingPriceEn: rest.startingPriceEn || '',
        startingPriceAr: rest.startingPriceAr || '',
        whatsappMessageEn: rest.whatsappMessageEn || '',
        whatsappMessageAr: rest.whatsappMessageAr || '',
        sortOrder: Number(rest.sortOrder) || 1,
      });
      setEditingRepair(null);
      flash('Saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `repairs/${editingRepair.id}`);
    } finally {
      setBusy(false);
    }
  };

  const saveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGallery) return;
    setBusy(true);
    try {
      const { id, ...rest } = editingGallery;
      await setDoc(doc(db, 'gallery_items', id), {
        titleEn: rest.titleEn.trim(),
        titleAr: rest.titleAr.trim() || rest.titleEn.trim(),
        captionEn: rest.captionEn || '',
        captionAr: rest.captionAr || '',
        imageUrl: rest.imageUrl || '',
        artworkKey: rest.artworkKey || 'iphone-pro',
        tag: rest.tag || 'shop',
        sortOrder: Number(rest.sortOrder) || 1,
      });
      setEditingGallery(null);
      flash('Saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `gallery_items/${editingGallery.id}`);
    } finally {
      setBusy(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingGallery) return;
    setBusy(true);
    try {
      const url = await uploadImageToStorage(file, 'gallery');
      setEditingGallery({ ...editingGallery, imageUrl: url });
    } finally {
      setBusy(false);
    }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadImageToStorage(file, 'hero');
        urls.push(url);
      }
      setShopForm({ ...shopForm, heroImages: [...(shopForm.heroImages || []), ...urls] });
    } finally {
      setBusy(false);
    }
  };

  const saveShopConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await setDoc(doc(db, 'shop_config', 'main'), {
        ...shopForm,
        updatedAt: new Date().toISOString(),
      });
      flash('Saved');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'shop_config/main');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-5xl h-full sm:h-[90vh] sm:rounded-2xl border border-black/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-5 py-4 bg-[#0D0D0D] text-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Oubeid Cell" className="w-8 h-8 rounded-full bg-white" />
            <span className="font-display text-base font-bold">{t.manager.title}</span>
            {statusMsg && (
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
                {statusMsg}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowChangePin((v) => !v)}
              className="min-h-[38px] px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{t.manager.changeCode}</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="min-h-[38px] px-3 rounded-lg bg-[#E4002B] hover:bg-[#c20024] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.manager.logout}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              aria-label={t.manager.close}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Change Code drawer */}
        {showChangePin && (
          <form
            onSubmit={handleChangeCode}
            className="px-5 py-4 bg-[#F2F2F2] border-b border-black/10 flex flex-wrap items-end gap-3"
          >
            <div>
              <label className="text-xs font-semibold block mb-1">{t.manager.currentCode}</label>
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                required
                value={curPin}
                onChange={(e) => setCurPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">{t.manager.newCode}</label>
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1">{t.manager.confirmNewCode}</label>
              <input
                type="password"
                maxLength={4}
                inputMode="numeric"
                required
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                className="w-32 h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-4 rounded-lg bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
            >
              {t.manager.save}
            </button>
            {pinMsg && <span className="text-xs font-semibold text-[#E4002B]">{pinMsg}</span>}
          </form>
        )}

        {/* Seed banner if Firestore empty */}
        {!hasFirestoreProducts && (
          <div className="px-5 py-3 bg-[#6A2C91]/10 border-b border-[#6A2C91]/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium text-[#0D0D0D]">{t.manager.seedNotice}</span>
            <button
              type="button"
              disabled={busy}
              onClick={handleSeedAll}
              className="min-h-[36px] px-4 py-1.5 rounded-lg bg-[#6A2C91] text-white text-xs font-semibold hover:bg-[#562277] cursor-pointer"
            >
              {t.manager.seedBtn}
            </button>
          </div>
        )}

        {/* Navigation tabs */}
        <div className="px-5 py-3 border-b border-black/10 flex items-center gap-2 overflow-x-auto bg-white">
          {(
            [
              ['products', t.manager.tabs.products],
              ['services', t.manager.tabs.services],
              ['telecom', t.manager.tabs.telecom],
              ['repairs', t.manager.tabs.repairs],
              ['gallery', t.manager.tabs.gallery],
              ['shop', t.manager.tabs.shop],
            ] as Array<[AdminTab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveTab(key);
                if (key === 'shop') setShopForm(config);
              }}
              className={`min-h-[38px] px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                activeTab === key
                  ? 'bg-[#0D0D0D] text-white'
                  : 'bg-[#F2F2F2] text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* PRODUCTS TAB */}
          {activeTab === 'products' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">{t.manager.tabs.products}</h4>
                <button
                  type="button"
                  onClick={startNewProduct}
                  className="min-h-[40px] px-4 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.manager.add}</span>
                </button>
              </div>

              {editingProduct && (
                <form
                  onSubmit={saveProduct}
                  className="rounded-2xl bg-[#F2F2F2] p-5 border border-black/10 space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Name (English)"
                      value={editingProduct.nameEn}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, nameEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="الاسم (عربي)"
                      value={editingProduct.nameAr}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, nameAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <select
                      value={editingProduct.brand}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, brand: e.target.value as Brand })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      {['iPhone', 'Samsung', 'Huawei', 'Xiaomi', 'Other'].map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value as ProductCategory,
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="phone">Phone</option>
                      <option value="case">Case</option>
                      <option value="charger">Charger</option>
                      <option value="cable">Cable</option>
                      <option value="earbuds">Earbuds</option>
                      <option value="screen_protector">Screen Protector</option>
                      <option value="accessory">Accessory</option>
                    </select>
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.5"
                      placeholder="Price USD"
                      value={editingProduct.priceUsd}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          priceUsd: Number(e.target.value),
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="number"
                      min={0}
                      step="0.5"
                      placeholder="Old Price USD (optional)"
                      value={editingProduct.oldPriceUsd || ''}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          oldPriceUsd: Number(e.target.value) || 0,
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <select
                      value={editingProduct.condition}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          condition: e.target.value as ProductCondition,
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="used">Used</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Storage / Options (comma separated)"
                      value={storageInput}
                      onChange={(e) => setStorageInput(e.target.value)}
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Colors (comma separated)"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <textarea
                      rows={2}
                      placeholder="Description (English)"
                      value={editingProduct.descriptionEn}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })
                      }
                      className="p-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <textarea
                      rows={2}
                      placeholder="الوصف (عربي)"
                      value={editingProduct.descriptionAr}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, descriptionAr: e.target.value })
                      }
                      className="p-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                  </div>

                  {/* Flags */}
                  <div className="flex flex-wrap gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.inStock}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, inStock: e.target.checked })
                        }
                      />
                      <span>In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isNewArrival}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, isNewArrival: e.target.checked })
                        }
                      />
                      <span>New Arrival</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isOnSale}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, isOnSale: e.target.checked })
                        }
                      />
                      <span>On Sale</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.gulfSpec}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, gulfSpec: e.target.checked })
                        }
                      />
                      <span>Gulf Spec</span>
                    </label>
                  </div>

                  {/* Images upload + URL */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="min-h-[38px] px-3.5 py-2 rounded-lg bg-white border border-black/15 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{busy ? t.manager.uploading : t.manager.uploadImage}</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleProductImagesUpload}
                        />
                      </label>
                      <input
                        type="url"
                        placeholder="Or paste image URL..."
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        className="flex-1 min-w-[180px] h-9 px-3 rounded-lg bg-white border border-black/15 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!imageUrlInput.trim()) return;
                          setEditingProduct({
                            ...editingProduct,
                            images: [...(editingProduct.images || []), imageUrlInput.trim()],
                          });
                          setImageUrlInput('');
                        }}
                        className="h-9 px-3 rounded-lg bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                      >
                        + URL
                      </button>
                    </div>
                    {editingProduct.images?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {editingProduct.images.map((url, idx) => (
                          <div key={url + idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-black/15">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() =>
                                setEditingProduct({
                                  ...editingProduct,
                                  images: editingProduct.images.filter((_, i) => i !== idx),
                                })
                              }
                              className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full bg-black/80 text-white text-[10px] flex items-center justify-center cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="min-h-[40px] px-5 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{t.manager.save}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="min-h-[40px] px-4 rounded-xl bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {p.nameEn} / {p.nameAr}
                      </div>
                      <div className="text-xs text-zinc-600 tabular-nums">
                        {p.brand} · ${p.priceUsd} · {p.inStock ? 'In Stock' : 'Sold Out'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => startEditProduct(p)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                      >
                        {t.manager.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocByPath('products', p.id)}
                        className="p-2 rounded-lg bg-white border border-black/15 text-[#E4002B] cursor-pointer"
                        aria-label={t.manager.delete}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">{t.manager.tabs.services}</h4>
                <button
                  type="button"
                  onClick={() =>
                    setEditingService({
                      id: slugId('svc'),
                      titleEn: '',
                      titleAr: '',
                      descriptionEn: '',
                      descriptionAr: '',
                      icon: 'wrench',
                      whatsappMessageEn: '',
                      whatsappMessageAr: '',
                      accent: 'default',
                      sortOrder: services.length + 1,
                    })
                  }
                  className="min-h-[40px] px-4 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.manager.add}</span>
                </button>
              </div>

              {editingService && (
                <form
                  onSubmit={saveService}
                  className="rounded-2xl bg-[#F2F2F2] p-5 border border-black/10 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Title (EN)"
                      value={editingService.titleEn}
                      onChange={(e) =>
                        setEditingService({ ...editingService, titleEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="العنوان (عربي)"
                      value={editingService.titleAr}
                      onChange={(e) =>
                        setEditingService({ ...editingService, titleAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <select
                      value={editingService.icon}
                      onChange={(e) =>
                        setEditingService({ ...editingService, icon: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="wrench">Wrench (Repair)</option>
                      <option value="sim">SIM / Recharge</option>
                      <option value="smartphone">Smartphone</option>
                      <option value="headphones">Accessories</option>
                      <option value="shield">Shield</option>
                    </select>
                    <select
                      value={editingService.accent || 'default'}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          accent: e.target.value as 'default' | 'touch' | 'alfa',
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="default">Black</option>
                      <option value="touch">Touch Purple</option>
                      <option value="alfa">Alfa Red</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Description (EN)"
                      value={editingService.descriptionEn}
                      onChange={(e) =>
                        setEditingService({ ...editingService, descriptionEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="الوصف (عربي)"
                      value={editingService.descriptionAr}
                      onChange={(e) =>
                        setEditingService({ ...editingService, descriptionAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="WhatsApp Message (EN)"
                      value={editingService.whatsappMessageEn}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          whatsappMessageEn: e.target.value,
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="رسالة واتساب (عربي)"
                      value={editingService.whatsappMessageAr}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          whatsappMessageAr: e.target.value,
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="min-h-[40px] px-5 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="min-h-[40px] px-4 rounded-xl bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {s.titleEn} / {s.titleAr}
                      </div>
                      <div className="text-xs text-zinc-600">{s.descriptionEn}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingService({ ...s })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                      >
                        {t.manager.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocByPath('services', s.id)}
                        className="p-2 rounded-lg bg-white border border-black/15 text-[#E4002B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* TELECOM TAB */}
          {activeTab === 'telecom' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">{t.manager.tabs.telecom}</h4>
                <button
                  type="button"
                  onClick={() =>
                    setEditingPlan({
                      id: slugId('tel'),
                      carrier: 'touch',
                      type: 'topup',
                      titleEn: '',
                      titleAr: '',
                      subtitleEn: '',
                      subtitleAr: '',
                      priceUsd: 0,
                      inStock: true,
                      sortOrder: telecomPlans.length + 1,
                    })
                  }
                  className="min-h-[40px] px-4 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.manager.add}</span>
                </button>
              </div>

              {editingPlan && (
                <form
                  onSubmit={savePlan}
                  className="rounded-2xl bg-[#F2F2F2] p-5 border border-black/10 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <select
                      value={editingPlan.carrier}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          carrier: e.target.value as 'touch' | 'alfa',
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="touch">Touch</option>
                      <option value="alfa">Alfa</option>
                    </select>
                    <select
                      value={editingPlan.type}
                      onChange={(e) =>
                        setEditingPlan({
                          ...editingPlan,
                          type: e.target.value as 'line' | 'topup',
                        })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="line">New Line</option>
                      <option value="topup">Top-Up</option>
                    </select>
                    <input
                      type="text"
                      required
                      placeholder="Title (EN)"
                      value={editingPlan.titleEn}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, titleEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="العنوان (عربي)"
                      value={editingPlan.titleAr}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, titleAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle (EN)"
                      value={editingPlan.subtitleEn}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, subtitleEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="الوصف (عربي)"
                      value={editingPlan.subtitleAr}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, subtitleAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="number"
                      required
                      min={0}
                      step="0.25"
                      placeholder="Price USD"
                      value={editingPlan.priceUsd}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, priceUsd: Number(e.target.value) })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingPlan.inStock}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, inStock: e.target.checked })
                        }
                      />
                      <span>Available</span>
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="min-h-[40px] px-5 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="min-h-[40px] px-4 rounded-xl bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {telecomPlans.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        [{p.carrier.toUpperCase()}] {p.titleEn} · ${p.priceUsd}
                      </div>
                      <div className="text-xs text-zinc-600">{p.titleAr}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingPlan({ ...p })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                      >
                        {t.manager.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocByPath('telecom_plans', p.id)}
                        className="p-2 rounded-lg bg-white border border-black/15 text-[#E4002B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* REPAIRS TAB */}
          {activeTab === 'repairs' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">{t.manager.tabs.repairs}</h4>
                <button
                  type="button"
                  onClick={() =>
                    setEditingRepair({
                      id: slugId('rep'),
                      titleEn: '',
                      titleAr: '',
                      descriptionEn: '',
                      descriptionAr: '',
                      icon: 'monitor',
                      startingPriceEn: '',
                      startingPriceAr: '',
                      whatsappMessageEn: '',
                      whatsappMessageAr: '',
                      sortOrder: repairs.length + 1,
                    })
                  }
                  className="min-h-[40px] px-4 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.manager.add}</span>
                </button>
              </div>

              {editingRepair && (
                <form
                  onSubmit={saveRepair}
                  className="rounded-2xl bg-[#F2F2F2] p-5 border border-black/10 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Repair Title (EN)"
                      value={editingRepair.titleEn}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, titleEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="عنوان الصيانة (عربي)"
                      value={editingRepair.titleAr}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, titleAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Description (EN)"
                      value={editingRepair.descriptionEn}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, descriptionEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="الوصف (عربي)"
                      value={editingRepair.descriptionAr}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, descriptionAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Badge/Estimate (EN)"
                      value={editingRepair.startingPriceEn}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, startingPriceEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="التقدير (عربي)"
                      value={editingRepair.startingPriceAr}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, startingPriceAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <select
                      value={editingRepair.icon}
                      onChange={(e) =>
                        setEditingRepair({ ...editingRepair, icon: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    >
                      <option value="monitor">Screen</option>
                      <option value="battery">Battery</option>
                      <option value="plug">Charging Port</option>
                      <option value="cpu">Software / IC</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="min-h-[40px] px-5 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingRepair(null)}
                      className="min-h-[40px] px-4 rounded-xl bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {repairs.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {r.titleEn} / {r.titleAr}
                      </div>
                      <div className="text-xs text-zinc-600">{r.descriptionEn}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingRepair({ ...r })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                      >
                        {t.manager.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocByPath('repairs', r.id)}
                        className="p-2 rounded-lg bg-white border border-black/15 text-[#E4002B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-display font-bold text-base">{t.manager.tabs.gallery}</h4>
                <button
                  type="button"
                  onClick={() =>
                    setEditingGallery({
                      id: slugId('gal'),
                      titleEn: '',
                      titleAr: '',
                      captionEn: '',
                      captionAr: '',
                      imageUrl: '',
                      tag: 'shop',
                      sortOrder: gallery.length + 1,
                    })
                  }
                  className="min-h-[40px] px-4 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.manager.add}</span>
                </button>
              </div>

              {editingGallery && (
                <form
                  onSubmit={saveGallery}
                  className="rounded-2xl bg-[#F2F2F2] p-5 border border-black/10 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Title (EN)"
                      value={editingGallery.titleEn}
                      onChange={(e) =>
                        setEditingGallery({ ...editingGallery, titleEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      required
                      placeholder="العنوان (عربي)"
                      value={editingGallery.titleAr}
                      onChange={(e) =>
                        setEditingGallery({ ...editingGallery, titleAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Caption (EN)"
                      value={editingGallery.captionEn}
                      onChange={(e) =>
                        setEditingGallery({ ...editingGallery, captionEn: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="التعليق (عربي)"
                      value={editingGallery.captionAr}
                      onChange={(e) =>
                        setEditingGallery({ ...editingGallery, captionAr: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={editingGallery.imageUrl}
                      onChange={(e) =>
                        setEditingGallery({ ...editingGallery, imageUrl: e.target.value })
                      }
                      className="h-10 px-3 rounded-lg bg-white border border-black/15 text-sm"
                    />
                    <label className="h-10 px-3 rounded-lg bg-white border border-black/15 text-xs font-semibold flex items-center gap-2 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{busy ? t.manager.uploading : t.manager.uploadImage}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleGalleryUpload}
                      />
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={busy}
                      className="min-h-[40px] px-5 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGallery(null)}
                      className="min-h-[40px] px-4 rounded-xl bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                    >
                      {t.manager.cancel}
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {gallery.map((g) => (
                  <div
                    key={g.id}
                    className="rounded-xl bg-[#F2F2F2] p-3.5 border border-black/10 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-semibold text-sm">
                        {g.titleEn} / {g.titleAr}
                      </div>
                      <div className="text-xs text-zinc-600">{g.captionEn}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingGallery({ ...g })}
                        className="px-3 py-1.5 rounded-lg bg-white border border-black/15 text-xs font-semibold cursor-pointer"
                      >
                        {t.manager.edit}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDocByPath('gallery_items', g.id)}
                        className="p-2 rounded-lg bg-white border border-black/15 text-[#E4002B] cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SHOP INFO & HERO TAB */}
          {activeTab === 'shop' && (
            <form onSubmit={saveShopConfig} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold block mb-1">Hero Title (EN)</label>
                  <input
                    type="text"
                    required
                    value={shopForm.heroTitleEn}
                    onChange={(e) => setShopForm({ ...shopForm, heroTitleEn: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">العنوان الرئيسي (عربي)</label>
                  <input
                    type="text"
                    required
                    value={shopForm.heroTitleAr}
                    onChange={(e) => setShopForm({ ...shopForm, heroTitleAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Hero Subtitle (EN)</label>
                  <textarea
                    rows={2}
                    value={shopForm.heroSubtitleEn}
                    onChange={(e) => setShopForm({ ...shopForm, heroSubtitleEn: e.target.value })}
                    className="w-full p-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">الوصف (عربي)</label>
                  <textarea
                    rows={2}
                    value={shopForm.heroSubtitleAr}
                    onChange={(e) => setShopForm({ ...shopForm, heroSubtitleAr: e.target.value })}
                    className="w-full p-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">WhatsApp Number (digits)</label>
                  <input
                    type="text"
                    required
                    value={shopForm.whatsappNumber}
                    onChange={(e) => setShopForm({ ...shopForm, whatsappNumber: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Phone Display</label>
                  <input
                    type="text"
                    required
                    value={shopForm.phoneDisplay}
                    onChange={(e) => setShopForm({ ...shopForm, phoneDisplay: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Hours (EN)</label>
                  <input
                    type="text"
                    value={shopForm.hoursEn}
                    onChange={(e) => setShopForm({ ...shopForm, hoursEn: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">ساعات العمل (عربي)</label>
                  <input
                    type="text"
                    value={shopForm.hoursAr}
                    onChange={(e) => setShopForm({ ...shopForm, hoursAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Address (EN)</label>
                  <input
                    type="text"
                    value={shopForm.addressEn}
                    onChange={(e) => setShopForm({ ...shopForm, addressEn: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">العنوان (عربي)</label>
                  <input
                    type="text"
                    value={shopForm.addressAr}
                    onChange={(e) => setShopForm({ ...shopForm, addressAr: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Facebook URL</label>
                  <input
                    type="url"
                    value={shopForm.facebookUrl}
                    onChange={(e) => setShopForm({ ...shopForm, facebookUrl: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Google Maps Embed URL</label>
                  <input
                    type="url"
                    value={shopForm.mapsEmbedUrl}
                    onChange={(e) => setShopForm({ ...shopForm, mapsEmbedUrl: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#F2F2F2] border border-black/15 text-sm"
                  />
                </div>
              </div>

              {/* Hero images */}
              <div className="p-4 rounded-xl bg-[#F2F2F2] border border-black/10 space-y-3">
                <div className="text-xs font-semibold">Hero Showcase Images</div>
                <div className="flex flex-wrap gap-2">
                  <label className="min-h-[38px] px-3.5 py-2 rounded-lg bg-white border border-black/15 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{t.manager.uploadImage}</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleHeroUpload}
                    />
                  </label>
                  <input
                    type="url"
                    placeholder="Or paste hero image URL..."
                    value={heroUrlInput}
                    onChange={(e) => setHeroUrlInput(e.target.value)}
                    className="flex-1 min-w-[180px] h-9 px-3 rounded-lg bg-white border border-black/15 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!heroUrlInput.trim()) return;
                      setShopForm({
                        ...shopForm,
                        heroImages: [...(shopForm.heroImages || []), heroUrlInput.trim()],
                      });
                      setHeroUrlInput('');
                    }}
                    className="h-9 px-3 rounded-lg bg-[#0D0D0D] text-white text-xs font-semibold cursor-pointer"
                  >
                    + URL
                  </button>
                </div>

                {shopForm.heroImages?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {shopForm.heroImages.map((imgUrl, idx) => (
                      <div key={imgUrl + idx} className="relative w-24 h-16 rounded-lg overflow-hidden border border-black/15">
                        <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setShopForm({
                              ...shopForm,
                              heroImages: shopForm.heroImages.filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute top-0.5 end-0.5 w-5 h-5 rounded-full bg-black/80 text-white text-[10px] flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={busy}
                className="min-h-[44px] px-6 rounded-xl bg-[#0D0D0D] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{t.manager.save}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
