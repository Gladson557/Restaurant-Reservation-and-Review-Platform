// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const readAuthFromStorage = () => {
    const uRaw = localStorage.getItem("user");
    let u = null;
    try {
      u = uRaw ? JSON.parse(uRaw) : null;
    } catch (e) {
      u = null;
    }
    const r = (u && u.role) || localStorage.getItem("role");
    setUser(u);
    setRole(r);
    // optional debug:
    // console.log("Navbar readAuthFromStorage", { user: u, role: r, token: localStorage.getItem("token") });
  };

  useEffect(() => {
    // initial read
    readAuthFromStorage();

    // listen for global auth change event (dispatched by Login)
    const onAuthChanged = () => {
      readAuthFromStorage();
    };
    window.addEventListener("authChanged", onAuthChanged);

    return () => {
      window.removeEventListener("authChanged", onAuthChanged);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setRole(null);
    setUser(null);
    // notify other tabs/components
    window.dispatchEvent(new Event("authChanged"));
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 flex justify-between items-center">
      <Link to="/" className="font-bold text-xl">🍽️ Foodie</Link>
      <div className="space-x-4 flex items-center">
        <Link to="/">Home</Link>

        {role === "user" && (
          <>
            <Link to="/reservations">My Reservations</Link>
            <Link to="/reviews">My Reviews</Link>
          </>
        )}

        {role === "owner" && (
          <>
            <Link to="/restaurants">My Restaurants</Link>
            <Link to="/add-restaurant">Add Restaurant</Link>
            <Link to="/owner/reservations">Manage Reservations</Link>
          </>
        )}

        {role === "admin" && (
          <>
            <Link to="/admin/restaurants">Manage Restaurants</Link>
            <Link to="/admin/reservations">Manage Reservations</Link>
            <Link to="/admin/reviews">Manage Reviews</Link>
          </>
        )}

        {!role ? (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="bg-red-600 px-3 py-1 rounded hover:bg-red-700">
            Logout {user?.name ? ` ${user.name}` : ""}
          </button>
        )}
      </div>
    </nav>
  );
}
