// src/pages/RestaurantDetails.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import OwnerResponseForm from "../components/OwnerResponseForm";
import { useReservationsSocket } from "../hooks/useReservationsSocket";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function RestaurantDetails() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [availability, setAvailability] = useState(null);

  // menu form state (owner only)
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuPrice, setNewMenuPrice] = useState("");
  const [newMenuDesc, setNewMenuDesc] = useState("");
  const [menuLoading, setMenuLoading] = useState(false);

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // helper: owner check
  const restaurantOwnerId = restaurant?.owner?._id
    ? restaurant.owner._id.toString()
    : String(restaurant?.owner || "");
  const isOwnerViewing = user && user._id && restaurantOwnerId === String(user._id);

  // load restaurant + reviews
  const fetchRestaurant = async () => {
    try {
      const res = await api.get(`/restaurants/${id}`);
      // API returns restaurant doc in res.data
      setRestaurant(res.data);
    } catch (err) {
      console.error("Failed to load restaurant", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`);
      setReviews(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  useEffect(() => {
    fetchRestaurant();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // availability
  const fetchAvailability = async (forDate, forTime) => {
    if (!forDate || !forTime) return;
    try {
      const res = await api.get(`/restaurants/${id}/availability`, {
        params: { date: forDate, time: forTime },
      });
      setAvailability(res.data);
    } catch (err) {
      console.error("Failed to fetch availability", err?.response?.data || err.message);
      setAvailability(null);
    }
  };

  useEffect(() => {
    if (date && time) fetchAvailability(date, time);
    else setAvailability(null);
  }, [date, time]);

  // socket updates (refresh availability)
  useReservationsSocket({
    restaurantId: id,
    onCreated: () => date && time && fetchAvailability(date, time),
    onUpdated: () => date && time && fetchAvailability(date, time),
    onCancelled: () => date && time && fetchAvailability(date, time),
    onStatusChanged: () => date && time && fetchAvailability(date, time),
  });

  // reservation submit (keeps your prior logic)
  const submitReservation = async (e) => {
    e.preventDefault();
    try {
      if (!date || !time) {
        alert("Please select date and time");
        return;
      }
      // check availability
      const availRes = await api.get(`/restaurants/${id}/availability`, {
        params: { date, time },
      });
      const avail = availRes.data?.available ?? null;
      setAvailability(availRes.data);

      if (avail === 0) {
        alert("No availability for the selected slot. Please choose another time.");
        return;
      }

      await api.post("/reservations", { restaurant: id, date, time, partySize });

      alert("Reservation booked ✅");
      setDate("");
      setTime("");
      setPartySize(1);

      // refresh availability
      fetchAvailability(date, time);
    } catch (err) {
      console.error("Reservation error:", err?.response?.data || err.message);
      alert(`Failed to book reservation ❌: ${err?.response?.data?.message || err.message}`);
    }
  };

  // review submit (keeps your prior logic)
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("restaurant", id);
      formData.append("rating", rating);
      formData.append("comment", comment);
      photos.forEach((p) => formData.append("photos", p));

      await api.post("/reviews", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setComment("");
      setRating(5);
      setPhotos([]);

      await fetchReviews();
      alert("Review submitted ✅");
    } catch (err) {
      console.error("Review error:", err?.response?.data || err.message);
      alert("Failed to submit review ❌");
    }
  };

  // -------------------------
  // Menu management (owner)
  // -------------------------
  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!newMenuName) {
      alert("Please provide an item name");
      return;
    }
    setMenuLoading(true);
    try {
      const body = { name: newMenuName, price: Number(newMenuPrice || 0), description: newMenuDesc || "" };
      const res = await api.post(`/restaurants/${id}/menu`, body);
      // update restaurant state locally (optimistic)
      setRestaurant((r) => {
        const copy = { ...(r || {}) };
        copy.menuItems = Array.isArray(copy.menuItems) ? [...copy.menuItems, res.data] : [res.data];
        return copy;
      });
      setNewMenuName("");
      setNewMenuPrice("");
      setNewMenuDesc("");
    } catch (err) {
      console.error("Add menu item failed", err?.response?.data || err.message);
      alert("Failed to add menu item");
    } finally {
      setMenuLoading(false);
    }
  };

  const deleteMenuItem = async (itemId) => {
    if (!window.confirm("Delete this menu item?")) return;
    try {
      await api.delete(`/restaurants/${id}/menu/${itemId}`);
      // remove locally
      setRestaurant((r) => {
        const copy = { ...(r || {}) };
        copy.menuItems = (copy.menuItems || []).filter((it) => it._id !== itemId && String(it._id) !== String(itemId));
        return copy;
      });
    } catch (err) {
      console.error("Delete menu item failed", err?.response?.data || err.message);
      alert("Failed to delete menu item");
    }
  };

  // render
  if (!restaurant) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-500">Loading restaurant...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
      <p className="text-gray-600">{restaurant.cuisineType}</p>
      <p className="text-gray-500">📍 {restaurant.location}</p>
      <p className="text-gray-700">Price Range: {restaurant.priceRange}</p>
      <p className="text-gray-700">Contact: {restaurant.contact}</p>

      {/* FEATURES */}
      {Array.isArray(restaurant.features) && restaurant.features.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {restaurant.features.map((f, i) => (
            <span key={i} className="text-sm bg-gray-100 px-2 py-1 rounded-full text-gray-800 border">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* MENU */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Menu</h2>

        {Array.isArray(restaurant.menuItems) && restaurant.menuItems.length > 0 ? (
          <div className="space-y-3">
            {restaurant.menuItems.map((item) => (
              <div key={item._id || item.name} className="border p-3 rounded bg-white flex justify-between items-center">
                <div>
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.category && <span className="text-xs text-gray-500">• {item.category}</span>}
                  </div>
                  {item.description && <p className="text-sm text-gray-600 mt-1">{item.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{typeof item.price === "number" ? `₹${item.price}` : item.price}</div>
                  {isOwnerViewing && (
                    <button onClick={() => deleteMenuItem(item._id)} className="text-red-600 px-2 py-1 rounded border">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No menu items published yet.</p>
        )}

        {/* Owner menu add form */}
        {isOwnerViewing && (
          <form onSubmit={addMenuItem} className="mt-4 bg-white p-3 rounded shadow grid gap-2">
            <h4 className="font-semibold">Add Menu Item</h4>
            <input value={newMenuName} onChange={(e) => setNewMenuName(e.target.value)} placeholder="Item name" className="border p-2" required />
            <input value={newMenuPrice} onChange={(e) => setNewMenuPrice(e.target.value)} placeholder="Price (number)" type="number" className="border p-2" />
            <input value={newMenuDesc} onChange={(e) => setNewMenuDesc(e.target.value)} placeholder="Description (optional)" className="border p-2" />
            <div className="flex gap-2">
              <button disabled={menuLoading} type="submit" className="bg-green-600 text-white px-3 py-1 rounded">
                {menuLoading ? "Adding…" : "Add Item"}
              </button>
              <button type="button" onClick={() => { setNewMenuName(""); setNewMenuPrice(""); setNewMenuDesc(""); }} className="px-3 py-1 border rounded">
                Clear
              </button>
            </div>
          </form>
        )}
      </div>

      {/* rest of your page (availability, reservation form, reviews) */}
      {/* Availability display */}
      {date && time && availability && (
        <div className="my-2 text-sm">
          <strong>Availability for {date} @ {time}:</strong>{" "}
          {availability.available > 0 ? (
            <span className="text-green-600">{availability.available} tables available</span>
          ) : (
            <span className="text-red-600">No availability</span>
          )}
        </div>
      )}

      {/* Reservation Form */}
      {user?.role === "user" && (
        <form onSubmit={submitReservation} className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Book a Reservation</h3>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2 w-full mb-2" required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="border p-2 w-full mb-2" required />
          <input type="number" value={partySize} onChange={(e) => setPartySize(Number(e.target.value))} className="border p-2 w-full mb-2" min="1" required />
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Reserve</button>
        </form>
      )}

      {/* Reviews Section (unchanged) */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border p-3 rounded bg-white shadow-sm">
                <p className="font-medium">{rev.user?.name || rev.user?.email || "Anonymous"}</p>
                <p className="text-yellow-600">⭐ {rev.rating}</p>
                <p>{rev.comment}</p>
                {rev.photos?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {rev.photos.map((p, i) => (
                      <img key={i} src={p.startsWith("http") ? p : `${API_BASE}${p}`} alt="review" className="w-24 h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
                {rev.response && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Owner Response:</span> {rev.response}
                    </p>
                  </div>
                )}
                {isOwnerViewing && !rev.response && <OwnerResponseForm reviewId={rev._id} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Review Form */}
      {user?.role === "user" && (
        <form onSubmit={submitReview} className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-2">Write a Review</h3>
          <textarea className="w-full border p-2 mb-2" placeholder="Your review..." value={comment} onChange={(e) => setComment(e.target.value)} required />
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="border p-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Star{n > 1 && "s"}</option>)}
          </select>
          <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files))} className="mb-2" />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Submit Review</button>
        </form>
      )}
    </div>
  );
}
