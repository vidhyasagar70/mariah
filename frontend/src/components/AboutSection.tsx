import { useRef } from 'react';
import {
  motion,
  useInView,
  useReducedMotion,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useModal } from '../context/ModalContext';

// ─── Data ────────────────────────────────────────────────────────
const CERTIFICATIONS = [
  'ISO 9001:2015',
  'Export Quality',
  'Global Standards',
  'Factory Direct',
  'Trusted Partner',
];

const STATS = [
  { value: '15+', label: 'Years Experience' },
  { value: '490+', label: 'Global Clients' },
  { value: '1,000+', label: 'MT Capacity/Mo' },
];

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Animation helpers ───────────────────────────────────────────
const makeSlide = (dir: 'left' | 'right'): Variants => ({
  hidden: { opacity: 0, x: dir === 'left' ? -56 : 56 },
  visible: {
    opacity: 1, x: 0,
    transition: { duration: 0.85, ease: EASE_CUBIC },
  },
});

const fadeUp = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease: EASE_CUBIC, delay },
  },
});

const counterAnim = (delay = 0): Variants => ({
  hidden: { opacity: 0, y: 24, scale: 0.88 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: EASE_CUBIC, delay },
  },
});

// ─── Floating Card ───────────────────────────────────────────────
interface FloatingCardProps {
  icon: string;
  title: string;
  subtitle: string;
  position: 'top-left' | 'bottom-right';
  delay?: number;
  reduce: boolean;
}

function FloatingCard({ icon, title, subtitle, position, delay = 0, reduce }: FloatingCardProps) {
  const positionClass =
    position === 'top-left'
      ? 'top-5 left-5 sm:top-6 sm:left-6'
      : 'bottom-5 right-5 sm:bottom-6 sm:right-6';

  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: position === 'top-left' ? -20 : 20,
          scale: 0.9,
        },
        visible: {
          opacity: 1, y: 0, scale: 1,
          transition: { duration: 0.65, ease: EASE_CUBIC, delay },
        },
      }}
      whileHover={reduce ? {} : { y: -4, scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`absolute ${positionClass} z-20 flex items-center gap-3 px-4 py-3 rounded-2xl`}
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(210,185,140,0.35)',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
        minWidth: '188px',
      }}
    >
      {/* Icon bubble */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
        style={{
          background: 'linear-gradient(135deg, #E8B458 0%, #C97B38 100%)',
          boxShadow: '0 4px 14px rgba(195,123,56,0.38)',
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className="text-[13px] font-bold"
          style={{ color: '#1C1108' }}
        >
          {title}
        </span>
        <span
          className="text-[11px] font-medium mt-0.5"
          style={{ color: '#8C7255' }}
        >
          {subtitle}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function AboutSection() {
  const { openModal } = useModal();
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const shouldReduce = useReducedMotion();

  return (
    <section
      id="about"
      ref={sectionRef}
      aria-label="About Mariah Coirs Manufacturing Facility"
      className="w-full overflow-hidden"
      style={{ background: '#F7F4EF' }}
    >
      {/* ── Top border accent ── */}
      <div
        className="w-full h-[3px]"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, #D9A56A 30%, #C97B38 60%, transparent 100%)',
          opacity: 0.45,
        }}
        aria-hidden="true"
      />

      <div className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 py-20 lg:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">

          {/* ══════════════════════════════════════════
              LEFT — IMAGE WITH FLOATING CARDS
          ══════════════════════════════════════════ */}
          <motion.div
            variants={shouldReduce ? {} : makeSlide('left')}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="relative order-2 lg:order-1"
          >
            {/* Image wrapper */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: '24px',
                boxShadow:
                  '0 24px 64px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.08)',
                aspectRatio: '4 / 3.2',
              }}
            >
              {/* Ken-Burns on inView */}
              <motion.img
                src="/mariahcoirs/machinr_cutter.jpeg"
                alt="Mariah Coirs coir cutter machine at the Tamil Nadu manufacturing facility"
                className="w-full h-full object-cover"
                initial={shouldReduce ? {} : { scale: 1.08 }}
                animate={isInView && !shouldReduce ? { scale: 1.0 } : {}}
                transition={{ duration: 12, ease: 'linear' }}
                style={{ filter: 'brightness(1.06) contrast(1.05) saturate(1.12)' }}
              />

              {/* Subtle dark gradient — depth only, image stays visible */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(170deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.28) 100%)',
                }}
                aria-hidden="true"
              />
            </div>


            {/* Decorative corner accent */}
            <div
              className="absolute -bottom-4 -left-4 w-24 h-24 rounded-2xl -z-10"
              style={{
                background: 'linear-gradient(135deg, #E8B458 0%, #D4924E 100%)',
                opacity: 0.18,
              }}
              aria-hidden="true"
            />
          </motion.div>

          {/* ══════════════════════════════════════════
              RIGHT — CONTENT
          ══════════════════════════════════════════ */}
          <motion.div
            variants={shouldReduce ? {} : makeSlide('right')}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex flex-col order-1 lg:order-2"
          >
            {/* ── Premium Badge ── */}
            <motion.div
              variants={fadeUp(0.1)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="inline-flex mb-5"
            >
              <span
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{
                  background: 'rgba(215,155,70,0.12)',
                  border: '1.5px solid rgba(205,145,60,0.35)',
                  color: '#B8742A',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#C98438' }}
                  aria-hidden="true"
                />
                About Our Facility
              </span>
            </motion.div>

            {/* ── Heading ── */}
            <motion.h2
              variants={fadeUp(0.18)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="font-black tracking-tight"
              style={{
                fontSize: 'clamp(1.9rem, 3.6vw, 2.8rem)',
                lineHeight: '1.08',
                color: '#0F0A04',
                letterSpacing: '-0.02em',
              }}
            >
              A World-Class Manufacturing
              <br />
              <span
                style={{
                  background: 'linear-gradient(90deg, #C98438 0%, #A86828 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Facility in Tamil Nadu
              </span>
            </motion.h2>

            {/* ── Description 1 ── */}
            <motion.p
              variants={fadeUp(0.28)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="mt-5 leading-relaxed"
              style={{
                fontSize: 'clamp(0.9rem, 1.25vw, 1.02rem)',
                color: '#4A3C28',
                maxWidth: '540px',
              }}
            >
              Founded in 2009 and headquartered in Pollachi, Tamil Nadu, our
              manufacturing facility operates with advanced machinery, strict quality
              control processes, and globally recognized production standards.
            </motion.p>

            {/* ── Description 2 ── */}
            <motion.p
              variants={fadeUp(0.36)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="mt-4 leading-relaxed"
              style={{
                fontSize: 'clamp(0.9rem, 1.25vw, 1.02rem)',
                color: '#4A3C28',
                maxWidth: '540px',
              }}
            >
              We serve international importers, agricultural businesses, greenhouse
              operators, and commercial distributors across multiple countries,
              delivering premium-quality products with factory-direct efficiency.
            </motion.p>

            {/* ── Certification Badges ── */}
            <motion.div
              variants={fadeUp(0.44)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="mt-6 flex flex-wrap gap-2"
              aria-label="Certifications"
            >
              {CERTIFICATIONS.map((cert, i) => (
                <motion.span
                  key={cert}
                  whileHover={shouldReduce ? {} : { y: -2, scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20 }}
                  className="inline-flex items-center px-4 py-[7px] rounded-full text-[12px] font-semibold cursor-default select-none"
                  style={{
                    background: i === 0
                      ? 'rgba(195,130,50,0.10)'
                      : 'rgba(30,20,10,0.05)',
                    border: i === 0
                      ? '1.5px solid rgba(195,130,50,0.40)'
                      : '1.5px solid rgba(30,20,10,0.10)',
                    color: i === 0 ? '#9A6018' : '#5A4830',
                  }}
                >
                  {cert}
                </motion.span>
              ))}
            </motion.div>

            {/* ── Divider ── */}
            <div
              className="mt-8 mb-6 h-px w-full"
              style={{ background: 'rgba(30,20,10,0.08)' }}
              aria-hidden="true"
            />

            {/* ── Statistics Row ── */}
            <div
              className="flex flex-wrap gap-8 sm:gap-12"
              aria-label="Key statistics"
            >
              {STATS.map(({ value, label }, i) => (
                <motion.div
                  key={label}
                  variants={counterAnim(0.54 + i * 0.1)}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="flex flex-col"
                  aria-label={`${value} ${label}`}
                >
                  <span
                    className="font-black leading-none"
                    style={{
                      fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
                      color: '#0F0A04',
                      letterSpacing: '-0.03em',
                    }}
                  >
                    {value}
                  </span>
                  <span
                    className="mt-1.5 text-[12px] sm:text-[13px] font-medium"
                    style={{ color: '#8C7255' }}
                  >
                    {label}
                  </span>

                  {/* Subtle underline accent */}
                  <motion.div
                    className="mt-2 h-[2.5px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #D9A56A, transparent)' }}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.7 + i * 0.1,
                    }}
                  />
                </motion.div>
              ))}
            </div>

            {/* ── CTA ── */}
            <motion.div
              variants={fadeUp(0.78)}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="mt-8"
            >
              <motion.a
                href="#quote"
                onClick={(e) => { e.preventDefault(); openModal('export'); }}
                whileHover={shouldReduce ? {} : { scale: 1.04, y: -2 }}
                whileTap={shouldReduce ? {} : { scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                aria-label="Request a quote from Mariah Coirs"
                className="inline-flex items-center gap-2.5 px-7 py-[13px] rounded-xl font-bold text-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                style={{
                  background: 'linear-gradient(135deg, #D9A56A 0%, #B87038 100%)',
                  color: '#160D03',
                  boxShadow: '0 6px 24px rgba(185,110,50,0.38), 0 2px 6px rgba(0,0,0,0.10)',
                  letterSpacing: '0.01em',
                }}
              >
                Request a Quote
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 8 13 8" />
                  <polyline points="9 4 13 8 9 12" />
                </svg>
              </motion.a>
            </motion.div>

          </motion.div>
          {/* end right col */}

        </div>
      </div>
    </section>
  );
}
