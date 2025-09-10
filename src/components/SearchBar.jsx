import React, { useState } from "react";

export default function SearchBar({ initial = "", onSearch }) {
  const [value, setValue] = useState(initial);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        aria-label="Search restaurants"
        className="flex-1 border p-2 rounded"
        placeholder="Search by name (e.g. 'pizza', 'sushi')"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button type="submit" className="bg-blue-600 px-4 py-2 rounded text-white">Search</button>
    </form>
  );
}
