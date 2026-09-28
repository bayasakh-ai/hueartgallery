import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { Page } from '@/types';

interface NavbarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const navItems: { label: string; page: Page }[] = [
  { label: 'Home', page: 'home' },
  { label: 'Events', page: 'events' },
  { label: 'Painters', page: 'painters' },
  { label: 'Paintings', page: 'paintings' },
  { label: 'About Us', page: 'about' },
];

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const isHome = currentPage === 'home';
  const isTransparent = isHome && !scrolled && !menuOpen;

  const handleNav = (page: Page) => {
    onNavigate(page);
    setMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isTransparent
            ? 'bg-transparent'
            : 'bg-cream/95 backdrop-blur-md border-b border-line'
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-6 md:px-10 lg:px-16">
          <div className="flex items-center justify-between h-20">
            <button onClick={() => handleNav('home')} aria-label="Hue Art Gallery - home">
              {/* Logo turns white over the hero photo, full color once the bar is solid */}
              <img
                src="/images/header_logo.png"
                alt="Hue Art Gallery"
                className={`h-14 w-auto transition-all duration-500 ${
                  isTransparent ? 'brightness-0 invert' : ''
                }`}
              />
            </button>

            <div className="hidden md:flex items-center gap-10">
              {navItems.map((item) => {
                const active =
                  currentPage === item.page ||
                  (item.page === 'events' && currentPage === 'event-detail') ||
                  (item.page === 'painters' && currentPage === 'painter-detail') ||
                  (item.page === 'paintings' && currentPage === 'painting-detail');
                return (
                  <button
                    key={item.page}
                    onClick={() => handleNav(item.page)}
                    className={`text-sm tracking-[0.15em] uppercase font-body link-underline transition-colors duration-300 ${
                      isTransparent
                        ? active
                          ? 'text-cream'
                          : 'text-cream/80 hover:text-cream'
                        : active
                          ? 'text-ink'
                          : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden transition-colors duration-500 ${
                isTransparent ? 'text-cream' : 'text-ink'
              }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-cream transition-opacity duration-500 md:hidden ${
          menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navItems.map((item, i) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className="font-serif-display text-3xl text-ink hover:text-accent transition-colors duration-300"
              style={{
                animation: menuOpen
                  ? `fadeInUp 0.5s ease-out ${i * 0.08}s forwards`
                  : 'none',
                opacity: menuOpen ? undefined : 0,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
