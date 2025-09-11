import { Link } from "react-router-dom";

export default function RestaurantCard({ restaurant }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition">
      <h2 className="text-xl font-bold">{restaurant.name}</h2>
      <p className="text-gray-600">{restaurant.cuisineType}</p>
      <p className="text-gray-500">{restaurant.location}</p>
      <p className="text-gray-700">Price Range: {restaurant.priceRange}</p>

      <Link
        to={`/restaurants/${restaurant._id}`}
        className="text-blue-600 font-medium hover:underline mt-2 inline-block"
      >
        View Details →
      </Link>
    </div>
  );
}

