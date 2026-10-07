import Link from "next/link";
import { ProductCard } from "./components/ProductCard";
import type { Product } from "./lib/api";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.category) qs.set("category", sp.category);
  if (sp.sort) qs.set("sort", sp.sort);
  if (sp.q) qs.set("q", sp.q);

  const [products, categories] = await Promise.all([
    fetch(`${BACKEND}/products?${qs}`, { cache: "no-store" }).then((r) =>
      r.json(),
    ) as Promise<Product[]>,
    fetch(`${BACKEND}/products/categories`, { cache: "no-store" }).then((r) =>
      r.json(),
    ) as Promise<string[]>,
  ]);

  return (
    <>
      <section className="intro" aria-labelledby="intro-title">
        <div>
          <h1 id="intro-title" className="display">
            Returns, reviewed in the open.
          </h1>
          <p>
            Shop the catalog below. If something arrives broken or wrong, start
            a return from <strong>My orders</strong>. Review agents start
            checking it straight away, and nothing is refused without a person
            signing off.
          </p>
        </div>
        <ol className="route" aria-label="How a return is handled">
          <li>
            <span>1</span>
            <span>You request a return, with a photo of the item</span>
          </li>
          <li>
            <span>2</span>
            <span>
              Agents check the order, the policy, your photo and your history
            </span>
          </li>
          <li className="human">
            <span>3</span>
            <span>A person decides anything unclear - and every refusal</span>
          </li>
          <li>
            <span>4</span>
            <span>Refund to your original payment method</span>
          </li>
        </ol>
      </section>

      <div className="toolbar">
        <nav className="chips" aria-label="Categories">
          <Link
            href="/"
            className="chip"
            aria-current={!sp.category ? "page" : undefined}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c}
              href={`/?category=${encodeURIComponent(c)}`}
              className="chip"
              aria-current={sp.category === c ? "page" : undefined}
            >
              {c}
            </Link>
          ))}
        </nav>
        <form className="search" role="search">
          {sp.category && (
            <input type="hidden" name="category" value={sp.category} />
          )}
          <label htmlFor="q" className="sr-only">
            Search products
          </label>
          <input
            id="q"
            className="input"
            name="q"
            placeholder="Search products"
            defaultValue={sp.q}
          />
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            className="select"
            name="sort"
            defaultValue={sp.sort ?? "newest"}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name">Name</option>
          </select>
          <button className="btn secondary">Search</button>
        </form>
      </div>

      <p className="result-count" aria-live="polite">
        {products.length} {products.length === 1 ? "product" : "products"}
        {sp.category ? ` in ${sp.category}` : ""}
        {sp.q ? ` matching "${sp.q}"` : ""}
      </p>

      {products.length === 0 ? (
        <div className="empty">
          <h2 className="display">Nothing matches that search</h2>
          <p className="muted">
            Try a different word, or browse every category.
          </p>
          <Link href="/" className="btn secondary">
            Show all products
          </Link>
        </div>
      ) : (
        <div className="grid-products">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </>
  );
}
