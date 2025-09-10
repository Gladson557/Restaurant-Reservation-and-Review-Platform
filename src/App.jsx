// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RestaurantDetails from "./pages/RestaurantDetails";
import Reservations from "./pages/Reservations";
import AddRestaurant from "./pages/AddRestaurant";
import OwnerRestaurants from "./pages/OwnerRestaurants";
import MyReviews from "./pages/MyReviews";
import OwnerReviews from "./pages/OwnerReviews";
import OwnerReservations from "./pages/OwnerReservations";
import AdminDashboard from "./pages/AdminDashboard";
import AdminRestaurants from "./pages/AdminRestaurants";
import AdminReservations from "./pages/AdminReservations";
import AdminReviews from "./pages/AdminReviews";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="p-6">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Restaurant pages */}
          <Route path="/restaurants/:id" element={<RestaurantDetails />} />
          <Route path="/restaurants" element={<OwnerRestaurants />} />

          {/* Reservations / reviews */}
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/reviews" element={<MyReviews />} />
          <Route path="/owner/reviews/:id" element={<OwnerReviews />} />
          <Route path="/owner/reservations" element={<OwnerReservations />} />
          <Route path="/add-restaurant" element={<AddRestaurant />} />

          {/* Admin area: index + explicit admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/restaurants" element={<AdminRestaurants />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />

          {/* Catch-all */}
          <Route path="*" element={<div className="p-6">Page not found</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
