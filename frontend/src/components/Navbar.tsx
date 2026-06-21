import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

const NAV_LINKS = [
  { label: 'Products',    href: '/#products'    },
  { label: 'About',       href: '/#about'       },
  { label: 'Industries',  href: '/#industries'  },
  { label: 'Process',     href: '/#process'     },
  { label: 'Global Reach',href: '/#global-reach'},
  { label: 'Blog',        href: '/blogs',  isRoute: true },
  { label: 'Contact',     href: '/#contact'     },
];

export default function Navbar() {
  const { openModal } = useModal();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen]   = useState(false);
  const [scrolled, setScrolled]   = useState(false);
  const isHeroState = pathname === '/' && !scrolled;

  /* ── scroll shadow ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ── lock body scroll when mobile menu is open ── */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  /* ── keyboard: Escape closes menu ── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeMenu();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [closeMenu]);

  return (
    <>
      {/* ════════════════════════ HEADER ════════════════════════ */}
      <header
        className={[
          'fixed top-0 left-0 right-0 z-50 w-full',
          'transition-[background-color,box-shadow] duration-300',
          scrolled
            ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]'
            : 'shadow-none',
        ].join(' ')}
        style={{ backgroundColor: isHeroState ? 'transparent' : '#F8F6F3' }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link
              to="/"
              aria-label="Mariah Coirs – home"
              className="flex flex-col justify-center leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 rounded-sm"
            >
              <span
                className={`text-[22px] font-extrabold tracking-tight transition-colors duration-300 ${isHeroState ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.3px' }}
              >
                Mariah Coirs
              </span>
              <span
                className="text-[10px] font-semibold mt-[3px]"
                style={{
                  color: '#B8892A',
                  letterSpacing: '0.22em',
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                EXPORT &nbsp;·&nbsp; SINCE 2009
              </span>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav
              aria-label="Main navigation"
              className="hidden md:flex items-center gap-1 lg:gap-2"
            >
              {NAV_LINKS.map(({ label, href, isRoute }) => (
                isRoute ? (
                  <Link
                    key={label}
                    to={href}
                    className={[
                      `relative px-3 py-1.5 text-[14.5px] font-medium ${isHeroState ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`,
                      'rounded-md transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700',
                      'group',
                    ].join(' ')}
                  >
                    {label}
                    <span aria-hidden="true" className={['absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full', isHeroState ? 'bg-white' : 'bg-gray-900', 'scale-x-0 origin-left', 'transition-transform duration-250 ease-out', 'group-hover:scale-x-100'].join(' ')} />
                  </Link>
                ) : (
                  <a
                    key={label}
                    href={href}
                    className={[
                      `relative px-3 py-1.5 text-[14.5px] font-medium ${isHeroState ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`,
                      'rounded-md transition-colors duration-200',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700',
                      'group',
                    ].join(' ')}
                  >
                    {label}
                    <span aria-hidden="true" className={['absolute bottom-0 left-3 right-3 h-[1.5px] rounded-full', isHeroState ? 'bg-white' : 'bg-gray-900', 'scale-x-0 origin-left', 'transition-transform duration-250 ease-out', 'group-hover:scale-x-100'].join(' ')} />
                  </a>
                )
              ))}
            </nav>

            {/* ── Desktop CTA ── */}
            <div className="hidden md:flex items-center">
              <button
                id="navbar-export-quote-btn"
                onClick={() => openModal('export')}
                className={[
                  'inline-flex items-center justify-center',
                  'px-7 py-[13px] rounded-xl',
                  'bg-gray-900 text-white text-[14px] font-semibold',
                  'transition-all duration-200 ease-out',
                  'hover:bg-gray-700 hover:scale-[1.03]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
                  'active:scale-[0.98]',
                ].join(' ')}
                style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                aria-label="Get an export quote from Mariah Coirs"
              >
                Get Export Quote
              </button>
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              type="button"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen(prev => !prev)}
              className={[
                'md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg',
                'transition-colors duration-150',
                'hover:bg-gray-100 active:bg-gray-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700',
              ].join(' ')}
            >
              {/* Three-bar → X morphing icon */}
              <span className="sr-only">{menuOpen ? 'Close menu' : 'Open menu'}</span>
              <span
                aria-hidden="true"
                className={[
                  `block w-5 h-[1.5px] rounded-full ${isHeroState ? 'bg-white' : 'bg-gray-800'}`,
                  'transition-all duration-300 origin-center',
                  menuOpen ? 'translate-y-[4.5px] rotate-45' : '',
                ].join(' ')}
              />
              <span
                aria-hidden="true"
                className={[
                  `block w-5 h-[1.5px] rounded-full mt-[4px] ${isHeroState ? 'bg-white' : 'bg-gray-800'}`,
                  'transition-all duration-300',
                  menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100',
                ].join(' ')}
              />
              <span
                aria-hidden="true"
                className={[
                  `block w-5 h-[1.5px] rounded-full mt-[4px] ${isHeroState ? 'bg-white' : 'bg-gray-800'}`,
                  'transition-all duration-300 origin-center',
                  menuOpen ? '-translate-y-[10px] -rotate-45' : '',
                ].join(' ')}
              />
            </button>

          </div>{/* /flex row */}
        </div>
      </header>

      {/* ════════════════════════ MOBILE MENU ════════════════════════ */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={[
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]',
          'transition-opacity duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Drawer */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className={[
          'fixed top-0 right-0 z-50 h-full w-[min(340px,100vw)]',
          'flex flex-col',
          'transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{ backgroundColor: '#F8F6F3' }}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-200">
          <Link to="/" onClick={closeMenu} className="flex flex-col leading-none">
            <span
              className="text-[20px] font-extrabold text-gray-900"
              style={{ letterSpacing: '-0.3px' }}
            >
              Mariah Coirs
            </span>
            <span
              className="text-[9px] font-semibold mt-[2px]"
              style={{ color: '#B8892A', letterSpacing: '0.22em' }}
            >
              EXPORT &nbsp;·&nbsp; SINCE 2009
            </span>
          </Link>

          {/* Close button */}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={closeMenu}
            className={[
              'flex items-center justify-center w-10 h-10 rounded-lg',
              'hover:bg-gray-100 active:bg-gray-200',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700',
            ].join(' ')}
          >
            <svg
              width="18" height="18" viewBox="0 0 18 18"
              fill="none" aria-hidden="true"
              stroke="#374151" strokeWidth="2" strokeLinecap="round"
            >
              <line x1="2" y1="2" x2="16" y2="16"/>
              <line x1="16" y1="2" x2="2" y2="16"/>
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <nav
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1"
        >
          {NAV_LINKS.map(({ label, href, isRoute }, i) => (
            isRoute ? (
              <Link
                key={label}
                to={href}
                onClick={closeMenu}
                style={{ transitionDelay: menuOpen ? `${i * 40}ms` : '0ms' }}
                className={[
                  'flex items-center px-4 py-4 rounded-xl',
                  'text-[16px] font-medium text-gray-700',
                  'hover:bg-gray-100 hover:text-gray-900',
                  'active:bg-gray-200',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700',
                ].join(' ')}
              >
                {label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-40">
                  <polyline points="6 3 11 8 6 13"/>
                </svg>
              </Link>
            ) : (
              <a
                key={label}
                href={href}
                onClick={closeMenu}
                style={{ transitionDelay: menuOpen ? `${i * 40}ms` : '0ms' }}
                className={[
                  'flex items-center px-4 py-4 rounded-xl',
                  'text-[16px] font-medium text-gray-700',
                  'hover:bg-gray-100 hover:text-gray-900',
                  'active:bg-gray-200',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700',
                ].join(' ')}
              >
                {label}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="ml-auto opacity-40">
                  <polyline points="6 3 11 8 6 13"/>
                </svg>
              </a>
            )
          ))}
        </nav>

        {/* Drawer CTA */}
        <div className="px-6 pb-10 pt-4 border-t border-gray-200">
          <button
            id="navbar-mobile-export-btn"
            onClick={() => { closeMenu(); openModal('export'); }}
            className={[
              'flex items-center justify-center w-full',
              'px-6 py-4 rounded-xl',
              'bg-gray-900 text-white text-[15px] font-semibold',
              'hover:bg-gray-700 active:scale-[0.98]',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2',
            ].join(' ')}
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
            aria-label="Get an export quote from Mariah Coirs"
          >
            Get Export Quote
          </button>
          <p className="text-center text-[12px] text-gray-400 mt-3 tracking-wide">
            Quality Coir Products · Worldwide
          </p>
        </div>
      </div>
    </>
  );
}
