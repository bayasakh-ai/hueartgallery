import { useEffect, useState } from 'react';
import { loadGallery } from '@/lib/data';
import type { Gallery } from '@/types';

/** Loads the gallery data once; pages just read { gallery, loading, error }. */
export function useGallery() {
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadGallery()
      .then((g) => !cancelled && setGallery(g))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  return { gallery, loading: !gallery && !error, error };
}
