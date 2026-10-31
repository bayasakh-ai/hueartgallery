import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n';

interface HeroSliderProps {
  images: string[];
  alt: string;
  /** Optional video, played first. With photos it plays once, then the photos follow; alone it loops. */
  video?: string;
}

type Slide = { kind: 'video' | 'image'; src: string };

const PHOTO_SECONDS = 6;

/**
 * Full-bleed, auto-advancing background slider for the home page hero.
 * Crossfades between slides; shows dots (click to jump) when there's more
 * than one. A video slide moves on when it ends (or after a photo's time if
 * the browser won't autoplay it, e.g. phones in power-saving mode).
 */
export default function HeroSlider({ images, alt, video }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [videoBlocked, setVideoBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { t } = useLanguage();

  const slides: Slide[] = [
    ...(video ? [{ kind: 'video' as const, src: video }] : []),
    ...images.map((src) => ({ kind: 'image' as const, src })),
  ];
  const count = slides.length;
  const onVideo = slides[current]?.kind === 'video';
  const next = () => setCurrent((i) => (i + 1) % count);
  const slidesKey = slides.map((s) => s.src).join('|');

  useEffect(() => {
    setCurrent(0);
    setVideoBlocked(false);
  }, [slidesKey]);

  // Restart the video whenever its slide comes round; pause it otherwise.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (!onVideo) {
      v.pause();
      return;
    }
    v.currentTime = 0;
    v.play().catch(() => setVideoBlocked(true));
  }, [onVideo, current]);

  // Photos (and a video the browser won't play) move on after a fixed time.
  useEffect(() => {
    if (count < 2 || (onVideo && !videoBlocked)) return;
    const timer = setTimeout(next, PHOTO_SECONDS * 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, count, onVideo, videoBlocked]);

  return (
    <div className="absolute inset-0">
      {slides.map((slide, i) => {
        const className = 'absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out';
        const style = { opacity: i === current ? 1 : 0 };
        return slide.kind === 'video' ? (
          <video
            key={'video' + slide.src}
            ref={videoRef}
            src={slide.src}
            poster={images[0]}
            muted
            playsInline
            preload="auto"
            loop={count === 1}
            onEnded={next}
            onError={() => setVideoBlocked(true)}
            aria-label={alt}
            className={className}
            style={style}
          />
        ) : (
          <img
            key={slide.src + i}
            src={slide.src}
            alt={i === 0 ? alt : ''}
            className={className}
            style={style}
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {count > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={t('goToSlide', { n: i + 1 })}
              className={`h-1 transition-all duration-300 ${
                i === current ? 'w-8 bg-cream' : 'w-4 bg-cream/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
