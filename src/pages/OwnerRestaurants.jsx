import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function OwnerRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    cuisineType: "",
    location: "",
    priceRange: "",
    contact: "",
  });

  // Fetch owner's restaurants
  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/restaurants/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(res.data);
    } catch (err) {
      console.error("Failed to fetch owner restaurants", err);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Delete restaurant
  const deleteRestaurant = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(restaurants.filter((r) => r._id !== id));
    } catch (err) {
      alert("Failed to delete restaurant ❌");
    }
  };

  // Start editing a restaurant
  const startEdit = (restaurant) => {
    setEditingId(restaurant._id);
    setFormData({
      name: restaurant.name,
      cuisineType: restaurant.cuisineType,
      location: restaurant.location,
      priceRange: restaurant.priceRange,
      contact: restaurant.contact,
    });
  };

  // Save updated restaurant
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/restaurants/${editingId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Restaurant updated ✅");
      setEditingId(null);
      fetchRestaurants(); // refresh
    } catch (err) {
      alert("Failed to update restaurant ❌");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Restaurants</h1>

      {restaurants.length === 0 ? (
        <p className="text-gray-600">No restaurants yet.</p>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((r) =>
            editingId === r._id ? (
              // ✏️ Editing Form
              <form
                key={r._id}
                onSubmit={handleUpdate}
                className="border p-4 rounded bg-white shadow grid gap-2"
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  type="text"
                  value={formData.cuisineType}
                  onChange={(e) =>
                    setFormData({ ...formData, cuisineType: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  type="text"
                  value={formData.priceRange}
                  onChange={(e) =>
                    setFormData({ ...formData, priceRange: e.target.value })
                  }
                  className="border p-2"
                />
                <input
                  type="text"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                  className="border p-2"
                />

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // 📋 Normal Restaurant Card
              <div
                key={r._id}
                className="border p-4 rounded-lg bg-white shadow flex justify-between items-center"
              >
                <div>
                  <h2 className="text-lg font-semibold">{r.name}</h2>
                  <p>
                    {r.cuisineType} | {r.location}
                  </p>
                  <p>Price: {r.priceRange}</p>
                  <p>Contact: {r.contact}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(r)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRestaurant(r._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  <Link
                    to={`/owner/reviews/${r._id}`}
                    className="bg-indigo-600 text-white px-3 py-1 rounded"
                  >
                    Manage Reviews
                  </Link>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
