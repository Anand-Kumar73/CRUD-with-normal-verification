import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API_URL = "http://localhost:5000/api/products";

const redirectToLoginIfUnauthorized = (error) => {
  if (error.response?.status !== 401) return false;

  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.assign("/login");
  return true;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getConfig = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });

  const clearForm = () => {
    setEditingId(null);
    setTitle("");
    setPrice("");
    setDescription("");
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL, getConfig());
      setProducts(response.data);
    } catch (requestError) {
      if (redirectToLoginIfUnauthorized(requestError)) return;
      setError(
        requestError.response?.data?.message || "Failed to fetch products",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const product = { title, price: Number(price), description };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, product, getConfig());
        setSuccess("Product updated successfully");
      } else {
        await axios.post(API_URL, product, getConfig());
        setSuccess("Product created successfully");
      }
      clearForm();
      await fetchProducts();
    } catch (requestError) {
      if (redirectToLoginIfUnauthorized(requestError)) return;
      setError(requestError.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setTitle(product.title);
    setPrice(product.price);
    setDescription(product.description || "");
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      setError("");
      await axios.delete(`${API_URL}/${id}`, getConfig());
      setSuccess("Product deleted successfully");
      await fetchProducts();
    } catch (requestError) {
      if (redirectToLoginIfUnauthorized(requestError)) return;
      setError(
        requestError.response?.data?.message || "Failed to delete product",
      );
    }
  };

  return (
    <>
      <Navbar />
      <main className="container">
        <h1>Products</h1>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <form className="crud-form" onSubmit={handleSubmit}>
          <h2>{editingId ? "Update Product" : "Create Product"}</h2>
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <input
            required
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Product"
                : "Create Product"}
          </button>
          {editingId && (
            <button type="button" onClick={clearForm}>
              Cancel
            </button>
          )}
        </form>
        <div className="table-container">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.title}</td>
                    <td>{Number(product.price).toFixed(2)}</td>
                    <td>{product.description}</td>
                    <td>
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button onClick={() => handleDelete(product.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
};

export default Products;
