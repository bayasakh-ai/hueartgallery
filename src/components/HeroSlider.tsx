import { useEffect, useState } from 'react';

interface HeroSliderProps {
  images: string[];
  alt: string;
}

/**
 * Full-bleed, auto-advancing background slider for the home page hero.
 * Crossfades between images; shows dots (click to jump) when there's more
 * than one image. Falls back to a single static image otherwise.
 */
export default function HeroSlider({ images, alt }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
    if (images.length < 2) return;
    const timer = setInterval(() => setCurrent((i) => (i + 1) % images.length), 6000);
    return () => clearInterval(timer);
  }, [images]);

  return (
    <div className="absolute inset-0">
      {images.map((src, i) => (
        <img
          key={src + i}
          src={src}
          alt={i === 0 ? alt : ''}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {images.length > 1 && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
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
