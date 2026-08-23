export function formatPrice(value: number | string) {
  const num = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
}

export function discountPercent(basePrice: number | string, compareAtPrice: number | string) {
  const base = typeof basePrice === "string" ? Number(basePrice) : basePrice;
  const compare = typeof compareAtPrice === "string" ? Number(compareAtPrice) : compareAtPrice;
  if (!compare || compare <= base) return 0;
  return Math.round(((compare - base) / compare) * 100);
}
