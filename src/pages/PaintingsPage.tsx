import { useState, useMemo } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { PaintingCard } from '@/components/Cards';
import { PageHeader } from '@/components/UI';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorState from '@/components/ErrorState';
import { SlidersHorizontal, X } from 'lucide-react';

interface PaintingsPageProps {
  onNavigate: (page: 'painting-detail', slug: string) => void;
}

export default function PaintingsPage({ onNavigate }: PaintingsPageProps) {
  const { gallery, loading, error } = useGallery();
  const paintings = useMemo(() => gallery?.paintings ?? [], [gallery]);
  const painters = useMemo(
    () => [...(gallery?.painters ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
    [gallery]
  );

  // Filters
  const [painterFilter, setPainterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mediumFilter, setMediumFilter] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<string>('newest');
  const [showFilters, setShowFilters] = useState(false);

  const mediums = useMemo(() => {
    const set = new Set(paintings.map((p) => p.medium).filter(Boolean));
    return Array.from(set).sort();
  }, [paintings]);

  const filtered = useMemo(() => {
    let result = paintings.filter((p) => {
      if (painterFilter !== 'all' && p.painter_id !== painterFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (mediumFilter !== 'all' && p.medium !== mediumFilter) return false;
      if (priceRange !== 'all') {
        const price = p.price;
        if (priceRange === 'under-2m' && price >= 2000000) return false;
        if (priceRange === '2m-3.5m' && (price < 2000000 || price >= 3500000)) return false;
        if (priceRange === '3.5m+' && price < 3500000) return false;
      }
      return true;
    });

    if (sortOrder === 'newest') result = [...result].sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
    if (sortOrder === 'oldest') result = [...result].sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
    if (sortOrder === 'price-low') result = [...result].sort((a, b) => a.price - b.price);
    if (sortOrder === 'price-high') result = [...result].sort((a, b) => b.price - a.price);

    return result;
  }, [paintings, painterFilter, statusFilter, mediumFilter, priceRange, sortOrder]);

  const resetFilters = () => {
    setPainterFilter('all');
    setStatusFilter('all');
    setMediumFilter('all');
    setPriceRange('all');
    setSortOrder('newest');
  };

  if (loading) return <LoadingScreen />;
  if (error || !gallery) return <ErrorState />;

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Paintings"
        description="Browse our collection of paintings. Contact the gallery to arrange a viewing or to ask about a work."
      />

      <div className="px-6 md:px-10 lg:px-16 max-w-[1400px] mx-auto pb-24">
        {/* Filter bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-line">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 text-sm text-ink hover:text-accent transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <span className="text-sm text-ink-muted">
              {filtered.length} {filtered.length === 1 ? 'work' : 'works'}
            </span>
          </div>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="text-sm bg-transparent text-ink-soft border-b border-line py-1 pr-8 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-10 p-6 bg-cream-dark/50 fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">Painter</label>
                <select
                  value={painterFilter}
                  onChange={(e) => setPainterFilter(e.target.value)}
                  className="w-full text-sm bg-cream border border-line px-3 py-2 focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="all">All Painters</option>
                  {painters.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full text-sm bg-cream border border-line px-3 py-2 focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="all">All</option>
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">Medium</label>
                <select
                  value={mediumFilter}
                  onChange={(e) => setMediumFilter(e.target.value)}
                  className="w-full text-sm bg-cream border border-line px-3 py-2 focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="all">All Mediums</option>
                  {mediums.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs tracking-[0.15em] uppercase text-ink-muted mb-2 block font-body">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full text-sm bg-cream border border-line px-3 py-2 focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="all">All Prices</option>
                  <option value="under-2m">Under 2,000,000 ₮</option>
                  <option value="2m-3.5m">2,000,000 – 3,500,000 ₮</option>
                  <option value="3.5m+">3,500,000 ₮ and above</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink transition-colors"
              >
                <X size={14} /> Clear filters
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-ink-muted">No paintings match your filters.</p>
            <button onClick={resetFilters} className="mt-4 text-sm text-accent link-underline">Clear filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {filtered.map((painting) => (
              <PaintingCard
                key={painting.id}
                painting={painting}
                painterName={painting.painter?.name}
                onClick={() => onNavigate('painting-detail', painting.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
