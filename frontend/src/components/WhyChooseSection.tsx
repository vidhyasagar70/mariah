import { useState, useRef, useEffect, useCallback } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import type { Variants } from 'framer-motion';

// ─── Types & Interfaces ──────────────────────────────────────────
interface Feature {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── SVG Icons ───────────────────────────────────────────────────
const AwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ContainerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="3" x2="6" y2="17" />
    <line x1="18" y1="3" x2="18" y2="17" />
    <path d="M4 21h16" />
  </svg>
);

const PackageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
    <polygon points="12 22.08 12 12 3 6.92 3 17.08 12 22.08" />
    <polygon points="12 22.08 12 12 21 6.92 21 17.08 12 22.08" />
    <polygon points="12 12 3 6.92 12 1.84 21 6.92 12 12" />
  </svg>
);

const LeafIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 8.28-4.2 14.2A7 7 0 0 1 11 20z" />
    <path d="M19 2L9.8 11.2" />
  </svg>
);

const DollarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

// ─── Features Dataset ─────────────────────────────────────────────
const FEATURES: Feature[] = [
  {
    id: 1,
    icon: <AwardIcon />,
    title: 'ISO 9001:2015 Certified',
    description: 'International quality management certified with in-house lab accreditation and COIR BOARD registration.',
  },
  {
    id: 2,
    icon: <CheckCircleIcon />,
    title: 'Consistent Batch Quality',
    description: 'Lab-tested shipments with EC, pH and moisture certificates issued per container.',
  },
  {
    id: 3,
    icon: <ContainerIcon />,
    title: 'Fast Global Shipping',
    description: 'FCL/LCL to 50+ countries with 7–14 day container-loading turnaround from order confirmation.',
  },
  {
    id: 4,
    icon: <PackageIcon />,
    title: 'Custom OEM Packaging',
    description: 'White-label and private label with custom BOPP bags, carton printing and multilingual labels.',
  },
  {
    id: 5,
    icon: <LeafIcon />,
    title: 'Sustainable Manufacturing',
    description: '100% renewable coconut husk feedstock with zero-waste production process since 2009.',
  },
  {
    id: 6,
    icon: <DollarIcon />,
    title: 'Factory-Direct Pricing',
    description: 'No intermediaries. Transparent FOB, CIF and CNF pricing for export orders of all volumes.',
  },
  {
    id: 7,
    icon: <HeadsetIcon />,
    title: 'Dedicated Account Manager',
    description: 'Named export manager with documentation support and weekly shipment updates.',
  },
  {
    id: 8,
    icon: <BarChartIcon />,
    title: 'Scalable Capacity',
    description: '1000+ MT monthly production capacity expandable for long-term global supply contracts.',
  },
];

// ─── Animations ───────────────────────────────────────────────────
const headerFade: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_CUBIC } },
};

// ─── Feature Card Component ────────────────────────────────────────
function FeatureCard({ feature, reduce }: { feature: Feature; reduce: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      onHoverStart={() => !reduce && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduce ? {} : { y: -8 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="relative flex flex-col justify-start p-8 overflow-hidden shrink-0 select-none cursor-default h-full"
      style={{
        minHeight: '230px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: hovered ? '1px solid rgba(201, 155, 103, 0.40)' : '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: hovered
          ? '0 16px 36px rgba(0, 0, 0, 0.4), 0 0 24px rgba(201, 155, 103, 0.12)'
          : '0 8px 24px rgba(0, 0, 0, 0.2)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
    >
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 10% 10%, rgba(201, 155, 103, 0.06), transparent 70%)',
          }}
        />
      )}

      <motion.div
        animate={hovered ? { scale: 1.05 } : { scale: 1.0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{
          background: 'rgba(201, 155, 103, 0.12)',
          color: '#C99B67',
        }}
        aria-hidden="true"
      >
        {feature.icon}
      </motion.div>

      <h3
        className="mt-5 font-bold tracking-tight text-white text-[17px] sm:text-[18px]"
        style={{ letterSpacing: '-0.01em' }}
      >
        {feature.title}
      </h3>
      <p
        className="mt-2.5 leading-relaxed text-[13px] sm:text-[14px]"
        style={{ color: 'rgba(255, 255, 255, 0.60)' }}
      >
        {feature.description}
      </p>
    </motion.div>
  );
}

// ─── Carousel Arrow Button ─────────────────────────────────────────
function ArrowButton({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === 'left' ? 'Previous' : 'Next'}
      className="flex items-center justify-center w-11 h-11 rounded-full shrink-0 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.10)',
        color: '#C99B67',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.borderColor = 'rgba(201, 155, 103, 0.40)';
          e.currentTarget.style.background = 'rgba(201, 155, 103, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.10)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {direction === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
      </svg>
    </button>
  );
}

// ─── Carousel Component ────────────────────────────────────────────
function FeaturesCarousel({ reduce }: { reduce: boolean }) {
  const [itemsPerView, setItemsPerView] = useState(3);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const computeItemsPerView = () => {
      if (window.innerWidth < 768) return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    };
    const handleResize = () => {
      setItemsPerView(computeItemsPerView());
      setIndex(0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, FEATURES.length - itemsPerView);

  const goTo = useCallback(
    (newIndex: number) => {
      setIndex(Math.max(0, Math.min(maxIndex, newIndex)));
    },
    [maxIndex]
  );

  const handlePrev = () => goTo(index - 1);
  const handleNext = () => goTo(index + 1);

  const dotCount = maxIndex + 1;

  return (
    <div className="relative">
      {/* Track */}
      <div className="overflow-hidden">
        <motion.div
          className="flex gap-6 sm:gap-8"
          animate={{ x: `calc(-${index} * (100% / ${itemsPerView}) - ${index} * (1.5rem / ${itemsPerView}))` }}
          transition={reduce ? { duration: 0 } : { duration: 0.55, ease: EASE_CUBIC }}
          drag={itemsPerView === 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) handleNext();
            else if (info.offset.x > 60) handlePrev();
          }}
        >
          {FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="shrink-0"
              style={{
                width: `calc((100% - ${(itemsPerView - 1) * 1.5}rem) / ${itemsPerView})`,
              }}
            >
              <FeatureCard feature={feature} reduce={reduce} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mt-8">
        <ArrowButton direction="left" onClick={handlePrev} disabled={index === 0} />

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: dotCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === index ? '24px' : '8px',
                height: '8px',
                background: i === index ? '#C99B67' : 'rgba(255, 255, 255, 0.18)',
              }}
            />
          ))}
        </div>

        <ArrowButton direction="right" onClick={handleNext} disabled={index === maxIndex} />
      </div>
    </div>
  );
}

// ─── Main Section Component ────────────────────────────────────────
export default function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.12 });
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="why-us"
      ref={sectionRef}
      aria-label="Why Choose Mariah Coirs Export"
      className="relative w-full overflow-hidden"
      style={{
        background: '#0A0A0A',
        paddingTop: '64px',
        paddingBottom: '64px',
      }}
    >
      {/* ── Background Radial Accent Gradients ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: [
            'radial-gradient(circle at 15% 20%, rgba(201, 155, 103, 0.07) 0%, transparent 60%)',
            'radial-gradient(circle at 85% 80%, rgba(201, 155, 103, 0.05) 0%, transparent 60%)',
          ].join(', '),
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16">

        {/* ══════════════════════════════════════════
            SECTION HEADER
        ══════════════════════════════════════════ */}
        <motion.div
          variants={headerFade}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-8"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.32em] mb-2"
            style={{ color: '#C99B67' }}
          >
            Why Partner With Us
          </span>
          <h2
            className="font-extrabold text-white tracking-tight"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.025em',
            }}
          >
            Why Choose Mariah Coirs Export
          </h2>
        </motion.div>

        {/* ══════════════════════════════════════════
            FEATURES CAROUSEL
        ══════════════════════════════════════════ */}
        <FeaturesCarousel reduce={!!shouldReduce} />

      </div>
    </section>
  );
}