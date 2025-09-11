import { useEffect, useState } from "react";
import api from "../utils/api";

export default function Reservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/reservations/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(res.data);
      } catch (err) {
        console.error("Failed to fetch reservations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const cancelReservation = async (id) => {
  try {
    const token = localStorage.getItem("token");
    await api.put(
      `/reservations/${id}/cancel`,
      {}, // body can be empty
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setReservations(reservations.filter((r) => r._id !== id));
    alert("Reservation cancelled ✅");
  } catch (err) {
    console.error(err.response?.data || err.message);
    alert("Failed to cancel reservation ❌");
  }
};


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <p className="text-gray-500">Loading reservations...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Reservations</h1>

      {reservations.length === 0 ? (
        <p className="text-gray-600">You have no reservations yet.</p>
      ) : (
        <div className="grid gap-4">
          {reservations.map((r) => (
            <div
              key={r._id}
              className="border rounded-lg p-4 shadow bg-white hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">
                {r.restaurant?.name || "Unknown Restaurant"}
              </h2>
              <p className="text-gray-600">📍 {r.restaurant?.location}</p>
              <p>
                <span className="font-medium">Date:</span> {r.date}
              </p>
              <p>
                <span className="font-medium">Time:</span> {r.time}
              </p>
              <p>
                <span className="font-medium">Party Size:</span> {r.partySize}
              </p>
              <p>
                <span className="font-medium">Status:</span>{" "}
                <span className="capitalize">{r.status}</span>
              </p>

              <button
                onClick={() => cancelReservation(r._id)}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

