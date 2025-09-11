import { useState } from "react";
import api from "../utils/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user"); // default "user"

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role, // 👈 send role to backend
      });
      alert(`Registration successful as ${role} ✅`);
    } catch (err) {
      alert("Registration failed ❌");
    }
  };

  return (
    <div className="flex justify-center items-center h-[80vh]">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow-md w-96"
      >
        <h2 className="text-xl font-bold mb-4">Register</h2>
        <input
          type="text"
          placeholder="Name"
          className="w-full border p-2 mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Role Selector */}
        <label className="block mb-1 font-semibold">Select Role</label>
        <select
          className="w-full border p-2 mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>

        <button className="bg-green-600 text-white w-full p-2 rounded hover:bg-green-700">
          Register
        </button>
      </form>
    </div>
  );
}

