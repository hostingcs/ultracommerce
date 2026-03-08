import { desc } from "drizzle-orm";

import { getDb, products } from "@ultra/db";

import { deleteProduct } from "./actions";

function fmt(val: string | null) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(parseFloat(val ?? "0"));
}

export default async function ProductsPage() {
  const db = getDb();
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));

  return (
    <div className="page">
      <div className="page-header">
        <h1>Products</h1>
        <a href="/admin/products/new" className="btn-primary">Add product</a>
      </div>

      <div className="panel">
        {rows.length === 0 ? (
          <p className="empty">No products yet. <a href="/admin/products/new" className="link">Add your first product →</a></p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Price</th>
                <th>Inventory</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td><a href={`/admin/products/${p.id}`} className="link font-medium">{p.title}</a></td>
                  <td className="text-muted text-sm">{p.slug}</td>
                  <td>
                    <span className={`badge ${p.status === "active" ? "badge-green" : p.status === "archived" ? "badge-gray" : "badge-yellow"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{fmt(p.price)}</td>
                  <td className={p.inventory < 5 ? "text-red" : ""}>{p.inventory}</td>
                  <td className="text-muted text-sm">{p.createdAt.toLocaleDateString()}</td>
                  <td>
                    <div className="row-actions">
                      <a href={`/admin/products/${p.id}`} className="btn-ghost-sm">Edit</a>
                      <form action={deleteProduct.bind(null, p.id)}>
                        <button type="submit" className="btn-danger-sm" onClick={() => undefined}>Delete</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
