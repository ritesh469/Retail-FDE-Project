"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({
  signedIn,
  staff,
}: {
  signedIn: boolean;
  staff: boolean;
}) {
  const path = usePathname();
  const current = (href: string) =>
    (
      href === "/"
        ? path === "/" || path.startsWith("/shop/product")
        : path.startsWith(href)
    )
      ? "page"
      : undefined;

  return (
    <nav className="nav-links" aria-label="Main">
      <Link href="/" aria-current={current("/")}>
        Shop
      </Link>
      {signedIn && (
        <>
          <Link href="/orders" aria-current={current("/orders")}>
            My orders
          </Link>
          <Link href="/returns" aria-current={current("/returns")}>
            My returns
          </Link>
        </>
      )}
      {staff && (
        <Link href="/dashboard" aria-current={current("/dashboard")}>
          Dashboard
        </Link>
      )}
    </nav>
  );
}
