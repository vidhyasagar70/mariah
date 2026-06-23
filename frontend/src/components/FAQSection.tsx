import { useState, useRef } from 'react';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQS: FAQItem[] = [
  {
    question: "What is your Minimum Order Quantity (MOQ)?",
    answer: (
      <span>
        Our MOQ varies depending on the region and shipping method. For international export orders, the MOQ is <strong>1 Full Container Load (FCL)</strong>. For domestic orders across India, the general MOQ is <strong>5 Metric Tons (MT)</strong>. <strong>Please note that the minimum order quantity in Tamil Nadu is 16 tons.</strong>
      </span>
    )
  },
  {
    question: "Where are your manufacturing facilities located?",
    answer: "Our state-of-the-art production facilities are based in Pollachi, Tamil Nadu, India. Pollachi is globally recognized as the prime coconut and coir production hub of South India, allowing us direct access to premium quality raw materials year-round."
  },
  {
    question: "Do you offer private labeling (OEM) and custom packaging?",
    answer: "Yes, we specialize in private labeling and custom packaging. We can customize block sizes (e.g., 5kg blocks, 650g briquettes), open-top bags, and grow bags. We also support custom BOPP bag printing, carton designs, and multilingual product labeling to align with your brand."
  },
  {
    question: "What quality standards and certifications do you follow?",
    answer: "We are ISO 9001:2015 certified and registered with the Coir Board of India. All shipments undergo rigorous testing in our in-house laboratory, and we issue certificates for Electrical Conductivity (EC), pH levels, expansion volume, and moisture content. For exports, we provide standard Phytosanitary and Fumigation Certificates."
  },
  {
    question: "Can we request product samples before ordering?",
    answer: "Yes! We encourage prospective partners to evaluate our product quality first. We provide sample packs for low EC coco peat blocks, grow bags, and husk chips. Contact our team, and we will arrange sample dispatch to your business location."
  },
  {
    question: "What are the payment and shipping terms you support?",
    answer: "We offer flexible shipping terms including FOB, CIF, CNF, and CFR to major ports worldwide. Payments are typically handled via LC (Letter of Credit) at sight or TT (Telegraphic Transfer) with a standard advance deposit."
  }
];

const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

function FAQCard({ item, isOpen, onClick, reduce }: { item: FAQItem; isOpen: boolean; onClick: () => void; reduce: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-full mb-4 overflow-hidden"
      style={{
        background: '#FFFFFF',
        border: isOpen ? '1.5px solid rgba(201, 155, 103, 0.50)' : hovered ? '1.5px solid rgba(201, 155, 103, 0.25)' : '1.5px solid rgba(0, 0, 0, 0.05)',
        borderRadius: '20px',
        boxShadow: isOpen
          ? '0 12px 28px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(185, 120, 45, 0.02)'
          : hovered
          ? '0 8px 20px rgba(0, 0, 0, 0.03)'
          : '0 4px 12px rgba(0, 0, 0, 0.01)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
      }}
      onMouseEnter={() => !reduce && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        <span
          className="text-base sm:text-lg font-bold text-gray-900 tracking-tight pr-4"
          style={{ letterSpacing: '-0.01em' }}
        >
          {item.question}
        </span>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: isOpen ? '#C99B67' : 'rgba(201, 155, 103, 0.08)',
            color: isOpen ? '#FFFFFF' : '#C99B67',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-300"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={reduce ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_CUBIC }}
          >
            <div
              className="px-6 pb-6 text-sm sm:text-base leading-relaxed text-gray-600 border-t border-gray-100 pt-4"
            >
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 });
  const shouldReduce = useReducedMotion();

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      aria-label="Frequently Asked Questions"
      className="relative w-full overflow-hidden"
      style={{
        background: '#FDFBF7',
        paddingTop: '96px',
        paddingBottom: '96px',
      }}
    >
      {/* Subtle Background Art */}
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 90% 10%, rgba(201, 155, 103, 0.04) 0%, transparent 50%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[800px] mx-auto px-6 sm:px-10">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: EASE_CUBIC }}
          className="text-center mb-12"
        >
          <span
            className="inline-block text-[11px] font-bold uppercase tracking-[0.32em] mb-3"
            style={{ color: '#C99B67' }}
          >
            Got Questions?
          </span>
          <h2
            className="font-extrabold text-gray-900 tracking-tight text-3xl sm:text-4xl lg:text-5xl"
            style={{ letterSpacing: '-0.025em', lineHeight: 1.15 }}
          >
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-gray-500 text-sm sm:text-base max-w-[500px] mx-auto">
            Find quick answers to common queries regarding our coir products, logistics, customization, and ordering process.
          </p>
        </motion.div>

        {/* FAQs Accordion Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="w-full"
        >
          {FAQS.map((faq, index) => (
            <FAQCard
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
              reduce={!!shouldReduce}
            />
          ))}
        </motion.div>

      </div>
    </section>
  );
}
