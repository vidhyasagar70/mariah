import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

// ─── Inline SVG Icons (Lucide Paths) ──────────────────────────────
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

// ─── Animation Config ─────────────────────────────────────────────
const EASE_CUBIC: [number, number, number, number] = [0.22, 1, 0.36, 1];

const footerContainerVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: EASE_CUBIC,
      staggerChildren: 0.1,
    },
  },
};

const columnVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #0A0A0A 0%, #050505 100%)',
      }}
      className="w-full relative overflow-hidden"
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[150px] -translate-y-1/2 pointer-events-none opacity-[0.03]"
        style={{
          background: 'radial-gradient(circle, #C99B67 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        variants={footerContainerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.08 }}
        className="max-w-[1280px] mx-auto px-6 sm:px-10 lg:px-16 pt-[100px] pb-[60px]"
      >
        {/* ─── Main Footer Columns ─────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-20">
          
          {/* Column 1: Brand Info */}
          <motion.div variants={columnVariants} className="flex flex-col gap-6">
            <Link
              to="/"
              className="flex flex-col select-none leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm w-fit"
              aria-label="Mariah Coirs - Home"
            >
              <span className="text-[24px] font-black tracking-tight text-white font-sans">
                Mariah Coirs
              </span>
              <span
                style={{ color: '#C99B67', letterSpacing: '3px' }}
                className="text-[10px] font-bold mt-1.5 uppercase font-sans"
              >
                EXPORT • SINCE 2009
              </span>
            </Link>

            <p className="text-[14px] leading-relaxed text-white/65 font-sans font-normal max-w-sm">
              India's premier manufacturer and exporter of premium coconut coir products.
              Supplying 50+ countries since 2009. ISO certified. Export-grade quality.
            </p>

            {/* Social Media Buttons */}
            <div className="flex items-center gap-3 flex-wrap" aria-label="Social Media Links">
              {[
                {
                  href: 'https://www.facebook.com/MariahCoirsExport',
                  icon: <FacebookIcon />,
                  label: 'Facebook',
                },
                {
                  href: 'https://www.instagram.com/mariahcoirsexport/',
                  icon: <InstagramIcon />,
                  label: 'Instagram',
                },
                {
                  href: 'https://www.youtube.com/@MariahCoirsExport',
                  icon: <YoutubeIcon />,
                  label: 'YouTube',
                },
              ].map(({ href, icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{
                    scale: 1.08,
                    y: -3,
                    boxShadow: '0 0 15px rgba(201, 155, 103, 0.4)',
                    borderColor: 'rgba(201, 155, 103, 0.4)',
                    backgroundColor: 'rgba(201, 155, 103, 0.05)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A0A] focus-visible:ring-[#C99B67]"
                  aria-label={`Visit our ${label} page`}
                >
                  {icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Products */}
          <motion.div variants={columnVariants} className="flex flex-col gap-6">
            <h3 className="text-[12px] font-bold tracking-[2px] text-white uppercase font-sans">
              Products
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                'Coco Peat Blocks',
                'Grow Bags',
                'Briquettes & Discs',
                'Husk Chips',
                'Coir Fibre Bales',
                'Custom Packaging',
              ].map(item => (
                <li key={item} className="overflow-hidden">
                  <a
                    href="/#products"
                    className="inline-block text-[14px] text-white/65 hover:text-white hover:translate-x-1 transition-all duration-200 ease-out font-sans font-medium focus-visible:outline-none focus-visible:underline focus-visible:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 3: Industries */}
          <motion.div variants={columnVariants} className="flex flex-col gap-6">
            <h3 className="text-[12px] font-bold tracking-[2px] text-white uppercase font-sans">
              Industries
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                'Hydroponics',
                'Floriculture',
                'Greenhouse',
                'Landscaping',
                'Animal Bedding',
                'Environmental',
              ].map(item => (
                <li key={item} className="overflow-hidden">
                  <a
                    href="/#industries"
                    className="inline-block text-[14px] text-white/65 hover:text-white hover:translate-x-1 transition-all duration-200 ease-out font-sans font-medium focus-visible:outline-none focus-visible:underline focus-visible:text-white"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Column 4: Company */}
          <motion.div variants={columnVariants} className="flex flex-col gap-6">
            <h3 className="text-[12px] font-bold tracking-[2px] text-white uppercase font-sans">
              Company
            </h3>
            <ul className="flex flex-col gap-3">
              {[
                { name: 'About Us', href: '/#about' },
                { name: 'Manufacturing', href: '/#about' },
                { name: 'Certifications', href: '/#about' },
                { name: 'Export Process', href: '/#process' },
                { name: 'Industry Insights', href: '/blogs', isRoute: true },
                { name: 'Contact Us', href: '/#contact' },
              ].map(item => (
                <li key={item.name} className="overflow-hidden">
                  {item.isRoute ? (
                    <Link
                      to={item.href}
                      className="inline-block text-[14px] text-white/65 hover:text-white hover:translate-x-1 transition-all duration-200 ease-out font-sans font-medium focus-visible:outline-none focus-visible:underline focus-visible:text-white"
                    >
                      {item.name}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className="inline-block text-[14px] text-white/65 hover:text-white hover:translate-x-1 transition-all duration-200 ease-out font-sans font-medium focus-visible:outline-none focus-visible:underline focus-visible:text-white"
                    >
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>

        </div>

        {/* Divider */}
        <div
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          className="w-full border-t mt-[60px] pt-[30px]"
          aria-hidden="true"
        />

        {/* ─── Footer Bottom Section ──────────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Bottom Left */}
          <span className="text-[13px] text-white/45 font-sans font-normal text-center md:text-left">
            © 2025 Mariah Coirs Export. All Rights Reserved.
          </span>

          {/* Bottom Right */}
          <div className="flex items-center gap-6 flex-wrap justify-center md:justify-end text-[13px] text-white/45 font-sans font-normal">
            <Link
              to="/privacy"
              className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/sitemap"
              className="hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:underline"
            >
              Sitemap
            </Link>
          </div>
        </div>

      </motion.div>
    </footer>
  );
}
