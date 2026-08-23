import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

const PAGE_SIZE = 24;

export type CatalogSearchParams = {
  category?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  q?: string;
};

const sortMap: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  price_asc: { basePrice: "asc" },
  price_desc: { basePrice: "desc" },
  rating: { avgRating: "desc" },
};

async function executeCatalogQuery(params: CatalogSearchParams, categoryId?: string) {
  const page = Math.max(1, Number(params.page) || 1);
  const sort = sortMap[params.sort ?? ""] ?? sortMap.newest;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
    ...(categoryId ? { categoryId } : {}),
    ...(params.minPrice || params.maxPrice
      ? {
          basePrice: {
            ...(params.minPrice ? { gte: Number(params.minPrice) } : {}),
            ...(params.maxPrice ? { lte: Number(params.maxPrice) } : {}),
          },
        }
      : {}),
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { description: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        vendor: { select: { shopName: true, shopSlug: true } },
      },
      orderBy: sort,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function queryCatalog(params: CatalogSearchParams, categoryId?: string) {
  const cacheKey = [
    "catalog",
    categoryId ?? "all",
    params.category ?? "",
    params.sort ?? "newest",
    params.page ?? "1",
    params.minPrice ?? "",
    params.maxPrice ?? "",
    params.q ?? "",
  ].join("-");

  return unstable_cache(
    () => executeCatalogQuery(params, categoryId),
    [cacheKey],
    { tags: ["catalog-products"], revalidate: 300 }
  )();
}

