import React, { useState } from "react";

/**
 * props:
 *  - onApply(filtersObj)
 *  - initialFilters (optional)
 */
export default function FiltersPanel({ onApply, initialFilters = {} }) {
  const [cuisine, setCuisine] = useState(initialFilters.cuisine || "");
  const [location, setLocation] = useState(initialFilters.location || "");
  const [minPrice, setMinPrice] = useState(initialFilters.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialFilters.maxPrice || "");
  const [features, setFeatures] = useState(initialFilters.features || []); // array

  const toggleFeature = (f) => {
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const apply = () => {
    onApply({
      cuisine,
      location,
      minPrice,
      maxPrice,
      features: features.join(","),
    });
  };

  const clear = () => {
    setCuisine("");
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setFeatures([]);
    onApply({});
  };

  return (
    <div className="border p-3 rounded bg-white shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input value={cuisine} onChange={(e) => setCuisine(e.target.value)} placeholder="Cuisine (e.g. Italian)" className="border p-2 rounded" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (city, area)" className="border p-2 rounded" />
        <input value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min price (1..5 or $..$$$)" className="border p-2 rounded" />
        <input value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max price" className="border p-2 rounded" />
      </div>

      <div className="mt-3">
        <div className="text-sm font-medium mb-1">Features</div>
        <div className="flex gap-2 flex-wrap">
          {["outdoor", "vegan", "live-music", "cozy"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFeature(f)}
              className={`px-2 py-1 rounded border ${features.includes(f) ? "bg-blue-600 text-white" : ""}`}
            >
              {f.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={apply} className="bg-green-600 px-3 py-1 text-white rounded">Apply</button>
        <button onClick={clear} className="px-3 py-1 rounded border">Clear</button>
      </div>
    </div>
  );
}

