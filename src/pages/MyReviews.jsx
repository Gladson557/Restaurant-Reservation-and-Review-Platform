import { useEffect, useState } from "react";
import api from "../utils/api";

export default function MyReviews() {
  const [reviews, setReviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [photos, setPhotos] = useState("");

  // ✅ Fetch my reviews
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/reviews/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("My reviews API response:", res.data);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // ✅ Delete review
  const deleteReview = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error("Failed to delete review", err.response?.data || err.message);
      alert("Failed to delete review ❌");
    }
  };

  // ✅ Start editing
  const startEdit = (review) => {
    setEditingId(review._id);
    setComment(review.comment);
    setRating(review.rating);
    setPhotos(review.photos?.join(",") || "");
  };

  // ✅ Save updated review
  const saveEdit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `/reviews/${id}`,
        {
          comment,
          rating: Number(rating),
          photos: photos
            .split(",")
            .map((p) => p.trim())
            .filter((p) => p),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      console.error("Failed to update review", err.response?.data || err.message);
      alert("Failed to update review ❌");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-600">You haven’t written any reviews yet.</p>
      ) : (
        <div className="grid gap-4">
          {reviews.map((r) =>
            editingId === r._id ? (
              // --- EDIT MODE ---
              <div key={r._id} className="border p-4 rounded bg-white shadow">
                <h2 className="font-semibold">{r.restaurant?.name}</h2>
                <textarea
                  className="w-full border p-2 mb-2"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="border p-2 mb-2"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} Star{n > 1 && "s"}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Photo URLs (comma separated)"
                  className="w-full border p-2 mb-2"
                  value={photos}
                  onChange={(e) => setPhotos(e.target.value)}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(r._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // --- VIEW MODE ---
              <div
                key={r._id}
                className="border p-4 rounded-lg bg-white shadow flex flex-col"
              >
                <div className="flex justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {r.restaurant?.name}
                    </h2>
                    <p className="text-yellow-600">⭐ {r.rating}</p>
                    <p>{r.comment}</p>
                    {r.photos?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {r.photos.map((p, i) => (
                          <img
                            key={i}
                            src={p}
                            alt="Review"
                            className="w-16 h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEdit(r)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteReview(r._id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* ✅ Owner response */}
                {r.ownerResponse && (
                  <div className="mt-4 p-3 bg-gray-100 rounded border-l-4 border-blue-500">
                    <p className="text-sm text-gray-600 font-semibold">
                      Owner Response:
                    </p>
                    <p>{r.ownerResponse}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

