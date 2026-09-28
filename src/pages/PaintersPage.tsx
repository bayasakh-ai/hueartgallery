import { useGallery } from '@/hooks/useGallery';
import { PainterCard } from '@/components/Cards';
import { PageHeader } from '@/components/UI';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';

interface PaintersPageProps {
  onNavigate: (page: 'painter-detail', slug: string) => void;
}

export default function PaintersPage({ onNavigate }: PaintersPageProps) {
  const { gallery, loading, error } = useGallery();

  if (loading) return <LoadingScreen />;
  if (error || !gallery) return <ErrorState />;

  const painters = [...gallery.painters].sort((a, b) => a.name.localeCompare(b.name));
  const counts: Record<string, number> = {};
  gallery.paintings.forEach((p) => {
    if (p.status === 'available') counts[p.painter_id] = (counts[p.painter_id] || 0) + 1;
  });

  return (
    <div>
      <PageHeader
        eyebrow="Artists"
        title="Painters"
        description={`The artists shown at ${gallery.site.name}.`}
      />
      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
          {painters.map((painter) => (
            <PainterCard
              key={painter.id}
              painter={painter}
              availableCount={counts[painter.id] || 0}
              onClick={() => onNavigate('painter-detail', painter.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
