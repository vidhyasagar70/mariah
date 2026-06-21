import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useModal } from '../context/ModalContext';
import type { ModalTab } from '../context/ModalContext';
import { enquiryApi } from '../lib/api';

// ─── Constants ────────────────────────────────────────────────────
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PRODUCTS = [
  'Coco Peat Blocks 5kg',
  'Coco Peat Blocks 650g',
  'Low EC Coco Peat',
  'Coir Grow Bags',
  'Husk Chips Grow Media',
  'Coir Pith (Loose)',
  'Open-Top Bags',
  'Custom / Mixed Order',
];

// ─── Tab Config ───────────────────────────────────────────────────
const TAB_CONFIG = {
  export: {
    label: 'Export Order',
    // icon: '🌐',
    companyPlaceholder: 'GreenGrow BV',
    locationLabel: 'COUNTRY *',
    locationPlaceholder: 'Netherlands',
    phonePlaceholder: '+31 6 12345678',
    quantityPlaceholder: '1 × 40ft FCL',
    submitLabel: 'Request Export Quote',
  },
  domestic: {
    label: 'Indian Bulk Order',
    // icon: '🇮🇳',
    companyPlaceholder: 'Agro Traders',
    locationLabel: 'STATE *',
    locationPlaceholder: 'Karnataka',
    phonePlaceholder: '+91 98400 12345',
    quantityPlaceholder: '5 MT / month',
    submitLabel: 'Request Bulk Pricing',
  },
} as const;

// ─── Animation Variants ───────────────────────────────────────────
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' as const } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: 'easeIn' as const } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring' as const, duration: 0.4, bounce: 0.15 } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.25, ease: 'easeIn' as const } },
};


// ─── Input Component ──────────────────────────────────────────────
function Field({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={id}
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: '#667085',
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          border: `1px solid ${focused ? '#C99B67' : '#E4E7EC'}`,
          borderRadius: '8px',
          padding: '8px 12px',
          fontSize: '13px',
          color: '#111111',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          background: '#FFFFFF',
          fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

// ─── Select Component ─────────────────────────────────────────────
function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  defaultText,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  defaultText: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-0.5">
      <label
        htmlFor={id}
        style={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: '#667085',
        }}
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          border: `1px solid ${focused ? '#C99B67' : '#E4E7EC'}`,
          borderRadius: '8px',
          padding: '8px 12px',
          paddingRight: '32px',
          fontSize: '13px',
          color: value ? '#111111' : '#A0A0A0',
          outline: 'none',
          transition: 'border-color 0.2s ease',
          background: '#FFFFFF',
          backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%23667085' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path d='M19 9l-7 7-7-7' stroke-linecap='round' stroke-linejoin='round'></path></svg>")`,
          backgroundPosition: 'right 12px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '16px 16px',
          appearance: 'none',
          WebkitAppearance: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <option value="" disabled>{defaultText}</option>
        {options.map(opt => (
          <option key={opt} value={opt} style={{ color: '#111111' }}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Main Modal Component ─────────────────────────────────────────
export default function BulkPricingModal() {
  const { modalState, closeModal } = useModal();
  const { isOpen, initialTab } = modalState;
  const shouldReduce = useReducedMotion();

  const [activeTab, setActiveTab] = useState<ModalTab>(initialTab);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');


  // Form state
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('');
  const [product, setProduct] = useState('');

  // Sync tab when modal opens with a different initialTab
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setSubmitted(false);
    }
  }, [isOpen, initialTab]);

  // Escape key closes modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeModal();
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeModal]);

  const cfg = TAB_CONFIG[activeTab];

  const resetForm = useCallback(() => {
    setName(''); setCompany(''); setLocation('');
    setEmail(''); setPhone(''); setQuantity(''); setProduct('');
  }, []);

  const switchTab = (tab: ModalTab) => {
    setActiveTab(tab);
    setLocation(''); // location label changes — reset to avoid confusion
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      await enquiryApi.submit({
        name: name.trim(),
        email: email.trim(),
        companyName: company.trim() || undefined,
        phone: phone.trim() || undefined,
        country: location.trim() || undefined,
        productInterested: product || undefined,
        quantity: quantity.trim() || undefined,
        message: `Bulk pricing request. Quantity: ${quantity || 'N/A'}. Product: ${product || 'N/A'}.`,
        sourcePage: activeTab === 'export' ? 'Export Quote Modal' : 'Indian Bulk Pricing Modal',
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message ?? 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ── */
        <motion.div
          key="backdrop"
          variants={shouldReduce ? undefined : backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeModal}
          aria-modal="true"
          role="dialog"
          aria-label="Request Bulk Pricing"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.50)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          {/* ── Card ── */}
          <motion.div
            key="card"
            variants={shouldReduce ? undefined : cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
            className="p-5 sm:p-7 no-scrollbar"
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '540px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
              position: 'relative',
              maxHeight: '95vh',
              overflowY: 'hidden',
            }}
          >
            <style>{`
              .no-scrollbar::-webkit-scrollbar {
                display: none;
              }
              .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            {/* ── Close Button ── */}
            <button
              id="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
              className="absolute top-3 right-3 sm:top-4 sm:right-4"
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#667085',
                fontSize: '16px',
                borderRadius: '6px',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#F2F4F7')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              ✕
            </button>

            {submitted ? (
              /* ── Success Screen ── */
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
                className="flex flex-col items-center text-center py-4"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                  style={{ background: 'rgba(201,155,103,0.1)' }}
                >
                  ✅
                </div>
                <h3
                  style={{ fontSize: '20px', fontWeight: 800, color: '#111111', letterSpacing: '-0.02em' }}
                >
                  Inquiry Received!
                </h3>
                <p style={{ color: '#667085', marginTop: '8px', fontSize: '13px', lineHeight: 1.6, maxWidth: '320px' }}>
                  Thank you, <strong>{name || 'there'}</strong>. Our team will respond to{' '}
                  <strong>{email}</strong> within 24 hours with a full quotation.
                </p>
                <div className="flex gap-3 mt-6 w-full max-w-[280px]">
                  <button
                    id="modal-done-btn"
                    onClick={() => { closeModal(); resetForm(); setSubmitted(false); }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: '#111111',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#222222')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#111111')}
                  >
                    Done
                  </button>
                  <button
                    onClick={() => { resetForm(); setSubmitted(false); }}
                    style={{
                      flex: 1,
                      padding: '10px 16px',
                      background: 'transparent',
                      color: '#667085',
                      fontWeight: 600,
                      fontSize: '13px',
                      borderRadius: '8px',
                      border: '1px solid #E4E7EC',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#F9FAFB')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    Submit Another
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Form ── */
              <>
                {/* Eyebrow */}
                <p
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: '#C99B67',
                    marginBottom: '4px',
                  }}
                >
                  {activeTab === 'export' ? 'INTERNATIONAL EXPORT' : 'DOMESTIC BULK SUPPLY'}
                </p>

                {/* Heading */}
                <h2
                  style={{
                    fontSize: '22px',
                    fontWeight: 800,
                    color: '#111111',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                    marginBottom: '4px',
                  }}
                >
                  {activeTab === 'export' ? 'Request Bulk Export Pricing' : 'Request Bulk Pricing'}
                </h2>

                {/* Sub-heading */}
                <p style={{ color: '#667085', fontSize: '12px', marginBottom: '16px' }}>
                  Our export team responds within 24 hours with a full FOB quote.
                </p>

                {/* ── Tab Switcher ── */}
                <div
                  className="grid grid-cols-2 gap-1 mb-4"
                  style={{
                    background: '#F9FAFB',
                    border: '1px solid #E4E7EC',
                    borderRadius: '8px',
                    padding: '2px',
                  }}
                  role="tablist"
                  aria-label="Order type"
                >
                  {(['export', 'domestic'] as ModalTab[]).map(tab => {
                    const isActive = activeTab === tab;
                    const tCfg = TAB_CONFIG[tab];
                    return (
                      <motion.button
                        key={tab}
                        id={`tab-${tab}`}
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => switchTab(tab)}
                        whileTap={shouldReduce ? {} : { scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          background: isActive ? '#111111' : 'transparent',
                          color: isActive ? '#FFFFFF' : '#667085',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                        }}
                      >
                        {/* <span style={{ fontSize: '12px' }}>{tCfg.icon}</span> */}
                        {tCfg.label}
                      </motion.button>
                    );
                  })}
                </div>

                {/* ── Form Fields ── */}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2">
                    <Field
                      id="modal-name"
                      label="Full Name *"
                      placeholder="John Smith"
                      value={name}
                      onChange={setName}
                    />
                    <Field
                      id="modal-company"
                      label="Company Name *"
                      placeholder={cfg.companyPlaceholder}
                      value={company}
                      onChange={setCompany}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2">
                    {/* Animates label between COUNTRY / STATE */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`location-${activeTab}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="w-full"
                      >
                        <Field
                          id="modal-location"
                          label={cfg.locationLabel}
                          placeholder={cfg.locationPlaceholder}
                          value={location}
                          onChange={setLocation}
                        />
                      </motion.div>
                    </AnimatePresence>
                    <Field
                      id="modal-email"
                      label="Email *"
                      type="email"
                      placeholder="your@company.com"
                      value={email}
                      onChange={setEmail}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-2">
                    <Field
                      id="modal-phone"
                      label="WhatsApp / Phone"
                      type="tel"
                      placeholder={cfg.phonePlaceholder}
                      value={phone}
                      onChange={setPhone}
                    />
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`qty-${activeTab}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="w-full"
                      >
                        <Field
                          id="modal-quantity"
                          label="Quantity *"
                          placeholder={cfg.quantityPlaceholder}
                          value={quantity}
                          onChange={setQuantity}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="mb-4">
                    <SelectField
                      id="modal-product"
                      label="Product Interest *"
                      value={product}
                      onChange={setProduct}
                      options={PRODUCTS}
                      defaultText="Select a product"
                    />
                  </div>

                  {submitError && (
                    <div style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '8px', padding: '8px 12px', marginBottom: '16px', fontSize: '13px', fontWeight: 600 }}>
                      {submitError}
                    </div>
                  )}

                  {/* ── Footer Buttons ── */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4">
                    {/* Submit */}
                    <motion.button
                      id="modal-submit"
                      type="submit"
                      disabled={submitting}
                      whileHover={submitting || shouldReduce ? {} : { scale: 1.02, y: -1 }}
                      whileTap={submitting || shouldReduce ? {} : { scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 text-[11px] sm:text-xs md:text-[13px] gap-1 sm:gap-1.5"
                      style={{
                        background: submitting ? '#666666' : '#111111',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s ease',
                        fontFamily: 'inherit',
                      }}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                          </svg>
                          Sending…
                        </>
                      ) : (
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={activeTab}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                          >
                            {cfg.submitLabel === 'Request Export Quote' ? 'Request Quote' : cfg.submitLabel}
                          </motion.span>
                        </AnimatePresence>
                      )}
                    </motion.button>

                    {/* Download Catalog */}
                    <button
                      id="modal-catalog"
                      type="button"
                      onClick={() => window.open('/catalog.pdf', '_blank')}
                      className="px-2 py-2.5 sm:px-4 sm:py-3 text-[11px] sm:text-xs md:text-[13px] gap-1 sm:gap-1.5"
                      style={{
                        background: '#FFFFFF',
                        color: '#C99B67',
                        fontWeight: 700,
                        borderRadius: '8px',
                        border: '1px solid #C99B67',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#FFFDF9';
                        e.currentTarget.style.borderColor = '#B08352';
                        e.currentTarget.style.color = '#B08352';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#C99B67';
                        e.currentTarget.style.color = '#C99B67';
                      }}
                    >
                      {/* Download icon */}
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download Catalog
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
