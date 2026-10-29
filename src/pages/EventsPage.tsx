import { useGallery } from '@/hooks/useGallery';
import { formatDateRange, sortEvents } from '@/lib/data';
import { useLanguage } from '@/lib/i18n';
import { EventCard } from '@/components/Cards';
import { PageHeader } from '@/components/UI';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';

interface EventsPageProps {
  onNavigate: (page: 'event-detail', slug: string) => void;
}

export default function EventsPage({ onNavigate }: EventsPageProps) {
  const { gallery, loading, error } = useGallery();
  const { t, lang } = useLanguage();

  if (loading) return <LoadingScreen />;
  if (error || !gallery) return <ErrorState />;

  const events = sortEvents(gallery.events);

  return (
    <div>
      <PageHeader
        eyebrow={t('exhibitionsEyebrow')}
        title={t('events')}
        description={t('exhibitionsIntro', { name: gallery.site.name })}
      />
      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-24">
        <div className="grid grid-cols-1 gap-16 md:gap-24">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={formatDateRange(event.start_date, event.end_date, 'short', lang)}
              location={event.location}
              description={event.description}
              coverUrl={event.cover_url}
              timing={event.timing}
              onClick={() => onNavigate('event-detail', event.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
