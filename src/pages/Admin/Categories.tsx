import { useState, useEffect } from "react";
import { categoriesAPI, Category } from "../../api/Admin/categories";
import Pagination from "../../components/Admin/Pagination";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalItems, setTotalItems] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadCategories();
  }, [page, limit]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const result = await categoriesAPI.getAll({ offset, limit });
      setCategories(result.items);
      setTotalItems(result.total);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await categoriesAPI.update(editingId, formData);
        setEditingId(null);
      } else {
        await categoriesAPI.create(formData);
      }
      setShowForm(false);
      setFormData({ name: "", description: "" });
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save category");
    }
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name, description: category.description });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await categoriesAPI.delete(id);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete category");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1>Categories</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", description: "" });
          }}
        >
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>{editingId ? "Edit" : "Create"} Category</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <button type="submit" className="btn btn-primary">
              {editingId ? "Update" : "Create"}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((category) => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || "N/A"}</td>
                <td>{new Date(category.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn btn-primary"
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(category.id)}
                    style={{ marginLeft: "5px" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          limit={limit}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>
    </div>
  );
};

export default Categories;
