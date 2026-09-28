import { useGallery } from '@/hooks/useGallery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateRange, timingLabel } from '@/lib/data';
import { BackLink, SectionTitle, Button } from '@/components/UI';
import { PaintingCard } from '@/components/Cards';
import ImageSlider from '@/components/ImageSlider';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';
import { useScrollToTop } from '@/hooks/useScrollToTop';

interface EventDetailPageProps {
  slug: string;
  onBack: () => void;
  onNavigate: (page: 'painter-detail' | 'painting-detail', slug: string) => void;
}

export default function EventDetailPage({ slug, onBack, onNavigate }: EventDetailPageProps) {
  const { gallery, loading, error } = useGallery();
  const event = gallery?.events.find((e) => e.slug === slug) ?? null;

  useScrollToTop(slug);
  useDocumentTitle(event ? `${event.title} - ${gallery?.site.name}` : undefined);

  if (loading) return <LoadingScreen />;
  if (error || !gallery || !event) return <ErrorState message="Exhibition not found." />;

  const { painters, paintings } = event;

  const dateStr = formatDateRange(event.start_date, event.end_date);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={event.cover_url} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50" />
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-12">
          <p className="text-xs tracking-[0.25em] uppercase text-cream/70 mb-4 font-body fade-in">
            Exhibition · {timingLabel[event.timing]}
          </p>
          <h1 className="font-serif-display text-4xl md:text-5xl lg:text-6xl text-cream leading-tight max-w-3xl fade-in-up">
            {event.title}
          </h1>
        </div>
      </div>

      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-16">
        <BackLink label="All Events" onBack={onBack} />

        {/* Event meta */}
        <div className="grid md:grid-cols-3 gap-8 mt-12 mb-16 pb-12 border-b border-line">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-2 font-body">Dates</p>
            <p className="text-ink">{dateStr}</p>
          </div>
          {event.location && (
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-2 font-body">Location</p>
              <p className="text-ink">{event.location}</p>
            </div>
          )}
          {painters.length > 0 && (
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-2 font-body">Featured Artists</p>
              <p className="text-ink">{painters.map((p) => p.name).join(', ')}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <div className="max-w-3xl mb-20">
            <p className="text-lg text-ink-soft leading-relaxed whitespace-pre-line">{event.description}</p>
          </div>
        )}

        {/* Image Gallery / Slider */}
        {event.gallery_images && event.gallery_images.length > 0 && (
          <div className="mb-20">
            <SectionTitle eyebrow="Gallery" title="Exhibition Views" />
            <ImageSlider images={event.gallery_images} />
          </div>
        )}

        {/* Video */}
        {event.video_url && (
          <div className="mb-20">
            <SectionTitle eyebrow="Film" title="Exhibition Video" />
            <div className="aspect-video w-full bg-cream-dark">
              <video
                src={event.video_url}
                controls
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Featured Painters */}
        {painters.length > 0 && (
          <div className="mb-20">
            <SectionTitle eyebrow="Artists" title="Featured Painters" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {painters.map((painter) => (
                <div key={painter.id} className="group cursor-pointer" onClick={() => onNavigate('painter-detail', painter.slug)}>
                  <div className="image-zoom aspect-[3/4] mb-6 bg-cream-dark">
                    <img src={painter.portrait_url} alt={painter.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <h3 className="font-serif-display text-2xl text-ink group-hover:text-accent transition-colors duration-300">
                    {painter.name}
                  </h3>
                  <p className="text-sm text-ink-muted mt-1">{painter.style}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Artworks */}
        {paintings.length > 0 && (
          <div className="mb-20">
            <SectionTitle eyebrow="On View" title="Selected Artworks" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {paintings.map((painting) => (
                <PaintingCard
                  key={painting.id}
                  painting={painting}
                  painterName={painting.painter?.name}
                  onClick={() => onNavigate('painting-detail', painting.slug)}
                />
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-line">
          <Button variant="outline" onClick={onBack}>Back to Events</Button>
        </div>
      </div>
    </div>
  );
}
