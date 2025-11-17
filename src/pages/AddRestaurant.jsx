// src/pages/AddRestaurant.jsx
import { useState } from "react";
import api from "../utils/api";

export default function AddRestaurant() {
  const [name, setName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [location, setLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [contact, setContact] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState(""); // CSV input for features
  const [tablesPerSlot, setTablesPerSlot] = useState("");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  // menu items local state (temporary before submit)
  const [menuItems, setMenuItems] = useState([]);
  const [menuEdit, setMenuEdit] = useState({ name: "", price: "", description: "", category: "", id: null });

  const resetForm = () => {
    setName("");
    setCuisineType("");
    setLocation("");
    setPriceRange("");
    setContact("");
    setPrice("");
    setFeatures("");
    setTablesPerSlot("");
    setPhotos([]);
    setMenuItems([]);
  };

  const onAddOrUpdateMenuItem = (e) => {
    e.preventDefault();
    const trimmedName = (menuEdit.name || "").trim();
    if (!trimmedName) {
      alert("Menu item name is required");
      return;
    }
    const item = {
      name: trimmedName,
      price: menuEdit.price === "" ? 0 : Number(menuEdit.price),
      description: menuEdit.description || "",
      category: menuEdit.category || "",
    };

    if (menuEdit.id === null) {
      // new
      setMenuItems((prev) => [...prev, item]);
    } else {
      // update existing by index
      setMenuItems((prev) => prev.map((it, idx) => (idx === menuEdit.id ? item : it)));
    }
    setMenuEdit({ name: "", price: "", description: "", category: "", id: null });
  };

  const onEditMenuItem = (idx) => {
    const it = menuItems[idx];
    setMenuEdit({ name: it.name, price: it.price, description: it.description || "", category: it.category || "", id: idx });
  };

  const onRemoveMenuItem = (idx) => {
    if (!window.confirm("Remove menu item?")) return;
    setMenuItems((prev) => prev.filter((_, i) => i !== idx));
    setMenuEdit({ name: "", price: "", description: "", category: "", id: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build payload. If photos present -> multipart, else JSON.
      let response;
      if (photos.length > 0) {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("cuisineType", cuisineType);
        fd.append("location", location);
        fd.append("priceRange", priceRange);
        if (price !== "") fd.append("price", price);
        fd.append("contact", contact);
        if (features) fd.append("features", features);
        if (tablesPerSlot !== "") fd.append("tablesPerSlot", String(tablesPerSlot));

        // menuItems as JSON string
        if (menuItems.length) fd.append("menuItems", JSON.stringify(menuItems));

        photos.forEach((f) => fd.append("photos", f));
        response = await api.post("/restaurants", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const body = {
          name,
          cuisineType,
          location,
          priceRange,
          contact,
        };
        if (price !== "") body.price = Number(price);
        if (features) body.features = features;
        if (tablesPerSlot !== "") body.tablesPerSlot = Number(tablesPerSlot);
        if (menuItems.length) body.menuItems = menuItems;

        response = await api.post("/restaurants", body);
      }

      alert("Restaurant added ✅");
      resetForm();
      console.log("created restaurant", response.data);
    } catch (err) {
      console.error("Add restaurant failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.statusText ||
        err.message ||
        "Unknown error";
      alert(`Failed to add restaurant ❌\n${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md w-full max-w-2xl space-y-4">
        <h2 className="text-xl font-bold mb-1">Add Restaurant</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input required placeholder="Name" className="border p-2" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Cuisine Type" className="border p-2" value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} />
          <input placeholder="Location" className="border p-2" value={location} onChange={(e) => setLocation(e.target.value)} />
          <input placeholder="Price Range (e.g. $$)" className="border p-2" value={priceRange} onChange={(e) => setPriceRange(e.target.value)} />
          <input placeholder="Average price (number)" type="number" className="border p-2" value={price} onChange={(e) => setPrice(e.target.value)} />
          <input placeholder="Contact" className="border p-2" value={contact} onChange={(e) => setContact(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input placeholder="Features (CSV: outdoor,vegan)" className="border p-2" value={features} onChange={(e) => setFeatures(e.target.value)} />
          <input placeholder="Tables per slot" type="number" className="border p-2" value={tablesPerSlot} onChange={(e) => setTablesPerSlot(e.target.value)} />
        </div>

        <div>
          <label className="block mb-2 font-medium">Photos (optional)</label>
          <input type="file" multiple accept="image/*" onChange={(e) => setPhotos(Array.from(e.target.files))} />
        </div>

        {/* Menu Editor */}
        <div className="border rounded p-3">
          <h3 className="font-semibold mb-2">Menu items</h3>

          <form onSubmit={onAddOrUpdateMenuItem} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
            <div>
              <label className="text-sm block">Name</label>
              <input className="border p-2 w-full" value={menuEdit.name} onChange={(e) => setMenuEdit((s) => ({ ...s, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm block">Price</label>
              <input type="number" className="border p-2 w-full" value={menuEdit.price} onChange={(e) => setMenuEdit((s) => ({ ...s, price: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm block">Category</label>
              <input className="border p-2 w-full" value={menuEdit.category} onChange={(e) => setMenuEdit((s) => ({ ...s, category: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm block">Action</label>
              <div className="flex gap-2">
                <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">{menuEdit.id === null ? "Add" : "Update"}</button>
                <button type="button" onClick={() => setMenuEdit({ name: "", price: "", description: "", category: "", id: null })} className="px-3 py-1 border rounded">Clear</button>
              </div>
            </div>

            <div className="md:col-span-4">
              <label className="text-sm block">Description (optional)</label>
              <input className="border p-2 w-full" value={menuEdit.description} onChange={(e) => setMenuEdit((s) => ({ ...s, description: e.target.value }))} />
            </div>
          </form>

          {/* preview */}
          <div className="mt-3 space-y-2">
            {menuItems.length === 0 ? <div className="text-gray-500">No menu items added.</div> :
              menuItems.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center border rounded p-2">
                  <div>
                    <div className="font-medium">{it.name} <span className="text-sm text-gray-600"> - ${it.price}</span></div>
                    {it.category && <div className="text-sm text-gray-500">{it.category}</div>}
                    {it.description && <div className="text-sm text-gray-700 mt-1">{it.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => onEditMenuItem(idx)} className="px-2 py-1 bg-yellow-500 rounded text-white">Edit</button>
                    <button type="button" onClick={() => onRemoveMenuItem(idx)} className="px-2 py-1 bg-red-600 rounded text-white">Remove</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
            {loading ? "Saving…" : "Add Restaurant"}
          </button>
          <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Clear</button>
        </div>
      </form>
    </div>
  );
}
