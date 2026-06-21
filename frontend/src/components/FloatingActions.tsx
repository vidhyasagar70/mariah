import { motion } from 'framer-motion';
import { useModal } from '../context/ModalContext';

// WhatsApp Details
const WHATSAPP_NUMBER = '919677641979';
const WHATSAPP_MSG = 'Hello Mariah Coirs Export, I would like to know more about your products.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MSG)}`;

// ─── SVG Icons ──────────────────────────────────────────────────────
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.42 9.86-9.864.001-2.63-1.019-5.101-2.875-6.958-1.856-1.857-4.324-2.879-6.958-2.88-5.441 0-9.863 4.417-9.865 9.861-.001 1.677.443 3.313 1.286 4.757l-.997 3.637 3.725-.977zm11.367-6.94c-.29-.145-1.71-.845-1.975-.94-.266-.097-.46-.145-.654.145-.193.291-.749.94-.919 1.134-.17.193-.34.218-.63.073-.29-.145-1.229-.453-2.34-1.445-.864-.772-1.448-1.725-1.618-2.016-.17-.29-.018-.447.127-.59.13-.13.29-.34.436-.51.145-.17.194-.291.291-.485.097-.194.049-.364-.025-.51-.073-.145-.654-1.577-.896-2.158-.236-.569-.475-.491-.654-.5l-.558-.01c-.193 0-.509.073-.775.364-.266.29-1.018.995-1.018 2.428 0 1.432 1.041 2.816 1.186 3.01.145.193 2.049 3.129 4.964 4.383.693.299 1.235.478 1.657.61.697.222 1.332.191 1.834.116.56-.084 1.71-.699 1.952-1.374.242-.676.242-1.258.17-1.374-.074-.116-.267-.213-.558-.358z" />
  </svg>
);

const DocumentIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export default function FloatingActions() {
  const { openModal } = useModal();

  return (
    <>
      {/* ─── Desktop View ────────────────────────────────────────────── */}
      <motion.div
        className="fixed right-6 bottom-6 z-[9999] hidden md:flex flex-col gap-3 items-end"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      >
        {/* Request Quote Button */}
        {/* WhatsApp Button */}
        <motion.a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '999px',
            background: '#25D366',
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
          className="flex items-center justify-center cursor-pointer select-none border-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
          aria-label="Chat with Mariah Coirs Export on WhatsApp"
        >
          <WhatsAppIcon className="w-7 h-7" />
        </motion.a>
        <motion.button
          onClick={() => openModal('export')}
          whileHover={{ y: -3 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          style={{
            background: '#111111',
            color: '#FFFFFF',
            borderRadius: '999px',
            padding: '14px 24px',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          }}
          className="flex items-center gap-2 cursor-pointer font-sans text-[15px] select-none border-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
          aria-label="Request an Export Quote"
        >
          <DocumentIcon />
          Request Quote
        </motion.button>


      </motion.div>

      {/* ─── Mobile View ─────────────────────────────────────────────── */}
      <motion.div
        className="fixed left-3 right-3 z-[9999] flex md:hidden flex-row gap-3 items-center"
        style={{
          bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        }}
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
      >
        {/* Request Export Quote Button */}
        <button
          onClick={() => openModal('export')}
          style={{
            height: '52px',
            background: '#111111',
            color: '#FFFFFF',
            borderRadius: '14px',
            fontWeight: 600,
          }}
          className="flex-1 flex items-center justify-center gap-2 cursor-pointer font-sans text-[15px] select-none border-none outline-none active:scale-[0.98] transition-transform duration-100 shadow-[0_8px_20px_rgba(0,0,0,0.15)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black"
          aria-label="Request Export Quote"
        >
          <DocumentIcon />
          Request Export Quote
        </button>

        {/* WhatsApp Button */}
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '999px',
            background: '#25D366',
            color: '#FFFFFF',
          }}
          className="flex items-center justify-center cursor-pointer select-none border-none outline-none active:scale-[0.98] transition-transform duration-100 shadow-[0_8px_20px_rgba(37,211,102,0.2)] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#25D366]"
          aria-label="Chat with Mariah Coirs Export on WhatsApp"
        >
          <WhatsAppIcon className="w-6 h-6" />
        </a>
      </motion.div>
    </>
  );
}
