import { useGallery } from '@/hooks/useGallery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { BackLink, SectionTitle, Button } from '@/components/UI';
import { PaintingCard } from '@/components/Cards';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Award, GraduationCap, Palette } from 'lucide-react';

interface PainterDetailPageProps {
  slug: string;
  onBack: () => void;
  onNavigate: (page: 'painting-detail', slug: string) => void;
}

export default function PainterDetailPage({ slug, onBack, onNavigate }: PainterDetailPageProps) {
  const { gallery, loading, error } = useGallery();
  const painter = gallery?.painters.find((p) => p.slug === slug) ?? null;

  useScrollToTop(slug);
  useDocumentTitle(painter ? `${painter.name} - ${gallery?.site.name}` : undefined);

  if (loading) return <LoadingScreen />;
  if (error || !gallery || !painter) return <ErrorState message="Painter not found." />;

  const paintings = gallery.paintings
    .filter((p) => p.painter_id === painter.id)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  const availablePaintings = paintings.filter((p) => p.status === 'available');

  return (
    <div>
      {/* Portrait hero */}
      <div className="pt-28 px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto">
        <BackLink label="All Painters" onBack={onBack} />
      </div>

      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-12">
        <div className="grid md:grid-cols-5 gap-12 md:gap-16">
          <div className="md:col-span-2">
            <div className="image-zoom aspect-[3/4] bg-cream-dark sticky top-28">
              <img src={painter.portrait_url} alt={painter.name} className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="md:col-span-3">
            {painter.style && (
              <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4 font-body fade-in">
                {painter.style}
              </p>
            )}
            <h1 className="font-serif-display text-5xl md:text-6xl text-ink leading-tight mb-8 fade-in-up">
              {painter.name}
            </h1>

            {/* Bio */}
            {painter.bio && (
              <div className="mb-10">
                <h3 className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-3 font-body">Biography</h3>
                <p className="text-ink-soft leading-relaxed whitespace-pre-line">{painter.bio}</p>
              </div>
            )}

            {/* Education */}
            {painter.education && (
              <div className="mb-10 flex gap-4">
                <GraduationCap size={20} className="text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-2 font-body">Education</h3>
                  <p className="text-ink-soft leading-relaxed">{painter.education}</p>
                </div>
              </div>
            )}

            {/* Style */}
            {painter.style && (
              <div className="mb-10 flex gap-4">
                <Palette size={20} className="text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-2 font-body">Artistic Style</h3>
                  <p className="text-ink-soft leading-relaxed">{painter.style}</p>
                </div>
              </div>
            )}

            {/* Awards */}
            {painter.awards && painter.awards.length > 0 && (
              <div className="mb-10 flex gap-4">
                <Award size={20} className="text-accent shrink-0 mt-1" />
                <div>
                  <h3 className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-2 font-body">Awards & Recognition</h3>
                  <ul className="space-y-1">
                    {painter.awards.map((award, i) => (
                      <li key={i} className="text-ink-soft">{award}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Artist Statement */}
            {painter.statement && (
              <div className="mb-10 pl-6 border-l-2 border-accent">
                <h3 className="text-xs tracking-[0.2em] uppercase text-ink-muted mb-3 font-body">Artist Statement</h3>
                <p className="font-serif-display text-xl text-ink italic leading-relaxed">
                  "{painter.statement}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gallery of works */}
      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-16 mt-8 border-t border-line">
        <SectionTitle eyebrow="Catalogue" title="Gallery of Works" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {paintings.map((painting) => (
            <PaintingCard
              key={painting.id}
              painting={painting}
              onClick={() => onNavigate('painting-detail', painting.slug)}
            />
          ))}
        </div>
      </div>

      {/* Available works */}
      {availablePaintings.length > 0 && (
        <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto py-16 border-t border-line">
          <SectionTitle eyebrow="Available for Sale" title="Current Works" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {availablePaintings.map((painting) => (
              <PaintingCard
                key={painting.id}
                painting={painting}
                onClick={() => onNavigate('painting-detail', painting.slug)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-16 pt-8 border-t border-line">
        <Button variant="outline" onClick={onBack}>Back to Painters</Button>
      </div>
    </div>
  );
}
