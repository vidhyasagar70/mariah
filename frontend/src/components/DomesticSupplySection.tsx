import { useState, useRef } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useModal } from '../context/ModalContext';

// ─── Types & Interfaces ──────────────────────────────────────────
interface Benefit {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── SVG Icons ───────────────────────────────────────────────────
const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const DollarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
    <polygon points="12 22.08 12 12 21 6.92 21 17.08 12 22.08" />
    <polygon points="12 12 3 6.92 12 1.84 21 6.92 12 12" />
  </svg>
);

const AwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const ZapIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#C99B67' }}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Benefits Dataset ─────────────────────────────────────────────
const BENEFITS: Benefit[] = [
  {
    id: 1,
    icon: <TruckIcon />,
    title: 'PAN India Delivery',
    description: 'Doorstep delivery to all major states via freight partners.',
  },
  {
    id: 2,
    icon: <DollarIcon />,
    title: 'Factory-Direct Pricing',
    description: 'Zero commission — you pay the manufacturer directly.',
  },
  {
    id: 3,
    icon: <PackageIcon />,
    title: 'Bulk Order Discounts',
    description: 'Tiered pricing from 1 MT to full truckloads and containers.',
  },
  {
    id: 4,
    icon: <AwardIcon />,
    title: 'OEM & Private Label',
    description: 'Custom packaging with your brand for resale across India.',
  },
  {
    id: 5,
    icon: <ZapIcon />,
    title: 'Fast Dispatch',
    description: '2–5 day turnaround for stock products from Pollachi.',
  },
  {
    id: 6,
    icon: <HeadsetIcon />,
    title: 'Dedicated Sales Support',
    description: 'Named account executive for Indian commercial buyers.',
  },
];

// ─── States Dataset ───────────────────────────────────────────────
const STATES = [
  'Tamil Nadu',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Gujarat',
  'Telangana',
  'Andhra Pradesh',
  'Punjab',
  'Haryana',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
];

// ─── Buyers Checklist ─────────────────────────────────────────────
const BUYERS = [
  'Commercial Nurseries',
  'Greenhouse Projects',
  'Landscaping Companies',
  'Hydroponic Farms',
  'Agriculture Dealers',
  'OEM / Bulk Resellers',
];

// ─── Animation Variants ───────────────────────────────────────────
const sectionFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, ease: EASE_CUBIC } },
};

const leftFade: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease: EASE_CUBIC } },
};

const rightFade: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.85, ease: EASE_CUBIC } },
};

const gridFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const benefitFade: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_CUBIC },
  },
};

// ─── Benefit Card Component ───────────────────────────────────────
function BenefitCard({ benefit, reduce }: { benefit: Benefit; reduce: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={benefitFade}
      onHoverStart={() => !reduce && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduce ? {} : { y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="flex items-start gap-3 p-6 overflow-hidden select-none cursor-default"
      style={{
        background: '#FFFFFF',
        border: hovered ? '1px solid rgba(201, 155, 103, 0.40)' : '1px solid rgba(0, 0, 0, 0.04)',
        borderRadius: '20px',
        boxShadow: hovered
          ? '0 16px 32px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(185, 120, 45, 0.04)'
          : '0 8px 24px rgba(0, 0, 0, 0.03)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {/* Icon Wrapper */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: 'rgba(201, 155, 103, 0.08)',
          color: '#C99B67',
        }}
        aria-hidden="true"
      >
        {benefit.icon}
      </div>

      {/* Content */}
      <div className="flex flex-col">
        <h4
          className="font-bold tracking-tight text-[#111111] text-lg"
          style={{ letterSpacing: '-0.01em' }}
        >
          {benefit.title}
        </h4>
        <p
          className="mt-1 text-sm leading-relaxed text-gray-500"
        >
          {benefit.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function DomesticSupplySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const shouldReduce = useReducedMotion();
  const { openModal } = useModal();

  return (
    <section
      id="domestic"
      ref={sectionRef}
      aria-label="Domestic Bulk Supply Programme"
      className="relative w-full overflow-hidden"
      style={{
        background: '#F5F1EB',
        paddingTop: '96px',
        paddingBottom: '96px',
      }}
    >
      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* Outer grid */}
        <motion.div
          variants={shouldReduce ? {} : sectionFade}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          
          {/* ══════════════════════════════════════════
              LEFT SIDE: CONTENT & BENEFITS GRID (65%)
          ══════════════════════════════════════════ */}
          <motion.div
            variants={shouldReduce ? {} : leftFade}
            className="lg:col-span-8 flex flex-col items-start text-left"
          >
            {/* Eyebrow Badge */}
            <div
              className="inline-flex items-center px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.24em] mb-6"
              style={{
                background: 'rgba(201, 155, 103, 0.1)',
                border: '1px solid rgba(201, 155, 103, 0.2)',
                color: '#C99B67',
              }}
            >
              Domestic Bulk Supply Programme
            </div>

            {/* Main Heading */}
            <h2
              className="font-extrabold text-[#111111] tracking-tight leading-[1.1] text-5xl"
              style={{
                letterSpacing: '-0.03em',
              }}
            >
              Bulk Supply for
              <br />
              the Indian Market
            </h2>

            {/* Description */}
            <p
              className="mt-5 text-lg leading-relaxed"
              style={{
                color: '#667085',
                maxWidth: '550px',
              }}
            >
              We supply premium cocopeat and coir products across India for commercial agriculture,
              nurseries, hydroponics, landscaping projects and wholesale distribution — at factory-direct
              pricing with no intermediary margins.
            </p>

            {/* Tamil Nadu MOQ Notice */}
            <div
              className="mt-4 flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(201, 155, 103, 0.1)',
                border: '1px solid rgba(201, 155, 103, 0.25)',
                color: '#C99B67',
                maxWidth: '550px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Minimum order quantity in Tamil Nadu is 16 tons.</span>
            </div>

            {/* Benefits Grid */}
            <motion.div
              variants={gridFade}
              className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-5"
            >
              {BENEFITS.map((benefit) => (
                <BenefitCard
                  key={benefit.id}
                  benefit={benefit}
                  reduce={!!shouldReduce}
                />
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-fit">
              <motion.button
                id="domestic-bulk-pricing-btn"
                onClick={() => openModal('domestic')}
                whileHover={shouldReduce ? {} : { scale: 1.04, y: -3 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[16px] font-bold text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 w-full sm:w-auto text-center"
                style={{
                  background: '#C99B67',
                  color: '#111111',
                  boxShadow: '0 4px 18px rgba(201, 155, 103, 0.35)',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Request Indian Bulk Pricing
              </motion.button>

              <motion.button
                id="domestic-export-inquiry-btn"
                onClick={() => openModal('export')}
                whileHover={shouldReduce ? {} : { scale: 1.03, background: 'rgba(0,0,0,0.03)' }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[16px] font-semibold text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 w-full sm:w-auto text-center"
                style={{
                  background: 'transparent',
                  border: '1.5px solid rgba(0,0,0,0.12)',
                  color: '#111111',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Export Inquiry
              </motion.button>
            </div>

          </motion.div>

          {/* ══════════════════════════════════════════
              RIGHT SIDE: DARK INFO PANEL (35%)
          ══════════════════════════════════════════ */}
          <motion.div
            variants={shouldReduce ? {} : rightFade}
            className="lg:col-span-4 w-full h-full relative"
          >
            <div
              className="relative w-full flex flex-col justify-start p-8 overflow-hidden"
              style={{
                background: '#0A0A0A',
                borderRadius: '32px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Radial glow */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(circle at 80% 20%, rgba(201, 155, 103, 0.08) 0%, transparent 60%)',
                }}
                aria-hidden="true"
              />

              {/* Supplying Across Eyebrow */}
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.24em] mb-3"
                style={{ color: '#C99B67' }}
              >
                Supplying Across
              </span>

              {/* Card Heading */}
              <h3
                className="font-extrabold text-white tracking-tight"
                style={{ fontSize: '34px', letterSpacing: '-0.02em', lineHeight: '1.15' }}
              >
                Major Indian Markets
              </h3>

              {/* State Pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {STATES.map((state) => (
                  <span
                    key={state}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(201, 155, 103, 0.15)',
                      color: '#FFFFFF',
                    }}
                  >
                    {state}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div
                className="mt-6 mb-6 h-px w-full"
                style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                aria-hidden="true"
              />

              {/* Buyers We Serve Label */}
              <span
                className="inline-block text-[11px] font-bold uppercase tracking-[0.24em] mb-3"
                style={{ color: '#C99B67' }}
              >
                Buyers We Serve
              </span>

              {/* Buyers Checklist */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {BUYERS.map((buyer) => (
                  <div key={buyer} className="flex items-center gap-2">
                    <span className="shrink-0" aria-hidden="true">
                      <CheckIcon />
                    </span>
                    <span
                      className="text-sm font-semibold tracking-tight"
                      style={{ color: 'rgba(255, 255, 255, 0.85)' }}
                    >
                      {buyer}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
