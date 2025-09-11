// src/pages/AdminDashboard.jsx
import { useState } from "react";
import AdminRestaurants from "./AdminRestaurants";
import AdminReservations from "./AdminReservations";
import AdminReviews from "./AdminReviews";

export default function AdminDashboard() {
  const [tab, setTab] = useState("restaurants");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("restaurants")} className={`px-4 py-2 rounded ${tab === "restaurants" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Restaurants</button>
        <button onClick={() => setTab("reservations")} className={`px-4 py-2 rounded ${tab === "reservations" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Reservations</button>
        <button onClick={() => setTab("reviews")} className={`px-4 py-2 rounded ${tab === "reviews" ? "bg-blue-600 text-white" : "bg-gray-100"}`}>Reviews</button>
      </div>

      <div className="bg-white rounded shadow p-4">
        {tab === "restaurants" && <AdminRestaurants />}
        {tab === "reservations" && <AdminReservations />}
        {tab === "reviews" && <AdminReviews />}
      </div>
    </div>
  );
}

