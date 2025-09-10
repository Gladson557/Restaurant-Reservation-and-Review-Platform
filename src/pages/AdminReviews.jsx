// src/components/admin/AdminReviews.jsx
import { useEffect, useState } from "react";
import API from "../utils/api";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/reviews");
      setReviews(res.data);
    } catch (err) {
      console.error("fetch reviews", err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const deleteReview = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await API.delete(`/admin/reviews/${id}`);
      setReviews((p) => p.filter((r) => r._id !== id));
      alert("Deleted");
    } catch (err) {
      console.error("deleteReview", err);
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="text-gray-600">Loading reviews...</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Reviews</h2>
      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews found.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="flex justify-between items-start gap-4 border rounded p-3">
              <div>
                <p className="text-sm text-gray-600">User: {r.user?.name || r.user?.email}</p>
                <p className="font-medium">{r.restaurant?.name}</p>
                <p className="text-yellow-600">⭐ {r.rating}</p>
                <p>{r.comment}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => deleteReview(r._id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
