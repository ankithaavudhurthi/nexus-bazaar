import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ count: 0 });
    }

    const result = await prisma.cartItem.aggregate({
      where: { cart: { userId: session.user.id } },
      _sum: { quantity: true },
    });

    const totalQuantity = result._sum.quantity ?? 0;

    return NextResponse.json({ count: totalQuantity });
  } catch (error) {
    console.error("Error fetching cart count:", error);
    return NextResponse.json({ count: 0 }, { status: 500 });
  }
}
