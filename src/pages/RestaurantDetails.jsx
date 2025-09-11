import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import OwnerResponseForm from "../components/OwnerResponseForm";
import { useReservationsSocket } from "../hooks/useReservationsSocket";

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

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Fetch restaurant + reviews
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/restaurants/${id}`);
        setRestaurant(res.data);

        const revRes = await api.get(`/reviews/${id}`);
        setReviews(revRes.data);
      } catch (err) {
        console.error("Failed to load restaurant details", err);
      }
    };
    fetchData();
  }, [id]);

  // Fetch availability helper
  const fetchAvailability = async (forDate, forTime) => {
    if (!forDate || !forTime) return;
    try {
      const res = await api.get(`/restaurants/${id}/availability`, {
        params: { date: forDate, time: forTime },
      });
      setAvailability(res.data);
    } catch (err) {
      console.error("Failed to fetch availability", err.response?.data || err.message);
      setAvailability(null);
    }
  };

  // Update availability when user changes date/time
  useEffect(() => {
    if (date && time) fetchAvailability(date, time);
    else setAvailability(null);
  }, [date, time]);

  // Hook into socket events for this restaurant
  useReservationsSocket({
    restaurantId: id,
    onCreated: () => date && time && fetchAvailability(date, time),
    onUpdated: () => date && time && fetchAvailability(date, time),
    onCancelled: () => date && time && fetchAvailability(date, time),
    onStatusChanged: () => date && time && fetchAvailability(date, time),
  });

  /// Submit reservation
  const submitReservation = async (e) => {
    e.preventDefault();
    try {
      if (!date || !time) {
        alert("Please select date and time");
        return;
      }

      const availRes = await api.get(`/restaurants/${id}/availability`, {
        params: { date, time },
      });
      const avail = availRes.data?.available ?? null;
      setAvailability(availRes.data);

      if (avail === 0) {
        alert("No availability for the selected slot. Please choose another time.");
        return;
      }

      await api.post(
        "/reservations",
        { restaurant: id, date, time, partySize },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Reservation booked ✅");
      setDate("");
      setTime("");
      setPartySize(1);
    } catch (err) {
      if (err.response) {
        console.error("Reservation error:", err.response.data);
        alert(`Failed to book reservation ❌: ${err.response.data.message}`);
      } else {
        console.error("Reservation error:", err.message);
        alert("Failed to book reservation ❌ (network error)");
      }
    }
  };

  // Submit review (unchanged)
  const submitReview = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("restaurant", id);
      formData.append("rating", rating);
      formData.append("comment", comment);
      photos.forEach((p) => formData.append("photos", p));

      await api.post("/reviews", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setComment("");
      setRating(5);
      setPhotos([]);

      const revRes = await api.get(`/reviews/${id}`);
      setReviews(revRes.data);
    } catch (err) {
      console.error("Review error:", err.response?.data || err.message);
      alert("Failed to submit review ❌");
    }
  };

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

      {/* Reviews Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-3">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="border p-3 rounded bg-white shadow-sm">
                <p className="font-medium">{rev.user?.name}</p>
                <p className="text-yellow-600">⭐ {rev.rating}</p>
                <p>{rev.comment}</p>
                {rev.photos?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {rev.photos.map((p, i) => (
                      <img key={i} src={`http://localhost:5000${p}`} alt="review" className="w-24 h-24 object-cover rounded" />
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
                {user?.role === "owner" && restaurant.owner === user._id && !rev.response && (
                  <OwnerResponseForm reviewId={rev._id} />
                )}
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
          <select value={rating} onChange={(e) => setRating(e.target.value)} className="border p-2 mb-2">
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} Star{n > 1 && "s"}</option>)}
          </select>
          <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files))} className="mb-2" />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Submit Review</button>
        </form>
      )}
    </div>
  );
}

