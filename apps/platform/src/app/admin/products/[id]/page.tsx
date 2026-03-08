import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

import { getDb, products } from "@ultra/db";

import { updateProduct, deleteProduct } from "../actions";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = getDb();
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const product = rows[0];
  if (!product) notFound();

  const updateWithId = updateProduct.bind(null, id);

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <a href="/admin/products" className="back-link">← Products</a>
          <h1>Edit product</h1>
        </div>
        <form action={deleteProduct.bind(null, id)}>
          <button type="submit" className="btn-danger">Delete product</button>
        </form>
      </div>

      <div className="panel">
        <form action={updateWithId} className="form">
          <div className="form-row">
            <div className="field">
              <label htmlFor="title">Title *</label>
              <input id="title" name="title" type="text" required defaultValue={product.title} />
            </div>
            <div className="field">
              <label htmlFor="slug">Slug *</label>
              <input id="slug" name="slug" type="text" required defaultValue={product.slug} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={product.description} />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="price">Price</label>
              <input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product.price} />
            </div>
            <div className="field">
              <label htmlFor="inventory">Inventory</label>
              <input id="inventory" name="inventory" type="number" min="0" defaultValue={product.inventory} />
            </div>
            <div className="field">
              <label htmlFor="currency">Currency</label>
              <select id="currency" name="currency" defaultValue={product.currency}>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={product.status}>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="form-actions">
            <a href="/admin/products" className="btn-secondary">Cancel</a>
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
