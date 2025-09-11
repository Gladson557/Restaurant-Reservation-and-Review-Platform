import { useState } from "react";
import api from "../utils/api";

export default function AddRestaurant() {
  const [name, setName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/restaurants",
        { name, cuisineType, location, priceRange, contact },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Restaurant added ✅");
      setName("");
      setCuisineType("");
      setLocation("");
      setPriceRange("");
      setContact("");
    } catch (err) {
      alert("Failed to add restaurant ❌");
    }
  };

  return (
    <div className="flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Add Restaurant</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Cuisine Type"
          className="w-full border p-2 mb-3"
          value={cuisineType}
          onChange={(e) => setCuisineType(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          className="w-full border p-2 mb-3"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Price Range"
          className="w-full border p-2 mb-3"
          value={priceRange}
          onChange={(e) => setPriceRange(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Contact"
          className="w-full border p-2 mb-3"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />
        <button className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700">
          Add
        </button>
      </form>
    </div>
  );
}

