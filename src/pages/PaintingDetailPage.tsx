import { useGallery } from '@/hooks/useGallery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { priceLabel } from '@/lib/data';
import { BackLink, SectionTitle, Button } from '@/components/UI';
import { PaintingCard } from '@/components/Cards';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Mail } from 'lucide-react';

interface PaintingDetailPageProps {
  slug: string;
  onBack: () => void;
  onNavigate: (page: 'painter-detail' | 'painting-detail', slug: string) => void;
  onInquire: (paintingId: string) => void;
}

export default function PaintingDetailPage({ slug, onBack, onNavigate, onInquire }: PaintingDetailPageProps) {
  const { gallery, loading, error } = useGallery();
  const painting = gallery?.paintings.find((p) => p.slug === slug) ?? null;

  useScrollToTop(slug);
  useDocumentTitle(painting ? `${painting.title} - ${gallery?.site.name}` : undefined);

  if (loading) return <LoadingScreen />;
  if (error || !gallery || !painting) return <ErrorState message="Painting not found." />;

  const painter = painting.painter ?? null;
  const related = gallery.paintings
    .filter((p) => painting.painter_id && p.painter_id === painting.painter_id && p.id !== painting.id)
    .slice(0, 4);
  const price = priceLabel(painting);
  const detailRows: [string, string][] = (
    [
      ['Year', painting.year ? String(painting.year) : ''],
      ['Medium', painting.medium],
      ['Dimensions', painting.width_cm && painting.height_cm ? `${painting.width_cm} × ${painting.height_cm} cm` : ''],
      ['Frame', painting.frame],
      ['Signature', painting.signature],
      ['Authenticity', painting.authenticity],
      ['Price', painting.status === 'available' ? price : ''],
    ] as [string, string][]
  ).filter(([, value]) => value);

  return (
    <div>
      <div className="pt-28 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <BackLink label="All Paintings" onBack={onBack} />
      </div>

      {/* Main layout */}
      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-12">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Image */}
          <div className="md:sticky md:top-28 md:self-start">
            <div className="bg-cream-dark">
              <img src={painting.image_url} alt={painting.title} className="w-full h-auto" />
            </div>
          </div>

          {/* Details */}
          <div>
            {painter && (
              <button
                onClick={() => onNavigate('painter-detail', painter.slug)}
                className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body link-underline"
              >
                {painter.name}
              </button>
            )}
            <h1 className="font-serif-display text-4xl md:text-5xl text-ink leading-tight mb-6">
              {painting.title}
            </h1>

            {/* Status badge */}
            <div className="mb-8">
              <span className={`inline-block text-xs tracking-[0.15em] uppercase px-3 py-1 font-body ${
                painting.status === 'available'
                  ? 'bg-accent/10 text-accent'
                  : 'bg-ink/10 text-ink-muted'
              }`}>
                {painting.status === 'available' ? 'Available' : painting.status === 'reserved' ? 'Reserved' : 'Sold'}
              </span>
            </div>

            {/* Details table */}
            <div className="border-t border-line">
              {detailRows.map(([label, value]) => (
                <div key={label} className="flex justify-between py-4 border-b border-line">
                  <span className="text-xs tracking-[0.15em] uppercase text-ink-muted font-body">{label}</span>
                  <span className="text-ink text-sm">{value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {painting.description && (
              <div className="mt-8">
                <h3 className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-3 font-body">About this work</h3>
                <p className="text-ink-soft leading-relaxed whitespace-pre-line">{painting.description}</p>
              </div>
            )}

            {/* CTA */}
            {painting.status === 'available' && (
              <div className="mt-10">
                <Button onClick={() => onInquire(painting.slug)}>
                  <span className="inline-flex items-center gap-2">
                    <Mail size={16} />
                    Inquire about this work
                  </span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related works */}
      {related.length > 0 && (
        <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-16 mt-8 border-t border-line">
          <SectionTitle eyebrow="More by this artist" title="Related Works" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((r) => (
              <PaintingCard
                key={r.id}
                painting={r}
                painterName={r.painter?.name}
                onClick={() => onNavigate('painting-detail', r.slug)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-16 pt-8 border-t border-line">
        <Button variant="outline" onClick={onBack}>Back to Paintings</Button>
      </div>
    </div>
  );
}
