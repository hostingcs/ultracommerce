import { createProduct } from "../actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <a href="/admin/products" className="back-link">← Products</a>
          <h1>New product</h1>
        </div>
      </div>

      {params.error && <div className="form-error">Title and slug are required.</div>}

      <div className="panel">
        <form action={createProduct} className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="title">Title *</label>
              <input id="title" name="title" type="text" required placeholder="e.g. Classic T-Shirt" />
            </div>
            <div className="field">
              <label htmlFor="slug">Slug *</label>
              <input id="slug" name="slug" type="text" required placeholder="e.g. classic-t-shirt" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} placeholder="Product description..." />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" step="0.01" min="0" defaultValue="0" />
            </div>
            <div className="field">
              <label htmlFor="inventory">Inventory</label>
              <input id="inventory" name="inventory" type="number" min="0" defaultValue="0" />
            </div>
            <div className="field">
              <label htmlFor="currency">Currency</label>
              <select id="currency" name="currency" defaultValue="USD">
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue="draft">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="form-actions">
            <a href="/admin/products" className="btn-secondary">Cancel</a>
            <button type="submit" className="btn-primary">Create product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
