import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ReturnWizard } from "./ReturnWizard";

/** Sign-in is checked before the wizard renders, so nobody fills in a return they can't submit. */
export default async function NewReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string; name?: string }>;
}) {
  const sp = await searchParams;
  const session = await auth();
  if (!session) {
    const back = `/returns/new?${new URLSearchParams({ item: sp.item ?? "", name: sp.name ?? "" })}`;
    redirect(`/api/auth/signin?callbackUrl=${encodeURIComponent(back)}`);
  }
  return (
    <ReturnWizard itemId={sp.item ?? ""} itemName={sp.name ?? "this item"} />
  );
}
