import { useState, useCallback, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import PaintersPage from '@/pages/PaintersPage';
import PainterDetailPage from '@/pages/PainterDetailPage';
import PaintingsPage from '@/pages/PaintingsPage';
import PaintingDetailPage from '@/pages/PaintingDetailPage';
import AboutPage from '@/pages/AboutPage';
import type { Page } from '@/types';

interface Route {
  page: Page;
  slug?: string;
  /** painting slug the visitor wants to ask about (contact form pre-fill) */
  inquire?: string;
}

/*
  Real URLs, no extra library:
    /  /events  /events/<slug>  /painters  /painters/<slug>
    /paintings  /paintings/<slug>  /about
  Links can be shared, and the browser's Back button and Refresh work.
  (netlify.toml sends every unknown path to index.html so refresh works live.)
*/
const LIST: Record<string, Page> = {
  events: 'events',
  painters: 'painters',
  paintings: 'paintings',
  about: 'about',
};
const DETAIL: Record<string, Page> = {
  events: 'event-detail',
  painters: 'painter-detail',
  paintings: 'painting-detail',
};
const SECTION: Partial<Record<Page, string>> = {
  events: 'events',
  'event-detail': 'events',
  painters: 'painters',
  'painter-detail': 'painters',
  paintings: 'paintings',
  'painting-detail': 'paintings',
  about: 'about',
};

function parseLocation(): Route {
  const parts = window.location.pathname.split('/').filter(Boolean).map(decodeURIComponent);
  const [section, slug] = parts;
  if (!section) return { page: 'home' };
  if (slug && DETAIL[section]) return { page: DETAIL[section], slug };
  if (LIST[section]) {
    const inquire = new URLSearchParams(window.location.search).get('inquire') ?? undefined;
    return { page: LIST[section], inquire };
  }
  return { page: 'home' };
}

function toUrl(page: Page, slug?: string, inquire?: string): string {
  if (page === 'home') return '/';
  const section = SECTION[page];
  if (!section) return '/';
  let url = `/${section}`;
  if (slug) url += `/${encodeURIComponent(slug)}`;
  if (inquire) url += `?inquire=${encodeURIComponent(inquire)}`;
  return url;
}

function App() {
  const [route, setRoute] = useState<Route>(parseLocation);

  const navigate = useCallback((page: Page, slug?: string, inquire?: string) => {
    const url = toUrl(page, slug, inquire);
    if (url !== window.location.pathname + window.location.search) {
      window.history.pushState(null, '', url);
    }
    setRoute({ page, slug, inquire });
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(parseLocation());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const goHome = (page: Page) => navigate(page);

  // Tab title for list pages (detail pages set their own).
  useEffect(() => {
    const names: Partial<Record<Page, string>> = {
      events: 'Events',
      painters: 'Painters',
      paintings: 'Paintings',
      about: 'About Us',
    };
    const name = names[route.page];
    if (route.page === 'home') document.title = 'Hue Art Gallery';
    else if (name) document.title = `${name} - Hue Art Gallery`;
  }, [route.page]);

  const renderPage = () => {
    switch (route.page) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'events':
        return <EventsPage onNavigate={(p, slug) => navigate(p, slug)} />;
      case 'event-detail':
        return route.slug ? (
          <EventDetailPage
            slug={route.slug}
            onBack={() => navigate('events')}
            onNavigate={(p, slug) => navigate(p, slug)}
          />
        ) : null;
      case 'painters':
        return <PaintersPage onNavigate={(p, slug) => navigate(p, slug)} />;
      case 'painter-detail':
        return route.slug ? (
          <PainterDetailPage
            slug={route.slug}
            onBack={() => navigate('painters')}
            onNavigate={(p, slug) => navigate(p, slug)}
          />
        ) : null;
      case 'paintings':
        return <PaintingsPage onNavigate={(p, slug) => navigate(p, slug)} />;
      case 'painting-detail':
        return route.slug ? (
          <PaintingDetailPage
            slug={route.slug}
            onBack={() => navigate('paintings')}
            onNavigate={(p, slug) => navigate(p, slug)}
            onInquire={(paintingSlug) => navigate('about', undefined, paintingSlug)}
          />
        ) : null;
      case 'about':
        return <AboutPage inquirePainting={route.inquire} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar currentPage={route.page} onNavigate={goHome} />
      <main className="flex-1">{renderPage()}</main>
      <Footer onNavigate={goHome} />
    </div>
  );
}

export default App;
