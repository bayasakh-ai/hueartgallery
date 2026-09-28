import { ArrowRight } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';
import { featuredEvent, formatDateRange, paragraphs } from '@/lib/data';
import type { GalleryEvent } from '@/types';
import { useReveal } from '@/hooks/useReveal';
import { SectionTitle, Button } from '@/components/UI';
import { PainterCard, PaintingCard } from '@/components/Cards';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';

interface HomePageProps {
  onNavigate: (page: 'home' | 'events' | 'painters' | 'paintings' | 'about' | 'event-detail' | 'painter-detail' | 'painting-detail', slug?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { gallery, loading, error } = useGallery();

  if (loading) return <LoadingScreen />;
  if (error || !gallery) return <ErrorState />;

  const { site, painters, paintings, events } = gallery;
  const available = paintings.filter((p) => p.status === 'available');
  const heroPainting = available[0] ?? paintings[0] ?? null;
  const heroPainter = heroPainting?.painter ?? null;
  const currentEvent = featuredEvent(events);
  const featuredPainters = painters.slice(0, 3);
  const featuredPaintings = available.slice(0, 6);
  const introParagraphs = paragraphs(site.home_text);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroPainting?.image_url ?? site.home_image}
            alt={heroPainting?.title ?? site.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
        </div>
        <div className="relative h-full flex flex-col justify-end pb-20 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.25em] uppercase text-cream/80 mb-6 font-body fade-in-delay-1">
              {[heroPainter?.name, heroPainting?.year].filter(Boolean).join(' · ') || site.tagline}
            </p>
            <h1 className="font-serif-display text-5xl md:text-6xl lg:text-7xl text-cream leading-tight mb-6 fade-in-delay-2">
              {heroPainting?.title ?? site.name}
            </h1>
            {heroPainting?.description && (
              <p className="text-cream/70 text-lg leading-relaxed max-w-xl mb-8 fade-in-delay-3 line-clamp-3">
                {heroPainting.description}
              </p>
            )}
            <div className="flex flex-wrap gap-4 fade-in-delay-4">
              <Button variant="solid" onClick={() => onNavigate('paintings')}>
                View Collection
              </Button>
              <button
                onClick={() => onNavigate('painters')}
                className="px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-body text-cream border border-cream/40 hover:bg-cream hover:text-ink transition-all duration-300"
              >
                Explore Artists
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body">Welcome to {site.name}</p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-ink leading-tight mb-6">
              {site.home_title}
            </h2>
            {introParagraphs.map((para, i) => (
              <p key={i} className="text-ink-soft leading-relaxed text-lg mb-4">
                {para}
              </p>
            ))}
          </div>
          <div className="image-zoom aspect-[4/3]">
            <img
              src={site.home_image}
              alt={site.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Current Exhibition */}
      {currentEvent && (
        <CurrentExhibition
          event={currentEvent}
          onView={() => onNavigate('event-detail', currentEvent.slug)}
        />
      )}

      {/* Featured Painters */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <SectionTitle eyebrow="Artists" title="Featured Painters" />
          <button
            onClick={() => onNavigate('painters')}
            className="hidden md:inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors link-underline"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {featuredPainters.map((painter) => (
            <PainterCard
              key={painter.id}
              painter={painter}
              onClick={() => onNavigate('painter-detail', painter.slug)}
            />
          ))}
        </div>
        <div className="mt-10 md:hidden">
          <Button variant="outline" onClick={() => onNavigate('painters')}>
            View All Painters
          </Button>
        </div>
      </section>

      {/* Selected Paintings */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto bg-cream-dark/50">
        <div className="flex items-end justify-between mb-12">
          <SectionTitle eyebrow="Available Now" title="Selected Paintings" />
          <button
            onClick={() => onNavigate('paintings')}
            className="hidden md:inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors link-underline"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {featuredPaintings.map((painting) => (
            <PaintingCard
              key={painting.id}
              painting={painting}
              painterName={painting.painter?.name}
              onClick={() => onNavigate('painting-detail', painting.slug)}
            />
          ))}
        </div>
        <div className="mt-10 md:hidden">
          <Button variant="outline" onClick={() => onNavigate('paintings')}>
            View All Paintings
          </Button>
        </div>
      </section>
    </div>
  );
}

function CurrentExhibition({ event, onView }: { event: GalleryEvent; onView: () => void }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  const dateStr = formatDateRange(event.start_date, event.end_date);
  const label =
    event.timing === 'current' ? 'Current Exhibition' : event.timing === 'upcoming' ? 'Upcoming Exhibition' : 'Latest Exhibition';

  return (
    <section className="relative">
      <div
        ref={ref}
        className={`reveal ${visible ? 'is-visible' : ''} relative min-h-[70vh] flex items-center`}
      >
        <div className="absolute inset-0">
          <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-ink/40" />
        </div>
        <div className="relative px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-20">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.25em] uppercase text-cream/70 mb-4 font-body">
              {label}
            </p>
            <h2 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight mb-4">
              {event.title}
            </h2>
            <p className="text-cream/70 text-sm tracking-[0.1em] uppercase mb-6 font-body">
              {[dateStr, event.location].filter(Boolean).join(' · ')}
            </p>
            <p className="text-cream/80 leading-relaxed mb-8 line-clamp-3">
              {event.description}
            </p>
            <button
              onClick={onView}
              className="px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-body text-cream border border-cream/40 hover:bg-cream hover:text-ink transition-all duration-300"
            >
              View Exhibition
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
