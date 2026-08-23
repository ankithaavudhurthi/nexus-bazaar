import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Request-level memoized session getter.
 * Uses React's `cache()` so multiple calls to `auth()` within a single request cycle
 * execute `auth()` only once.
 */
export const getMemoizedSession = cache(async () => {
  return auth();
});

/**
 * Request-level memoized vendor profile getter.
 * Deduplicates vendor profile queries per request cycle.
 */
export const getMemoizedVendorProfile = cache(async (userId: string) => {
  if (!userId) return null;
  return prisma.vendorProfile.findUnique({
    where: { userId },
  });
});
