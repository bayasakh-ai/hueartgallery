import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

interface LightboxProps {
  images: string[];
  alt: string;
  start: number;
  onClose: () => void;
}

const MAX_ZOOM = 4;
const CLICK_ZOOM = 2.5;

/**
 * Full-screen photo viewer.
 * Browse: arrows, keyboard ← →, or swipe. Close: X, Esc, or the dark background.
 * Zoom: click the photo, mouse wheel, pinch, or the + / − buttons; drag to move
 * around a zoomed photo.
 */
export default function Lightbox({ images, alt, start, onClose }: LightboxProps) {
  const { t } = useLanguage();
  const [index, setIndex] = useState(start);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  // Active pointers (mouse / fingers) and what the current gesture started from.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ x: 0, y: 0, ox: 0, oy: 0, dist: 0, scale: 1, moved: false });

  const many = images.length > 1;

  /** Keeps a zoomed photo from being dragged off screen. */
  const clamp = useCallback((x: number, y: number, s: number) => {
    const img = imgRef.current;
    if (!img || s <= 1) return { x: 0, y: 0 };
    const maxX = (img.offsetWidth * (s - 1)) / 2;
    const maxY = (img.offsetHeight * (s - 1)) / 2;
    return { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)) };
  }, []);

  /** Zoom to `s`, keeping the point (px, py) - relative to the photo's centre - in place. */
  const zoomTo = useCallback(
    (s: number, px = 0, py = 0) => {
      const next = Math.max(1, Math.min(MAX_ZOOM, s));
      setOffset((o) => {
        const ratio = next / scale;
        return clamp(px - (px - o.x) * ratio, py - (py - o.y) * ratio, next);
      });
      setScale(next);
    },
    [scale, clamp]
  );

  const go = useCallback(
    (step: number) => {
      setIndex((i) => (i + step + images.length) % images.length);
      setScale(1);
      setOffset({ x: 0, y: 0 });
    },
    [images.length]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && many) go(1);
      else if (e.key === 'ArrowLeft' && many) go(-1);
    };
    window.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose, go, many]);

  /** Point relative to the photo's centre. */
  const fromCentre = (clientX: number, clientY: number) => {
    const r = imgRef.current!.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2) + offset.x, y: clientY - (r.top + r.height / 2) + offset.y };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    gesture.current = {
      x: e.clientX,
      y: e.clientY,
      ox: offset.x,
      oy: offset.y,
      dist: pts.length === 2 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0,
      scale,
      moved: pts.length > 1,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const pts = [...pointers.current.values()];
    if (pts.length === 2 && g.dist) {
      // Pinch
      const s = Math.max(1, Math.min(MAX_ZOOM, (g.scale * Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)) / g.dist));
      setScale(s);
      setOffset((o) => clamp(o.x, o.y, s));
      return;
    }
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;
    if (scale > 1) setOffset(clamp(g.ox + dx, g.oy + dy, scale));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.delete(e.pointerId);
    if (pointers.current.size > 0) return;
    const g = gesture.current;
    const dx = e.clientX - g.x;
    if (!g.moved) {
      // A click / tap toggles zoom at that spot.
      if (scale > 1) zoomTo(1);
      else {
        const p = fromCentre(e.clientX, e.clientY);
        zoomTo(CLICK_ZOOM, p.x, p.y);
      }
    } else if (scale === 1 && many && Math.abs(dx) > 60) {
      go(dx < 0 ? 1 : -1); // swipe
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const p = fromCentre(e.clientX, e.clientY);
    zoomTo(scale * (e.deltaY < 0 ? 1.2 : 1 / 1.2), p.x, p.y);
  };

  const btn =
    'w-11 h-11 flex items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/25 transition-colors duration-200 disabled:opacity-30 disabled:pointer-events-none';

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink flex flex-col"
      style={{ animation: 'fadeIn 0.2s ease-out' }}
      role="dialog"
      aria-modal="true"
      aria-label={alt}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 md:px-6 h-16 shrink-0 text-cream/80 text-sm font-body">
        <span>{many ? t('photoCount', { n: index + 1, total: images.length }) : ''}</span>
        <div className="flex items-center gap-2">
          <button className={btn} onClick={() => zoomTo(scale / 1.5)} disabled={scale <= 1} aria-label={t('zoomOut')}>
            <ZoomOut size={20} />
          </button>
          <button className={btn} onClick={() => zoomTo(scale * 1.5)} disabled={scale >= MAX_ZOOM} aria-label={t('zoomIn')}>
            <ZoomIn size={20} />
          </button>
          <button className={btn} onClick={onClose} aria-label={t('close')}>
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Photo */}
      <div
        className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden px-4 md:px-20"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <img
          ref={imgRef}
          key={images[index]}
          src={images[index]}
          alt={alt}
          draggable={false}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          className={`max-w-full max-h-full object-contain select-none touch-none ${
            scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
          }`}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transition: pointers.current.size ? 'none' : 'transform 0.2s ease-out',
          }}
        />

        {many && (
          <>
            <button className={`${btn} absolute left-3 md:left-6 top-1/2 -translate-y-1/2`} onClick={() => go(-1)} aria-label={t('previous')}>
              <ChevronLeft size={24} />
            </button>
            <button className={`${btn} absolute right-3 md:right-6 top-1/2 -translate-y-1/2`} onClick={() => go(1)} aria-label={t('next')}>
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {many && (
        <div className="shrink-0 flex justify-center gap-2 px-4 py-4 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => i !== index && go(i - index)}
              aria-label={t('showPhoto', { n: i + 1 })}
              className={`w-14 h-14 shrink-0 overflow-hidden transition-opacity duration-200 ${
                i === index ? 'ring-2 ring-cream opacity-100' : 'opacity-50 hover:opacity-90'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
