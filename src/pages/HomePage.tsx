import { ArrowRight } from 'lucide-react';
import { useGallery } from '@/hooks/useGallery';
import { featuredEvent, paragraphs, timingKey } from '@/lib/data';
import { useLanguage } from '@/lib/i18n';
import { SectionTitle, Button } from '@/components/UI';
import { PainterCard, PaintingCard } from '@/components/Cards';
import HeroSlider from '@/components/HeroSlider';
import ImageSlider from '@/components/ImageSlider';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';

interface HomePageProps {
  onNavigate: (page: 'home' | 'events' | 'painters' | 'paintings' | 'about' | 'event-detail' | 'painter-detail' | 'painting-detail', slug?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { gallery, loading, error } = useGallery();
  const { t } = useLanguage();

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

  // Hero: the current/next exhibition's photos when there is one (cover +
  // any exhibition photos added in the CMS, in order, de-duplicated), else
  // a single available painting, else the site's default home picture.
  const eventImages = currentEvent
    ? Array.from(new Set([currentEvent.cover_url, ...currentEvent.gallery_images].filter(Boolean)))
    : [];
  const heroImages = eventImages.length > 0
    ? eventImages
    : [heroPainting?.image_url ?? site.home_image];
  const heroEyebrow = currentEvent
    ? `${t('timedExhibition', { timing: t(timingKey[currentEvent.timing]) })}${currentEvent.location ? ` · ${currentEvent.location}` : ''}`
    : [heroPainter?.name, heroPainting?.year].filter(Boolean).join(' · ') || site.tagline;
  const heroTitle = currentEvent?.title ?? heroPainting?.title ?? site.name;
  const heroText = currentEvent?.description || heroPainting?.description || '';

  return (
    <div>
      {/* Hero */}
      <section className="relative h-screen w-full overflow-hidden">
        <HeroSlider images={heroImages} alt={heroTitle} />
        <div className="relative h-full flex flex-col justify-end pb-20 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.25em] uppercase text-cream/80 mb-6 font-body fade-in-delay-1">
              {heroEyebrow}
            </p>
            <h1 className="font-serif-display text-5xl md:text-6xl lg:text-7xl text-cream leading-tight mb-6 fade-in-delay-2">
              {heroTitle}
            </h1>
            {heroText && (
              <p className="text-cream/70 text-lg leading-relaxed max-w-xl mb-8 fade-in-delay-3 line-clamp-3">
                {heroText}
              </p>
            )}
            <div className="flex flex-wrap gap-4 fade-in-delay-4">
              {currentEvent ? (
                <Button variant="solid" onClick={() => onNavigate('event-detail', currentEvent.slug)}>
                  {t('exhibitionDetails')}
                </Button>
              ) : (
                <Button variant="solid" onClick={() => onNavigate('paintings')}>
                  {t('viewCollection')}
                </Button>
              )}
              <button
                onClick={() => onNavigate(currentEvent ? 'paintings' : 'painters')}
                className="px-8 py-3.5 text-xs tracking-[0.2em] uppercase font-body text-cream border border-cream/40 hover:bg-cream hover:text-ink transition-all duration-300"
              >
                {t(currentEvent ? 'viewCollection' : 'exploreArtists')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body">{t('welcomeTo', { name: site.name })}</p>
            <h2 className="font-serif-display text-4xl md:text-5xl text-ink leading-tight mb-6">
              {site.home_title}
            </h2>
            {introParagraphs.map((para, i) => (
              <p key={i} className="text-ink-soft leading-relaxed text-lg mb-4">
                {para}
              </p>
            ))}
          </div>
          <ImageSlider images={site.home_images} aspect="aspect-[4/3]" />
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <div className="flex items-end justify-between mb-12">
          <SectionTitle eyebrow={t('artistsEyebrow')} title={t('featuredArtists')} />
          <button
            onClick={() => onNavigate('painters')}
            className="hidden md:inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors link-underline"
          >
            {t('viewAll')} <ArrowRight size={16} />
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
            {t('viewAllArtists')}
          </Button>
        </div>
      </section>

      {/* Selected Paintings */}
      <section className="py-24 md:py-32 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto bg-cream-dark/50">
        <div className="flex items-end justify-between mb-12">
          <SectionTitle eyebrow={t('availableNow')} title={t('selectedPaintings')} />
          <button
            onClick={() => onNavigate('paintings')}
            className="hidden md:inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink transition-colors link-underline"
          >
            {t('viewAll')} <ArrowRight size={16} />
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
            {t('viewAllPaintings')}
          </Button>
        </div>
      </section>
    </div>
  );
}
