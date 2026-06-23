import { useState, useEffect, useRef, useCallback } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useModal } from '../context/ModalContext';

// ─── Image Slides ────────────────────────────────────────────────
const SLIDES = [
  { src: '/mariahcoirs/droven_view.jpeg', alt: 'Aerial view of Mariah Coirs facility' },
  // { src: '/mariahcoirs/machine_process.jpeg', alt: 'Coir processing machinery in operation' },
  { src: '/mariahcoirs/machine_top.jpeg', alt: 'Top view of processing machines' },
  { src: '/mariahcoirs/coir_group.jpeg', alt: 'Top view of processing machines' },
  { src: '/mariahcoirs/machine.jpeg', alt: 'Top view of processing machines' },

  { src: '/mariahcoirs/raw_material.jpeg', alt: 'Top view of processing machines' },
  { src: '/mariahcoirs/long_view.jpeg', alt: 'Top view of processing machines' },
  // { src: '/mariahcoirs/process.jpeg', alt: 'Coir manufacturing process' },
  { src: '/mariahcoirs/mills_top_view.jpeg', alt: 'Top view of coir mills' },
  { src: '/mariahcoirs/bed.jpeg', alt: 'Coco peat growing medium' },
  // { src: '/mariahcoirs/machinr_cutter.jpeg', alt: 'Coir cutter machine' },
  // { src: '/mariahcoirs/coco_husk_cutted.jpg', alt: 'Cut coco husk ready for processing' },
];

const SLIDE_DURATION = 5000; // ms

// ─── Stats ───────────────────────────────────────────────────────
const STATS = [
  { value: '15+', label: 'Years Experience' },
  { value: '490+', label: 'Global Clients' },
  { value: '1,000+', label: 'MT Capacity / Month' },
  { value: '100%', label: 'Eco-Friendly' },
];

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Animation Variants ──────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_CUBIC, delay },
  }),
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut', delay },
  }),
};

// ─── Component ───────────────────────────────────────────────────
export default function HeroSection() {
  const { openModal } = useModal();
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shouldReduce = useReducedMotion();

  // Advance slide
  const advance = useCallback(() => {
    setCurrent(c => {
      setPrev(c);
      return (c + 1) % SLIDES.length;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(advance, SLIDE_DURATION);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  // Reset timer when manually navigating (future-proof)
  const goTo = useCallback((idx: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPrev(current);
    setCurrent(idx);
    timerRef.current = setInterval(advance, SLIDE_DURATION);
  }, [current, advance]);

  return (
    <section
      id="hero"
      aria-label="Mariah Coirs – Premium Coir Exporter"
      className="relative w-full flex flex-col overflow-hidden sm:min-h-[900px] lg:h-[100svh] lg:min-h-[760px] lg:max-h-[960px]"
    >
      {/* ══════════════════════════════════════════
          BACKGROUND IMAGE SLIDER
      ══════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0" aria-hidden="true">

        {/* Previous slide (fades out) */}
        <AnimatePresence initial={false}>
          {prev !== null && (
            <motion.div
              key={`prev-${prev}`}
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{}}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            >
              <img
                src={SLIDES[prev].src}
                alt=""
                className="w-full h-full object-cover"
                loading="eager"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current slide (Ken Burns zoom-in — subtle) */}
        <AnimatePresence initial={false}>
          <motion.div
            key={`slide-${current}`}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: shouldReduce ? 1 : 1.05 }}
            animate={{ opacity: 1, scale: shouldReduce ? 1 : 1.0 }}
            transition={{ opacity: { duration: 1.4, ease: 'easeInOut' }, scale: { duration: 8, ease: 'linear' } }}
          >
            <img
              src={SLIDES[current].src}
              alt={SLIDES[current].alt}
              className="w-full h-full object-cover"
              style={{
                objectPosition: 'center',
                filter: 'brightness(1.05) contrast(1.08) saturate(1.1)',
              }}
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Overlays ── */}
        {/* 1. Reduced base overlay — images must stay clearly visible */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.35)' }}
        />

        {/* 2. Left-side gradient only — right side stays bright */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(100deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 45%, rgba(0,0,0,0.05) 100%)',
          }}
        />

        {/* 3. Subtle golden radial glow (bottom-left accent) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 8% 85%, rgba(185,128,60,0.14) 0%, transparent 65%)',
          }}
        />

        {/* 4. Gentle bottom vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.40) 0%, transparent 30%)',
          }}
        />
      </div>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <div className="relative z-10 flex-none sm:flex-1 flex flex-col justify-start lg:justify-center w-full max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 sm:pt-24 pb-4 sm:pb-8">
        <div className="max-w-[720px] w-full">

          {/* ── Badge ── */}


          {/* ── Heading ── */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="font-black tracking-tight text-white text-[32px] sm:text-5xl lg:text-[56px] xl:text-[60px]"
            style={{
              lineHeight: '0.98',
              textShadow: '0 4px 20px rgba(0,0,0,0.30)',
            }}
          >
            Premium&nbsp;Coco&nbsp;Peat
            <br />
            <span style={{ color: '#D8A166', textShadow: '0 4px 20px rgba(0,0,0,0.30)' }}>
              &amp;<br />Coir&nbsp;Products
            </span>

            <br />
            for Global Growers
          </motion.h1>

          {/* ── Sub-heading ── */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.35}
            className="mt-4 sm:mt-5 text-sm sm:text-lg leading-relaxed max-w-[580px]"
            style={{
              color: 'rgba(255,255,255,0.88)',
              textShadow: '0 2px 12px rgba(0,0,0,0.25)',
            }}
          >
            Sustainable growing media trusted by international importers, greenhouse
            operators and hydroponic growers across&nbsp;50+ countries.
            Factory-direct. Export-certified.
          </motion.p>

          {/* ── Buttons ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="mt-5 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            {/* Primary – gold → opens Export modal */}
            <motion.button
              id="hero-export-quote-btn"
              onClick={() => openModal('export')}
              whileHover={shouldReduce ? {} : { scale: 1.04, y: -2 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              aria-label="Request an export quote from Mariah Coirs"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-[14px] sm:text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                background: 'transparent',
                color: '#D9A56A',
                boxShadow: 'none',
                border: '1.5px solid #D9A56A',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Request Export Quote
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 8 13 8" /><polyline points="9 4 13 8 9 12" /></svg>
            </motion.button>

            {/* Secondary – glass */}
            <motion.a
              href="#products"
              whileHover={shouldReduce ? {} : { scale: 1.03 }}
              whileTap={shouldReduce ? {} : { scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              aria-label="View Mariah Coirs products"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-semibold text-[14px] sm:text-[15px] text-white border border-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              style={{
                background: 'transparent',
              }}
            >
              View Products
            </motion.a>
          </motion.div>

        </div>
      </div>

      {/* ══════════════════════════════════════════
          STATS CARDS — in-flow, below content
      ══════════════════════════════════════════ */}
      <div
        className="relative z-10 w-full max-w-[1280px] mx-auto px-6 lg:px-10 pb-8"
        aria-label="Company statistics"
        style={{ marginTop: '16px' }}
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.7}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 max-w-[840px]"
        >
          {STATS.map(({ value, label }) => (
            <motion.div
              key={label}
              whileHover={shouldReduce ? {} : { y: -3, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="flex flex-col items-start p-3 sm:p-5 rounded-xl sm:rounded-2xl border cursor-default"
              style={{
                background: 'transparent',
                borderColor: 'rgba(255,255,255,0.15)',
                boxShadow: 'none',
              }}
              aria-label={`${value} ${label}`}
            >
              <span
                className="text-xl sm:text-3xl font-black leading-none"
                style={{ color: '#D8A166' }}
              >
                {value}
              </span>
              <span className="mt-1.5 text-[10px] sm:text-[13px] font-medium leading-snug" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════
          SLIDE INDICATORS
      ══════════════════════════════════════════ */}
      <div
        className="absolute bottom-5 right-6 sm:right-10 lg:right-16 z-10 flex items-center gap-2"
        aria-label="Image slide indicators"
        role="tablist"
      >
        {SLIDES.map((slide, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === current}
            aria-label={`Go to slide ${i + 1}: ${slide.alt}`}
            onClick={() => goTo(i)}
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full"
          >
            <motion.span
              animate={{
                width: i === current ? 24 : 6,
                opacity: i === current ? 1 : 0.4,
                backgroundColor: i === current ? '#D9A56A' : '#ffffff',
              }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="block h-1.5 rounded-full"
              style={{ display: 'block' }}
            />
          </button>
        ))}
      </div>




      {/* ══════════════════════════════════════════
          SLIDE PROGRESS BAR (thin top line)
      ══════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-20 h-[2px] bg-white/10" aria-hidden="true">
        <motion.div
          key={current}
          className="h-full origin-left"
          style={{ background: 'linear-gradient(90deg, #D9A56A, #C9875A)' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
        />
      </div>
    </section>
  );
}