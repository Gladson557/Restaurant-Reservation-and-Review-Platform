// src/components/admin/AdminRestaurants.jsx
import { useEffect, useState } from "react";
import API from "../utils/api";

export default function AdminRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", cuisineType: "", location: "", priceRange: "", tablesPerSlot: 10 });

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/restaurants");
      setRestaurants(res.data);
    } catch (err) {
      console.error("fetch restaurants", err);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const startEdit = (r) => {
    setEditing(r._id);
    setForm({
      name: r.name || "",
      cuisineType: r.cuisineType || "",
      location: r.location || "",
      priceRange: r.priceRange || "",
      tablesPerSlot: r.tablesPerSlot ?? r.capacity ?? 10,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: "", cuisineType: "", location: "", priceRange: "", tablesPerSlot: 10 });
  };

  const saveEdit = async (id) => {
    try {
      const payload = {
        name: form.name,
        cuisineType: form.cuisineType,
        location: form.location,
        priceRange: form.priceRange,
        tablesPerSlot: Number(form.tablesPerSlot),
      };
      await API.put(`/admin/restaurants/${id}`, payload);
      await fetch();
      cancelEdit();
      alert("Restaurant updated");
    } catch (err) {
      console.error("saveEdit", err);
      alert("Failed to update");
    }
  };

  const deleteRestaurant = async (id) => {
    if (!confirm("Delete this restaurant? This action cannot be undone.")) return;
    try {
      await API.delete(`/admin/restaurants/${id}`);
      setRestaurants((p) => p.filter((r) => r._id !== id));
      alert("Deleted");
    } catch (err) {
      console.error("deleteRestaurant", err);
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="text-gray-600">Loading restaurants...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Restaurants</h2>
      {restaurants.length === 0 ? (
        <p className="text-gray-600">No restaurants found.</p>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r) => (
            <div key={r._id} className="flex justify-between items-start gap-4 border rounded p-3">
              <div>
                <h3 className="font-semibold">{r.name}</h3>
                <p className="text-sm text-gray-600">{r.cuisineType} • {r.location}</p>
                <p className="text-sm text-gray-500">Price: {r.priceRange} • Tables/slot: {r.tablesPerSlot ?? r.capacity ?? "-"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(r)} className="px-3 py-1 bg-indigo-600 text-white rounded">Edit</button>
                <button onClick={() => deleteRestaurant(r._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow w-full max-w-lg">
            <h3 className="text-xl font-semibold mb-3">Edit Restaurant</h3>

            <label className="block text-sm">Name</label>
            <input className="w-full border p-2 mb-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <label className="block text-sm">Cuisine</label>
            <input className="w-full border p-2 mb-2" value={form.cuisineType} onChange={(e) => setForm({ ...form, cuisineType: e.target.value })} />

            <label className="block text-sm">Location</label>
            <input className="w-full border p-2 mb-2" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />

            <label className="block text-sm">Price range</label>
            <input className="w-full border p-2 mb-2" value={form.priceRange} onChange={(e) => setForm({ ...form, priceRange: e.target.value })} />

            <label className="block text-sm">Tables per slot (capacity)</label>
            <input type="number" min="1" className="w-full border p-2 mb-4" value={form.tablesPerSlot} onChange={(e) => setForm({ ...form, tablesPerSlot: e.target.value })} />

            <div className="flex justify-end gap-2">
              <button onClick={cancelEdit} className="px-3 py-1 rounded border">Cancel</button>
              <button onClick={() => saveEdit(editing)} className="px-3 py-1 rounded bg-green-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
