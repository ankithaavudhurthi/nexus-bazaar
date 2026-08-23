import { auth } from "@/lib/auth";
import { VendorRegisterForm } from "./vendor-register-form";

export default async function VendorRegisterPage() {
  const session = await auth();

  return <VendorRegisterForm session={session} />;
}