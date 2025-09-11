import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import OwnerResponseForm from "../components/OwnerResponseForm"; // ✅ import here

export default function OwnerReviews() {
  const { id } = useParams(); // restaurantId
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to load reviews", err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Manage Reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-gray-600">No reviews yet for this restaurant.</p>
      ) : (
        reviews.map((r) => (
          <div
            key={r._id}
            className="border p-4 rounded-lg bg-white shadow mb-4"
          >
            <p className="font-semibold">{r.user?.name || "Anonymous"}</p>
            <p className="text-yellow-600">⭐ {r.rating}</p>
            <p>{r.comment}</p>

            {r.photos.length > 0 && (
              <div className="flex gap-2 mt-2">
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

            {/* Existing Owner Response */}
            {r.ownerResponse && (
              <p className="mt-2 text-green-700">
                <strong>Owner Response:</strong> {r.ownerResponse}
              </p>
            )}

            {/* Response form */}
            <OwnerResponseForm reviewId={r._id} />
          </div>
        ))
      )}
    </div>
  );
}

