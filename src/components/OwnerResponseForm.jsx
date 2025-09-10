import { useState } from "react";
import axios from "axios";

export default function OwnerResponseForm({ reviewId }) {
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}/respond`,
        { response },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Response submitted ✅");
      window.location.reload(); // simple refresh for now
    } catch (err) {
      alert("Failed to respond ❌");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <textarea
        value={response}
        onChange={(e) => setResponse(e.target.value)}
        className="w-full border p-2 rounded mb-2"
        placeholder="Write a response..."
        required
      />
      <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
        Submit Response
      </button>
    </form>
  );
}
