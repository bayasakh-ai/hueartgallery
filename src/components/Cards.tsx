import type { EventTiming, Painter, Painting } from '@/types';
import { priceLabel, timingLabel } from '@/lib/data';
import { useReveal } from '@/hooks/useReveal';

interface PainterCardProps {
  painter: Painter;
  availableCount?: number;
  onClick: () => void;
}

export function PainterCard({ painter, availableCount, onClick }: PainterCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} group cursor-pointer`}
      onClick={onClick}
    >
      <div className="image-zoom aspect-[3/4] mb-6 bg-cream-dark">
        <img
          src={painter.portrait_url}
          alt={painter.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <h3 className="font-serif-display text-2xl text-ink mb-1 group-hover:text-accent transition-colors duration-300">
        {painter.name}
      </h3>
      {painter.style && <p className="text-sm text-ink-muted mb-2">{painter.style}</p>}
      {availableCount !== undefined && (
        <p className="text-xs tracking-[0.1em] uppercase text-ink-soft">
          {availableCount} {availableCount === 1 ? 'work' : 'works'} available
        </p>
      )}
    </div>
  );
}

interface PaintingCardProps {
  painting: Painting;
  painterName?: string;
  onClick: () => void;
}

export function PaintingCard({ painting, painterName, onClick }: PaintingCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} group cursor-pointer`}
      onClick={onClick}
    >
      <div className="image-zoom aspect-[4/5] mb-4 bg-cream-dark relative">
        <img
          src={painting.image_url}
          alt={painting.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {painting.status !== 'available' && (
          <div className="absolute top-4 right-4 bg-ink/80 text-cream text-xs tracking-[0.15em] uppercase px-3 py-1 font-body">
            {painting.status === 'reserved' ? 'Reserved' : 'Sold'}
          </div>
        )}
      </div>
      <h3 className="font-serif-display text-xl text-ink group-hover:text-accent transition-colors duration-300">
        {painting.title}
      </h3>
      {painterName && <p className="text-sm text-ink-muted mt-0.5">{painterName}</p>}
      <div className="flex items-baseline justify-between mt-2">
        <p className="text-xs text-ink-soft">{[painting.year, painting.medium].filter(Boolean).join(' · ')}</p>
        <p className="text-sm text-ink font-body font-medium">{priceLabel(painting)}</p>
      </div>
    </div>
  );
}

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  description: string;
  coverUrl: string;
  timing?: EventTiming;
  onClick: () => void;
}

export function EventCard({ title, date, location, description, coverUrl, timing, onClick }: EventCardProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} group cursor-pointer`}
      onClick={onClick}
    >
      <div className="image-zoom aspect-[16/10] mb-6 bg-cream-dark">
        <img
          src={coverUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex items-center gap-3 text-xs tracking-[0.15em] uppercase text-accent mb-3 font-body">
        <span>{date}</span>
        {timing && (
          <span
            className={`px-2.5 py-0.5 tracking-[0.12em] ${
              timing === 'past' ? 'bg-ink/10 text-ink-muted' : 'bg-accent/10 text-accent'
            }`}
          >
            {timingLabel[timing]}
          </span>
        )}
      </div>
      <h3 className="font-serif-display text-2xl md:text-3xl text-ink mb-2 group-hover:text-accent transition-colors duration-300">
        {title}
      </h3>
      {location && <p className="text-sm text-ink-muted mb-3">{location}</p>}
      {description && <p className="text-sm text-ink-soft leading-relaxed line-clamp-2">{description}</p>}
    </div>
  );
}
