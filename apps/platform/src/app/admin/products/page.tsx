import { getCatalogProducts } from "@ultra/modules";

function fmt(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

function statusClass(status: string) {
  if (status === "active") return "badge badge--success";
  if (status === "draft") return "badge badge--warning";
  return "badge badge--neutral";
}

export default function ProductsPage() {
  const products = getCatalogProducts();

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Products</h1>
          <p className="admin-muted">{products.length} products in catalog</p>
        </div>
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Currency</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <p className="table-strong">{product.title}</p>
                  <p className="table-mono table-sub admin-muted">{product.slug}</p>
                </td>
                <td><span className={statusClass(product.status)}>{product.status}</span></td>
                <td>{fmt(product.priceCents)}</td>
                <td className={product.inventory < 5 ? "table-warn" : ""}>{product.inventory}</td>
                <td className="admin-muted">{product.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
