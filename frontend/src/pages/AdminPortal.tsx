import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi, blogApi, enquiryApi, dashboardApi, setAdminToken, clearAdminToken, getAdminToken, API_BASE_URL, productApi } from '../lib/api';
import type { Blog, Enquiry, DashboardSummary } from '../lib/api';

// ─── Product Types ────────────────────────────────────────────────
type ProductCategory = 'Cocopeat' | 'Coir Fibre' | 'Geotextiles' | 'Chips mixed Cocopeat blocks' | 'Grow bags' | 'Custom';
type ProductStatus = 'Published' | 'Draft' | 'Archived';

interface Product {
  id: number | string;
  name: string;
  sku: string;
  category: string;
  moq: string;
  status: string;
  images: string[];
  description: string;
  specs: { label: string; value: string }[];
  updatedAt: string;
}

const PRODUCT_CATEGORIES: ProductCategory[] = ['Cocopeat', 'Coir Fibre', 'Geotextiles', 'Chips mixed Cocopeat blocks', 'Grow bags', 'Custom'];
const PRODUCT_STATUSES: ProductStatus[] = ['Published', 'Draft', 'Archived'];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Published: { bg: 'rgba(22,163,74,0.1)', color: '#16A34A' },
  Draft: { bg: 'rgba(100,116,139,0.1)', color: '#64748B' },
  Archived: { bg: 'rgba(220,38,38,0.08)', color: '#DC2626' },
};

function getProductImageUrl(img: string | undefined) {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('blob:') || img.startsWith('data:')) {
    return img;
  }
  return `${API_BASE_URL}/uploads/${img}`;
}

// ─── Delete Confirm Modal ─────────────────────────────────────────
function DeleteConfirmModal({ productName, onConfirm, onCancel }: { productName: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
        style={{ background: '#FFFFFF', borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(220,38,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '22px' }}>🗑️</div>
        <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: '8px' }}>Delete Product?</h3>
        <p style={{ fontSize: '14px', color: '#667085', lineHeight: 1.6, marginBottom: '28px' }}>
          Are you sure you want to delete <strong style={{ color: '#111' }}>{productName}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ padding: '11px 22px', background: 'transparent', border: '1px solid #E4E7EC', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#667085' }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding: '11px 22px', background: '#DC2626', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#FFFFFF' }}>Delete Product</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Product Form Drawer ──────────────────────────────────────────
function ProductFormDrawer({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = product !== null;
  const [name, setName] = useState(product?.name ?? '');
  const [sku, setSku] = useState(product?.sku ?? '');
  const [category, setCategory] = useState<string>(product?.category ?? 'Cocopeat');
  const [moq, setMoq] = useState(product?.moq ?? '');
  const [status, setStatus] = useState<string>(product?.status ?? 'Draft');
  const [description, setDescription] = useState(product?.description ?? '');

  const [existingImages, setExistingImages] = useState<string[]>(product?.images ?? []);
  const [newFiles, setNewFiles] = useState<{ id: string; file: File; preview: string }[]>([]);
  const [specs, setSpecs] = useState<{ label: string; value: string }[]>(product?.specs ?? []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const added = Array.from(files).map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewFiles((prev) => [...prev, ...added]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeNewFile = (id: string) => {
    setNewFiles((prev) => {
      const match = prev.find((item) => item.id === id);
      if (match) {
        URL.revokeObjectURL(match.preview);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('sku', sku.trim());
    fd.append('category', category.trim());
    fd.append('moq', moq.trim());
    fd.append('status', status);
    fd.append('description', description.trim());

    // Filter specs that have either label or value
    const filteredSpecs = specs.filter((s) => s.label.trim() && s.value.trim());
    fd.append('specs', JSON.stringify(filteredSpecs));

    if (isEdit) {
      fd.append('existingImages', JSON.stringify(existingImages));
    }

    newFiles.forEach((item) => {
      fd.append('images', item.file);
    });

    try {
      if (isEdit && product) {
        await productApi.update(Number(product.id), fd);
      } else {
        await productApi.create(fd);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #E4E7EC', borderRadius: '10px',
    padding: '12px 14px', fontSize: '14px', outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box', background: '#FFFFFF',
    color: '#111111', transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' as const,
    letterSpacing: '0.5px', color: '#667085', display: 'block', marginBottom: '6px',
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      />
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 210,
          width: '100%', maxWidth: '580px', background: '#FFFFFF',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}
      >
        {/* Drawer Header */}
        <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#C99B67', marginBottom: '4px' }}>Product Catalog</p>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
              {isEdit ? `Edit: ${name}` : 'Add New Product'}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: '#F9FAFB', border: '1px solid #E4E7EC', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '16px', color: '#667085', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px 32px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Coco Peat Block 5kg" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* SKU + Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>SKU / Product Code *</label>
              <input required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="MC-COCO-01" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
            </div>
            <div>
              <label style={labelStyle}>Category *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputStyle, appearance: 'none', backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23667085' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7' stroke-linecap='round' stroke-linejoin='round'></path></svg>")`, backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px 16px', paddingRight: '36px', cursor: 'pointer' }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')}>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* MOQ */}
          <div>
            <label style={labelStyle}>Minimum Order Quantity (MOQ) *</label>
            <input required value={moq} onChange={(e) => setMoq(e.target.value)} placeholder="1 × 40ft FCL or 5 MT" style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* Status switcher */}
          <div>
            <label style={labelStyle}>Status *</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' as const }}>
              {PRODUCT_STATUSES.map((s) => {
                const isActive = status === s;
                const st = STATUS_STYLE[s];
                return (
                  <button key={s} type="button" onClick={() => setStatus(s)}
                    style={{ padding: '8px 18px', borderRadius: '999px', border: `1.5px solid ${isActive ? st.color : '#E4E7EC'}`, background: isActive ? st.bg : 'transparent', color: isActive ? st.color : '#667085', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={labelStyle}>Product Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
              placeholder="Describe key specs, certifications, use cases…"
              style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* Specs Editor */}
          <div>
            <label style={labelStyle}>Product Specifications</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {specs.map((spec, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={spec.label}
                    onChange={(e) => {
                      const next = [...specs];
                      next[index].label = e.target.value;
                      setSpecs(next);
                    }}
                    placeholder="Label (e.g., pH)"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <input
                    value={spec.value}
                    onChange={(e) => {
                      const next = [...specs];
                      next[index].value = e.target.value;
                      setSpecs(next);
                    }}
                    placeholder="Value (e.g., 5.8 – 6.5)"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== index))}
                    style={{
                      background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.15)',
                      color: '#DC2626',
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setSpecs((prev) => [...prev, { label: '', value: '' }])}
              style={{
                background: 'rgba(201,155,103,0.08)',
                border: '1px solid rgba(201,155,103,0.25)',
                color: '#7A5C3A',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
              }}
            >
              + Add Spec Row
            </button>
          </div>

          {/* Image Uploader */}
          <div>
            <label style={labelStyle}>Product Images</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              style={{
                border: `2px dashed ${isDragOver ? '#C99B67' : '#E4E7EC'}`,
                borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer',
                background: isDragOver ? 'rgba(201,155,103,0.04)' : '#FAFAFA',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📸</div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>Drop images here or <span style={{ color: '#C99B67' }}>browse</span></p>
              <p style={{ fontSize: '12px', color: '#A0A0A0', marginTop: '4px' }}>PNG, JPG, WEBP — up to 5 MB each</p>
            </div>
            <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={(e) => handleFiles(e.target.files)} style={{ display: 'none' }} />
            {/* Preview thumbnails */}
            {(existingImages.length > 0 || newFiles.length > 0) && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px', flexWrap: 'wrap' as const }}>
                {existingImages.map((src, i) => (
                  <div key={`existing-${i}`} style={{ position: 'relative' }}>
                    <img src={getProductImageUrl(src)} alt={`preview-ext-${i}`} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E4E7EC' }} />
                    <button type="button" onClick={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#DC2626', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
                  </div>
                ))}
                {newFiles.map((item) => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <img src={item.preview} alt="preview-new" style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '10px', border: '1px solid #E4E7EC' }} />
                    <button type="button" onClick={() => removeNewFile(item.id)}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: '#DC2626', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px', marginTop: 'auto' }}>
            <button type="button" onClick={onClose} disabled={loading}
              style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #E4E7EC', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#667085' }}>
              Cancel
            </button>
            <button type="submit" disabled={loading}
              style={{ padding: '12px 28px', background: '#111111', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.25)', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Product')}
            </button>
          </div>
        </form>
      </motion.div>
    </>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | 'All'>('All');
  const [filterStatus, setFilterStatus] = useState<string | 'All'>('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productApi.getAllAdmin();
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Derive unique categories from loaded products
  const dynamicCategories = Array.from(new Set(products.map((p) => p.category))).sort();

  const filtered = products.filter((p) => {
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'All' || p.category === filterCategory;
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchCat && matchStatus;
  });

  const openCreate = () => { setSelectedProduct(null); setIsFormOpen(true); };
  const openEdit = (p: Product) => { setSelectedProduct(p); setIsFormOpen(true); };

  const handleSaved = () => {
    fetchProducts();
    setIsFormOpen(false);
  };

  const handleDelete = async (id: number | string) => {
    try {
      await productApi.delete(Number(id));
      fetchProducts();
    } catch (err: any) {
      alert(err.message ?? 'Failed to delete product');
    }
    setDeleteTarget(null);
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E4E7EC', borderRadius: '10px', padding: '9px 14px', fontSize: '14px',
    outline: 'none', fontFamily: 'inherit', background: '#FFFFFF', color: '#111',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap' as const, gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111111', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Product Catalog</h2>
          <p style={{ fontSize: '14px', color: '#667085', marginTop: '6px' }}>Manage, update, and monitor international and domestic product listings.</p>
        </div>
        <button
          onClick={openCreate}
          style={{ padding: '11px 22px', background: '#111111', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', whiteSpace: 'nowrap' as const, display: 'flex', alignItems: 'center', gap: '8px' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#222')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#111111')}
        >
          <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> Add New Product
        </button>
      </div>

      {/* Filters toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '220px' }}>
          <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#A0A0A0', pointerEvents: 'none' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" />
          </svg>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or SKU…"
            style={{ ...inputStyle, width: '100%', paddingLeft: '38px', boxSizing: 'border-box' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
        </div>
        {/* Category filter */}
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
          style={{ ...inputStyle, paddingRight: '32px', cursor: 'pointer' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')}>
          <option value="All">All Categories</option>
          {dynamicCategories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* Status filter */}
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          style={{ ...inputStyle, paddingRight: '32px', cursor: 'pointer' }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')}>
          <option value="All">All Statuses</option>
          {PRODUCT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p style={{ color: '#667085' }}>Loading products…</p>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>No products found.</p>
          <p style={{ color: '#667085', marginTop: '8px', fontSize: '14px' }}>Try adjusting your filters or add a new product.</p>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Product Info', 'Category', 'MOQ', 'Status', 'Updated', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#667085', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const st = STATUS_STYLE[p.status] || { bg: 'rgba(100,116,139,0.1)', color: '#64748B' };
                return (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04, ease: 'easeOut' }}
                    style={{ borderTop: '1px solid #F3F4F6' }}
                    className="hover:bg-black/[0.02] transition-colors duration-200"
                  >
                    {/* Product Info */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'linear-gradient(135deg, #F5F1EB, #EAE3D6)', border: '1px solid rgba(201,155,103,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0, overflow: 'hidden' }}>
                          {p.images[0] ? <img src={getProductImageUrl(p.images[0])} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                        </div>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{p.name}</p>
                          <p style={{ fontSize: '12px', color: '#A0A0A0', fontFamily: 'monospace', marginTop: '2px' }}>{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>{p.category}</td>
                    {/* MOQ */}
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>{p.moq}</td>
                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, background: st.bg, color: st.color, whiteSpace: 'nowrap' }}>{p.status}</span>
                    </td>
                    {/* Updated */}
                    <td style={{ padding: '14px 20px', fontSize: '12px', color: '#A0A0A0', whiteSpace: 'nowrap' }}>
                      {new Date(p.updatedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    {/* Actions */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button
                          onClick={() => openEdit(p)}
                          title="Edit product"
                          style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(201,155,103,0.25)', background: 'rgba(201,155,103,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: '#7A5C3A' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201,155,103,0.18)'; e.currentTarget.style.borderColor = '#C99B67'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201,155,103,0.08)'; e.currentTarget.style.borderColor = 'rgba(201,155,103,0.25)'; }}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          title="Delete product"
                          style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid rgba(220,38,38,0.15)', background: 'rgba(220,38,38,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', color: '#DC2626' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.14)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.15)'; }}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: '12px 20px', borderTop: '1px solid #F3F4F6', fontSize: '13px', color: '#A0A0A0' }}>
            Showing {filtered.length} of {products.length} product{products.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Product Form Drawer */}
      <AnimatePresence>
        {isFormOpen && (
          <ProductFormDrawer
            product={selectedProduct}
            onClose={() => setIsFormOpen(false)}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmModal
            productName={deleteTarget.name}
            onConfirm={() => handleDelete(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Utility ──────────────────────────────────────────────────────
function formatDate(d: string) {

  return new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ─── Sub-components ───────────────────────────────────────────────
function Stat({ label, value, gold }: { label: string; value: number; gold?: boolean }) {
  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '16px', padding: '24px 28px',
      border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
    }}>
      <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#A0A0A0', marginBottom: '10px' }}>{label}</p>
      <p style={{ fontSize: '40px', fontWeight: 800, color: gold ? '#C99B67' : '#111111', letterSpacing: '-0.03em' }}>{value}</p>
    </div>
  );
}

// ─── Admin Login ──────────────────────────────────────────────────
function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      setAdminToken(res.token);
      onSuccess();
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A', padding: '16px' }}>
      <div
        className="p-6 sm:p-10"
        style={{
          background: '#FFFFFF', borderRadius: '24px',
          width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', color: '#C99B67', textTransform: 'uppercase' }}>Admin Portal</span>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#111111', marginTop: '8px', letterSpacing: '-0.025em' }}>Mariah Coirs</h1>
          <p style={{ fontSize: '14px', color: '#667085', marginTop: '6px' }}>Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '14px', fontWeight: 600 }}>
              {error}
            </div>
          )}
          {(['email', 'password'] as const).map((field) => (
            <div key={field}>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#667085', display: 'block', marginBottom: '6px' }}>
                {field === 'email' ? 'Email Address' : 'Password'}
              </label>
              <input
                type={field}
                value={field === 'email' ? email : password}
                onChange={(e) => field === 'email' ? setEmail(e.target.value) : setPassword(e.target.value)}
                placeholder={field === 'email' ? 'admin@mariahcoirs.com' : '••••••••••'}
                required
                style={{
                  width: '100%', border: '1px solid #E4E7EC', borderRadius: '12px',
                  padding: '14px 16px', fontSize: '15px', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')}
                onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')}
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px', padding: '15px', background: loading ? '#D4A96A' : '#C99B67',
              color: '#111111', fontWeight: 700, fontSize: '16px', borderRadius: '14px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Blog Form Modal ──────────────────────────────────────────────
function BlogFormModal({
  blog,
  onClose,
  onSaved,
}: {
  blog: Blog | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(blog?.title ?? '');
  const [slug, setSlug] = useState(blog?.slug ?? '');
  const [metaTitle, setMetaTitle] = useState(blog?.metaTitle ?? '');
  const [metaDesc, setMetaDesc] = useState(blog?.metaDescription ?? '');
  const [shortDesc, setShortDesc] = useState(blog?.shortDescription ?? '');
  const [content, setContent] = useState(blog?.content ?? '');
  const [isPublished, setIsPublished] = useState(blog?.isPublished ?? false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    blog?.featuredImage ? `${API_BASE_URL}/uploads/${blog.featuredImage}` : null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const fd = new FormData();
    fd.append('title', title.trim());
    fd.append('slug', slug.trim() || title.trim());
    fd.append('metaTitle', metaTitle.trim() || title.trim());
    fd.append('metaDescription', metaDesc.trim() || shortDesc.trim());
    fd.append('shortDescription', shortDesc.trim());
    fd.append('content', content.trim());
    fd.append('isPublished', String(isPublished));
    if (imageFile) fd.append('featuredImage', imageFile);

    try {
      if (blog) {
        await blogApi.update(blog.id, fd);
      } else {
        await blogApi.create(fd);
      }
      onSaved();
    } catch (err: any) {
      setError(err.message ?? 'Failed to save blog');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1px solid #E4E7EC', borderRadius: '10px',
    padding: '12px 14px', fontSize: '14px', outline: 'none', fontFamily: 'inherit',
    boxSizing: 'border-box', background: '#FFFFFF',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '1px', color: '#667085', display: 'block', marginBottom: '5px',
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start',
        justifyContent: 'center', padding: '12px', overflowY: 'auto',
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="p-5 sm:p-10"
        style={{
          background: '#FFFFFF', borderRadius: '20px',
          width: '100%', maxWidth: '780px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111', letterSpacing: '-0.02em' }}>
            {blog ? 'Edit Blog Post' : 'New Blog Post'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#667085', lineHeight: 1 }}>✕</button>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Title */}
          <div>
            <label style={labelStyle}>Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* Slug + Meta Title row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label style={labelStyle}>URL Slug (auto-generated)</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="benefits-of-coco-peat" style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
            </div>
            <div>
              <label style={labelStyle}>SEO Meta Title</label>
              <input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} style={inputStyle}
                onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
            </div>
          </div>

          {/* Meta description */}
          <div>
            <label style={labelStyle}>SEO Meta Description</label>
            <textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* Short Description */}
          <div>
            <label style={labelStyle}>Short Description *</label>
            <textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={2} required style={{ ...inputStyle, resize: 'vertical' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* Content */}
          <div>
            <label style={labelStyle}>Content (HTML supported) *</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={10} required
              placeholder="<h2>Your heading</h2><p>Blog content here...</p>"
              style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
          </div>

          {/* Featured Image */}
          <div>
            <label style={labelStyle}>Featured Image (JPEG/PNG/WEBP, max 5MB)</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed #E4E7EC', borderRadius: '12px', padding: '20px', textAlign: 'center',
                cursor: 'pointer', transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#C99B67')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = '#E4E7EC')}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '160px', borderRadius: '8px', margin: '0 auto' }} />
              ) : (
                <div style={{ color: '#A0A0A0', fontSize: '14px' }}>
                  <span style={{ fontSize: '28px' }}>📸</span>
                  <p style={{ marginTop: '8px' }}>Click to upload featured image</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
          </div>

          {/* Publish toggle + Submit */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between pt-2">
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div
                onClick={() => setIsPublished(prev => !prev)}
                style={{
                  width: '44px', height: '24px', borderRadius: '999px',
                  background: isPublished ? '#C99B67' : '#E4E7EC',
                  transition: 'background 0.2s', position: 'relative', cursor: 'pointer', flexShrink: 0,
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px', left: isPublished ? '23px' : '3px',
                  width: '18px', height: '18px', borderRadius: '50%', background: '#FFFFFF',
                  transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                }} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                {isPublished ? '✅ Published' : '📝 Draft'}
              </span>
            </label>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose}
                style={{ padding: '12px 24px', background: 'transparent', border: '1px solid #E4E7EC', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, color: '#667085' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading}
                style={{ padding: '12px 28px', background: loading ? '#D4A96A' : '#C99B67', border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#111' }}>
                {loading ? 'Saving…' : (blog ? 'Update Post' : 'Create Post')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────
function DashboardTab() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getSummary()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '40px', color: '#667085' }}>Loading…</div>;
  if (!data) return <div style={{ padding: '40px', color: '#DC2626' }}>Failed to load dashboard data.</div>;

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <Stat label="Total Blogs" value={data.totalBlogs} />
        <Stat label="Published" value={data.totalPublishedBlogs} gold />
        <Stat label="Total Enquiries" value={data.totalEnquiries} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Recent Enquiries</h3>
          {data.recentEnquiries.length === 0 && <p style={{ color: '#A0A0A0', fontSize: '14px' }}>No enquiries yet.</p>}
          {data.recentEnquiries.map((e) => (
            <div key={e.id} style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{e.name} {e.companyName ? `— ${e.companyName}` : ''}</p>
              <p style={{ fontSize: '12px', color: '#667085' }}>{e.email} · {formatDate(e.createdAt)}</p>
            </div>
          ))}
        </div>
        {/* Recent Blogs */}
        <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', marginBottom: '16px' }}>Recent Blog Posts</h3>
          {data.recentBlogs.length === 0 && <p style={{ color: '#A0A0A0', fontSize: '14px' }}>No blogs yet.</p>}
          {data.recentBlogs.map((b) => (
            <div key={b.id} style={{ padding: '10px 0', borderBottom: '1px solid #F3F4F6' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{b.title}</p>
              <p style={{ fontSize: '12px', color: b.isPublished ? '#16A34A' : '#A0A0A0' }}>
                {b.isPublished ? '✅ Published' : '📝 Draft'} · {formatDate(b.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Blogs Management Tab ─────────────────────────────────────────
function BlogsTab() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalBlog, setModalBlog] = useState<Blog | null | 'new'>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchBlogs = useCallback(() => {
    setLoading(true);
    blogApi.getAll(false)
      .then((res) => setBlogs(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await blogApi.delete(id);
      fetchBlogs();
    } catch (err: any) {
      alert(err.message ?? 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', letterSpacing: '-0.015em' }}>Blog Posts</h2>
        <button
          onClick={() => setModalBlog('new')}
          style={{ padding: '11px 22px', background: '#C99B67', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: 700, color: '#111', boxShadow: '0 4px 14px rgba(201,155,103,0.35)' }}
        >
          + New Blog Post
        </button>
      </div>

      {loading && <p style={{ color: '#667085' }}>Loading blogs…</p>}

      {!loading && blogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>No blog posts yet.</p>
          <p style={{ color: '#667085', marginTop: '8px' }}>Click "New Blog Post" to get started.</p>
        </div>
      )}

      {!loading && blogs.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Title', 'Slug', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#667085' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} style={{ borderTop: '1px solid #F3F4F6', transition: 'background 0.15s' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#FAFAFA')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                  <td style={{ padding: '14px 20px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{blog.title}</p>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: '12px', color: '#667085', fontFamily: 'monospace' }}>/blog/{blog.slug}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                      background: blog.isPublished ? 'rgba(22,163,74,0.1)' : 'rgba(0,0,0,0.05)',
                      color: blog.isPublished ? '#16A34A' : '#667085',
                    }}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '13px', color: '#667085' }}>{formatDate(blog.createdAt)}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setModalBlog(blog)}
                        style={{ padding: '7px 14px', background: 'rgba(201,155,103,0.1)', border: '1px solid rgba(201,155,103,0.2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: '#7A5C3A' }}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(blog.id)} disabled={deleting === blog.id}
                        style={{ padding: '7px 14px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '8px', cursor: deleting === blog.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>
                        {deleting === blog.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Blog Form Modal */}
      {modalBlog !== null && (
        <BlogFormModal
          blog={modalBlog === 'new' ? null : modalBlog}
          onClose={() => setModalBlog(null)}
          onSaved={() => { setModalBlog(null); fetchBlogs(); }}
        />
      )}
    </div>
  );
}

// ─── Enquiries Management Tab ─────────────────────────────────────
function EnquiriesTab() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchEnquiries = useCallback(() => {
    setLoading(true);
    enquiryApi.getAll({ search: search || undefined, startDate: startDate || undefined, endDate: endDate || undefined })
      .then((res) => setEnquiries(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [search, startDate, endDate]);

  useEffect(() => { fetchEnquiries(); }, [fetchEnquiries]);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this enquiry? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await enquiryApi.delete(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err: any) {
      alert(err.message ?? 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid #E4E7EC', borderRadius: '10px', padding: '9px 14px', fontSize: '14px',
    outline: 'none', fontFamily: 'inherit', background: '#FFFFFF',
  };

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '20px' }}>Enquiries</h2>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, email, country…" className="w-full sm:w-auto min-w-[260px] flex-1" style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full sm:w-auto" style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full sm:w-auto" style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C99B67')} onBlur={(e) => (e.currentTarget.style.borderColor = '#E4E7EC')} />
        {(search || startDate || endDate) && (
          <button onClick={() => { setSearch(''); setStartDate(''); setEndDate(''); }}
            style={{ padding: '9px 14px', background: 'transparent', border: '1px solid #E4E7EC', borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', color: '#667085' }}>
            Clear
          </button>
        )}
      </div>

      {loading && <p style={{ color: '#667085' }}>Loading enquiries…</p>}

      {!loading && enquiries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: '#111' }}>No enquiries found.</p>
        </div>
      )}

      {!loading && enquiries.length > 0 && (
        <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                {['Name / Company', 'Email', 'Country', 'Product', 'Source', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#667085' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq) => (
                <tr key={enq.id} style={{ borderTop: '1px solid #F3F4F6' }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#FAFAFA')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{enq.name}</p>
                    {enq.companyName && <p style={{ fontSize: '12px', color: '#667085' }}>{enq.companyName}</p>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{enq.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{enq.country ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enq.productInterested ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#A0A0A0' }}>{enq.sourcePage ?? '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: '12px', color: '#A0A0A0' }}>{formatDate(enq.createdAt)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => setSelected(enq)}
                        style={{ padding: '6px 12px', background: 'rgba(201,155,103,0.1)', border: '1px solid rgba(201,155,103,0.2)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, color: '#7A5C3A' }}>
                        View
                      </button>
                      <button onClick={() => handleDelete(enq.id)} disabled={deleting === enq.id}
                        style={{ padding: '6px 12px', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)', borderRadius: '8px', cursor: deleting === enq.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, color: '#DC2626' }}>
                        {deleting === enq.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enquiry Detail Modal */}
      {selected && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
        >
          <div
            className="p-5 sm:p-9"
            style={{
              background: '#FFFFFF', borderRadius: '20px',
              width: '100%', maxWidth: '560px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111' }}>Enquiry Details</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: '#667085' }}>✕</button>
            </div>
            {[
              ['Name', selected.name],
              ['Company', selected.companyName],
              ['Email', selected.email],
              ['Phone', selected.phone],
              ['Country', selected.country],
              ['Product Interested', selected.productInterested],
              ['Quantity', selected.quantity],
              ['Source', selected.sourcePage],
              ['Date', formatDate(selected.createdAt)],
            ].map(([k, v]) => v ? (
              <div key={k} style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#A0A0A0' }}>{k}</span>
                <p style={{ fontSize: '15px', color: '#111', fontWeight: 600, marginTop: '2px' }}>{v}</p>
              </div>
            ) : null)}
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#A0A0A0' }}>Message</span>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.7, marginTop: '4px', background: '#F9FAFB', padding: '14px', borderRadius: '10px' }}>{selected.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────
type Tab = 'dashboard' | 'blogs' | 'enquiries' | 'products';

export default function AdminPortal() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const checkAuth = useCallback(async () => {
    const token = getAdminToken();
    if (!token) { setAuthenticated(false); return; }
    try {
      await authApi.verify();
      setAuthenticated(true);
    } catch {
      clearAdminToken();
      setAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Admin | Mariah Coirs';
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    clearAdminToken();
    setAuthenticated(false);
  };

  // Loading state
  if (authenticated === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid rgba(201,155,103,0.2)', borderTopColor: '#C99B67', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦' },
    { id: 'blogs', label: 'Blog Posts', icon: '📝' },
    { id: 'enquiries', label: 'Enquiries', icon: '📬' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Bar ── */}
      <header
        className="px-4 sm:px-8"
        style={{
          background: '#0A0A0A', color: '#FFFFFF',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)', position: 'sticky', top: 0, zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="text-lg sm:text-xl" style={{ fontWeight: 800, letterSpacing: '-0.025em' }}>Mariah Coirs</span>
          <span className="hidden sm:inline" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: '#C99B67', textTransform: 'uppercase', borderLeft: '1px solid rgba(255,255,255,0.15)', paddingLeft: '12px' }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}>
            View Site ↗
          </a>
          <button onClick={handleLogout}
            className="px-3 sm:px-4 py-2"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
            Log Out
          </button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row" style={{ flex: 1 }}>
        {/* ── Sidebar ── */}
        <aside
          className="w-full md:w-[220px] flex flex-row md:flex-col overflow-x-auto p-4 md:p-6 md:py-8 border-b md:border-b-0 md:border-r shrink-0 gap-1"
          style={{
            background: '#FFFFFF',
            borderColor: 'rgba(0,0,0,0.06)',
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="w-auto md:w-full shrink-0 mb-0 md:mb-1"
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '11px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, textAlign: 'left',
                background: activeTab === tab.id ? 'rgba(201,155,103,0.12)' : 'transparent',
                color: activeTab === tab.id ? '#7A5C3A' : '#374151',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'; }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>

        {/* ── Main Content ── */}
        <main className="p-4 sm:p-10" style={{ flex: 1, overflowY: 'auto' }}>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'products' && <ProductsTab />}
          {activeTab === 'blogs' && <BlogsTab />}
          {activeTab === 'enquiries' && <EnquiriesTab />}
        </main>
      </div>
    </div>
  );
}
