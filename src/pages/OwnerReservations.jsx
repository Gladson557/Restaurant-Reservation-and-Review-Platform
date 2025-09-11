// src/pages/OwnerReservations.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";



export default function OwnerReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // filters
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Edit modal state
  const [editing, setEditing] = useState(null); // reservation object being edited
  const [editForm, setEditForm] = useState({ date: "", time: "", partySize: 1 });

  // UI feedback
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/reservations/owner", axiosConfig);
      setReservations(res.data || []);
    } catch (err) {
      console.error("Failed to fetch owner reservations", err);
      setError(err?.response?.data?.message || err.message || "Error fetching");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtered list computed client-side
  const filtered = reservations.filter((r) => {
    if (restaurantFilter && r.restaurant && !r.restaurant.name.toLowerCase().includes(restaurantFilter.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (dateFilter && r.date !== dateFilter) return false;
    return true;
  });

  // CHANGE STATUS unified function (confirm / complete / cancel)
  const changeStatus = async (id, newStatus) => {
    if (!window.confirm(`Are you sure you want to mark reservation as "${newStatus}"?`)) return;
    setActionLoadingId(id);
    try {
      // Uses backend endpoint: PUT /api/reservations/:id/status  { status: "confirmed" }
      const res = await api.put(
        `/reservations/${id}/status`,
        { status: newStatus },
        axiosConfig
      );
      // update local state
      setReservations((prev) => prev.map((p) => (p._id === id ? res.data : p)));
    } catch (err) {
      console.error("Status change failed", err);
      alert(err?.response?.data?.message || "Failed to change status");
    } finally {
      setActionLoadingId(null);
    }
  };

  // CANCEL (owner cancels) — fallback if your backend uses specific cancel endpoint
  const cancelReservation = async (id) => {
    if (!window.confirm("Cancel this reservation?")) return;
    setActionLoadingId(id);
    try {
      // If backend has PUT /api/reservations/:id/cancel:
      await api.put(`/reservations/${id}/cancel`, {}, axiosConfig);
      // update locally
      setReservations((prev) => prev.map((p) => (p._id === id ? { ...p, status: "cancelled" } : p)));
    } catch (err) {
      console.error("Cancel failed", err);
      alert(err?.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoadingId(null);
    }
  };

  // OPEN EDIT modal
  const openEdit = (reservation) => {
    setEditing(reservation);
    setEditForm({ date: reservation.date || "", time: reservation.time || "", partySize: reservation.partySize || 1 });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm({ date: "", time: "", partySize: 1 });
  };

  // SUBMIT EDIT
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setActionLoadingId(editing._id);
    try {
      // Backend endpoint: PUT /api/reservations/:id body { date, time, partySize }
      const res = await api.put(`/reservations/${editing._id}`, editForm, axiosConfig);
      // Replace updated reservation in list
      setReservations((prev) => prev.map((r) => (r._id === editing._id ? res.data : r)));
      closeEdit();
    } catch (err) {
      console.error("Edit failed", err);
      alert(err?.response?.data?.message || "Failed to update reservation");
    } finally {
      setActionLoadingId(null);
    }
  };

  // small presentation: card per reservation (owner may have many)
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Reservations</h1>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          value={restaurantFilter}
          onChange={(e) => setRestaurantFilter(e.target.value)}
          placeholder="Filter by restaurant name..."
          className="border p-2 rounded"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border p-2 rounded">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {loading ? (
        <div className="text-gray-600">Loading reservations...</div>
      ) : error ? (
        <div className="text-red-600">Error: {error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-gray-600">No reservations found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => (
            <div key={r._id} className="border rounded p-4 bg-white shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{r.restaurant?.name || "—"}</h2>
                <p className="text-sm text-gray-600">
                  User: {r.user?.name || r.user?.email || "Unknown"} • Contact: {r.user?.email || "—"}
                </p>
                <p className="mt-2">
                  <span className="font-medium">Date:</span> {r.date} &nbsp; <span className="font-medium">Time:</span> {r.time}
                </p>
                <p>
                  <span className="font-medium">Party:</span> {r.partySize} • <span className="font-medium">Status:</span>{" "}
                  <span className={`px-2 py-0.5 rounded text-white ${r.status === "confirmed" ? "bg-green-600" : r.status === "pending" ? "bg-yellow-600" : r.status === "cancelled" ? "bg-red-600" : "bg-blue-600"}`}>
                    {r.status}
                  </span>
                </p>
                {r.createdAt && <p className="text-xs text-gray-400 mt-1">Booked at {new Date(r.createdAt).toLocaleString()}</p>}
              </div>

              <div className="flex gap-2 items-center">
                {/* Edit */}
                <button
                  onClick={() => openEdit(r)}
                  className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Edit
                </button>

                {/* Confirm */}
                <button
                  onClick={() => changeStatus(r._id, "confirmed")}
                  disabled={r.status === "confirmed" || actionLoadingId === r._id}
                  className="px-3 py-1 rounded bg-green-600 text-white disabled:opacity-50"
                >
                  {actionLoadingId === r._id && "…" } Confirm
                </button>

                {/* Complete */}
                <button
                  onClick={() => changeStatus(r._id, "completed")}
                  disabled={r.status === "completed" || actionLoadingId === r._id}
                  className="px-3 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  Mark Completed
                </button>

                {/* Cancel */}
                <button
                  onClick={() => cancelReservation(r._id)}
                  disabled={r.status === "cancelled" || actionLoadingId === r._id}
                  className="px-3 py-1 rounded bg-red-600 text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full">
            <h3 className="text-xl font-semibold mb-2">Edit Reservation</h3>
            <form onSubmit={submitEdit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input
                  type="time"
                  required
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Party size</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={editForm.partySize}
                  onChange={(e) => setEditForm({ ...editForm, partySize: Number(e.target.value) })}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={closeEdit} className="px-3 py-1 rounded border">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1 rounded bg-green-600 text-white" disabled={actionLoadingId === editing._id}>
                  {actionLoadingId === editing._id ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

