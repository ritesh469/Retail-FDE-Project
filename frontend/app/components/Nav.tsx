import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import { CartBadge } from "./CartBadge";
import { NavLinks } from "./NavLinks";

export async function Nav() {
  const session = await auth();
  const roles = (session?.user as unknown as { roles?: string[] })?.roles ?? [];
  const staff = roles.includes("reviewer") || roles.includes("admin");

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link href="/" className="brand display" aria-label="ReturnGuard home">
          <span className="brand-tag" aria-hidden="true" />
          ReturnGuard
        </Link>
        <NavLinks signedIn={!!session} staff={staff} />
        <div className="nav-right">
          <CartBadge />
          {session ? (
            <>
              <span className="nav-user" title={session.user?.email ?? ""}>
                {session.user?.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button className="btn ghost">Sign out</button>
              </form>
            </>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("keycloak", { redirectTo: "/" });
              }}
            >
              <button className="btn">Sign in</button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
