import { useState, useRef } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import type { Variants } from 'framer-motion';

// ─── Types & Interfaces ──────────────────────────────────────────
interface Step {
  number: string;
  title: string;
  description: string;
}

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Process Steps Dataset ────────────────────────────────────────
const STEPS: Step[] = [
  {
    number: '01',
    title: 'Raw Coconut Husk',
    description: 'Sourced from certified coconut farms across Tamil Nadu and Kerala.',
  },
  {
    number: '02',
    title: 'Fibre Extraction',
    description: 'Industrial decorticators separate long coir fibre from the pith.',
  },
  {
    number: '03',
    title: 'Washing & Buffering',
    description: 'Multi-cycle washing reduces EC levels and buffering is performed based on customer requirements.',
  },
  {
    number: '04',
    title: 'Compression',
    description: 'Hydraulic compression converts processed material into blocks, briquettes and bales.',
  },
  {
    number: '05',
    title: 'QC & Lab Testing',
    description: 'EC, pH, moisture and compression ratio are verified according to export standards.',
  },
  {
    number: '06',
    title: 'Export Packaging',
    description: 'Products are packed, labelled and container-loaded for international shipment.',
  },
];

// ─── Animations ───────────────────────────────────────────────────
const headerFade: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_CUBIC } },
};

const timelineFade: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepFade: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: EASE_CUBIC },
  },
};

// ─── Process Step Card Component ──────────────────────────────────
function ProcessStep({ step, reduce, index }: { step: Step; reduce: boolean; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      variants={stepFade}
      onHoverStart={() => !reduce && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={reduce ? {} : { y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className="relative flex flex-col md:flex-col items-start md:items-center px-4 select-none cursor-default group gap-4 md:gap-0"
    >
      {/* Mobile: Vertical Timeline Line */}
      {index < STEPS.length - 1 && (
        <div
          className="absolute top-[26px] left-[25px] md:hidden w-[2px] h-[calc(100%+24px)]"
          style={{ background: 'rgba(229, 169, 60, 0.4)' }}
          aria-hidden="true"
        />
      )}

      {/* Step Badge */}
      <div
        className="w-[52px] h-[52px] rounded-xl flex items-center justify-center shrink-0 z-10 border"
        style={{
          background: hovered ? 'rgba(229, 169, 60, 0.20)' : 'rgba(229, 169, 60, 0.10)',
          borderColor: hovered ? 'rgba(229, 169, 60, 0.50)' : 'rgba(229, 169, 60, 0.30)',
          boxShadow: hovered
            ? '0 0 20px rgba(229, 169, 60, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 4px 10px rgba(0, 0, 0, 0.2)',
          transition: 'all 0.25s ease',
        }}
        aria-hidden="true"
      >
        <span
          className="text-[15px] font-bold"
          style={{ color: '#E5A93C' }}
        >
          {step.number}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 md:text-center pl-12 md:pl-0">
        <h3
          className="font-semibold tracking-tight text-white"
          style={{ fontSize: '18px', letterSpacing: '-0.015em' }}
        >
          {step.title}
        </h3>
        <p
          className="mt-2 leading-relaxed text-gray-300"
          style={{ fontSize: '14px' }}
        >
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Section Component ────────────────────────────────────────
export default function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 });
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="process"
      ref={sectionRef}
      aria-label="Our Manufacturing Process"
      className="relative w-full overflow-hidden"
      style={{
        background: '#0A0A0A',
        paddingTop: '140px',
        paddingBottom: '140px',
      }}
    >
      {/* ── Background Radial Glow ── */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(229, 169, 60, 0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">

        {/* ══════════════════════════════════════════
            SECTION HEADER
        ══════════════════════════════════════════ */}
        <motion.div
          variants={headerFade}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.32em] mb-4"
            style={{ color: '#E5A93C' }}
          >
            Our Process
          </span>
          <h2
            className="font-extrabold text-white tracking-tight"
            style={{
              fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
              lineHeight: '1.1',
              letterSpacing: '-0.025em',
            }}
          >
            From <span style={{ color: 'rgb(229, 169, 60)' }}>Husk</span> to <span style={{ color: 'rgb(229, 169, 60)' }}>Export Container</span>
          </h2>
        </motion.div>

        {/* ══════════════════════════════════════════
            PROCESS TIMELINE GRID
        ══════════════════════════════════════════ */}
        <div className="relative w-full">
          
          {/* ── Connecting line for Desktop/Tablet ──
              Hidden on mobile. Displays as a thin line running behind the badges. */}
          <div
            className="absolute top-[26px] left-[8%] right-[8%] h-[1px] hidden md:block"
            style={{ background: 'rgba(229, 169, 60, 0.4)' }}
            aria-hidden="true"
          >
            {/* Animated progress reveal */}
            <motion.div
              className="h-full origin-left bg-gradient-to-r from-rgb(229, 169, 60) to-[#C99B67]"
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.4, ease: EASE_CUBIC }}
              style={{ width: '100%' }}
            />
          </div>

          {/* ── Steps Container ── */}
          <motion.div
            variants={timelineFade}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-y-12 md:gap-y-16 gap-x-4 lg:gap-x-6"
          >
            {STEPS.map((step, index) => (
              <ProcessStep
                key={step.number}
                step={step}
                reduce={!!shouldReduce}
                index={index}
              />
            ))}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
