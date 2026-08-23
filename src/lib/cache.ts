import { prisma } from "./prisma";
import type { Category } from "@prisma/client";

// Simple in-memory cache with TTL
const cache = new Map<string, { data: Category[]; expires: number }>();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedCategories(): Promise<Category[]> {
  const cacheKey = "categories";
  const cached = cache.get(cacheKey);

  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { name: "asc" },
  });

  cache.set(cacheKey, {
    data: categories,
    expires: Date.now() + CACHE_TTL,
  });

  return categories;
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}
