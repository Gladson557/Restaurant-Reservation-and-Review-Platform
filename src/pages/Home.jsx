// src/pages/Home.jsx
import { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import RestaurantCard from "../components/RestaurantCard";
import SearchBar from "../components/SearchBar";
import FiltersPanel from "../components/FiltersPanel";

export default function Home() {
  // query/filter state
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});

  // results state
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 12, total: 0 });
  const [error, setError] = useState("");

  const fetchRestaurants = useCallback(
    async ({ page = 1, limit = meta.limit } = {}) => {
      setLoading(true);
      setError("");
      try {
        // Build params from query + filters + pagination
        const params = {
          q: query || undefined,
          cuisine: filters.cuisine || undefined,
          location: filters.location || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          features: filters.features || undefined,
          page,
          limit,
        };
        console.log("calling search", params)
        const res = await api.get("/restaurants/search", { params });
        setRestaurants(res.data.data || []);
        setMeta(res.data.meta || { page: 1, pages: 1, limit });
      } catch (err) {
        console.error("Failed to fetch restaurants", err);
        setError(err?.response?.data?.message || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    },
    [query, filters, meta.limit]
  );

  // initial load & whenever query/filters change -> fetch page 1
  useEffect(() => {
    fetchRestaurants({ page: 1 });
  }, [fetchRestaurants]);

  // pagination handlers
  const goToPage = (p) => {
    const page = Math.max(1, Math.min(meta.pages || 1, p));
    fetchRestaurants({ page });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Restaurants</h1>

      {/* Top: search + filters */}
      <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-4">
        <div>
          <SearchBar initial={query} onSearch={(q) => setQuery(q)} />
        </div>

        <div>
          <FiltersPanel
            initialFilters={filters}
            onApply={(f) => {
              // normalize empty values to {}
              setFilters(f || {});
            }}
          />
        </div>
      </div>

      {/* Status / error */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Loading restaurants...</p>
        </div>
      ) : error ? (
        <div className="text-red-600 mb-4">{error}</div>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-600">No restaurants found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {restaurants.map((r) => (
              <RestaurantCard key={r._id} restaurant={r} />
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing page {meta.page} of {meta.pages} — {meta.total || 0} results
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => goToPage((meta.page || 1) - 1)}
                disabled={(meta.page || 1) <= 1}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Prev
              </button>

              <button
                onClick={() => goToPage((meta.page || 1) + 1)}
                disabled={(meta.page || 1) >= (meta.pages || 1)}
                className="px-3 py-1 rounded border disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

