import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSliderProps {
  images: string[];
  captions?: string[];
}

export default function ImageSlider({ images, captions }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % images.length);
  }, [images.length]);

  const prev = () => {
    setCurrent((p) => (p - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  if (images.length === 0) return null;

  return (
    <div className="relative w-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-cream-dark">
        {images.map((img, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
          >
            <img src={img} alt={`Slide ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-cream/80 hover:bg-cream text-ink transition-all duration-300"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-cream/80 hover:bg-cream text-ink transition-all duration-300"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>

          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1 transition-all duration-300 ${
                  i === current ? 'w-8 bg-ink' : 'w-4 bg-line'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {captions && captions[current] && (
        <p className="text-center text-sm text-ink-muted mt-3 font-body italic">
          {captions[current]}
        </p>
      )}
    </div>
  );
}
