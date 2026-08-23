import { getMemoizedSession, getMemoizedVendorProfile } from "@/lib/memoized-auth";

/**
 * Every vendor-facing server action must call this before touching data.
 * It is the real enforcement boundary — middleware is just the UX gate.
 * Never trust vendorId from the client; always derive it from the session.
 */
export async function requireApprovedVendor() {
  const session = await getMemoizedSession();
  if (!session?.user || session.user.role !== "VENDOR") {
    throw new Error("Not authorized");
  }

  const profile = await getMemoizedVendorProfile(session.user.id);

  if (!profile || profile.status !== "APPROVED") {
    throw new Error("Vendor account is not approved");
  }

  return profile;
}

