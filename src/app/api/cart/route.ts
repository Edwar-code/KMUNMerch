import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { isAuthenticated } from "@/lib/auth-utils";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to access this cart" },
        { status: 403 }
      );
    }

    // Fetch the cart from the database
    const cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return NextResponse.json({ items: [] }); // Return an empty cart if not found
    }

    return NextResponse.json({ items: cart.items });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, productId, quantity, variation } = await request.json();

    if (!userId || !productId || !quantity) {
      return NextResponse.json(
        { error: "User ID, Product ID, and Quantity are required" },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to modify this cart" },
        { status: 403 }
      );
    }

    // First, verify the product exists
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch the cart from the database
    let cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      // Create a new cart if it doesn't exist
      cart = await prisma.cart.create({
        data: {
          userId: userId,
        },
        include: {
          items: true,
        },
      });
    }

    // Check if the item already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.variation === variation
    );

    if (existingItem) {
      // Update the quantity of the existing item
      await prisma.item.update({
        where: {
          id: existingItem.id,
        },
        data: {
          quantity: quantity,
        },
      });
    } else {
      // Add a new item to the cart
      await prisma.item.create({
        data: {
          cartId: cart.id,
          productId: productId,
          quantity: quantity,
          variation: variation,
        },
      });
    }

    // Re-fetch the cart with updated items
    const updatedCart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ items: updatedCart!.items }, { status: 200 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const productId = searchParams.get("productId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to modify this cart" },
        { status: 403 }
      );
    }

    // Find the cart
    const cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 });
    }

    // If productId is NOT provided, clear the entire cart.
    if (!productId) {
      await prisma.item.deleteMany({
        where: {
          cartId: cart.id,
        },
      });

      return NextResponse.json({ items: [] });
    }
    // Find the item in the cart
    const itemToDelete = cart.items.find(
      (item) => item.productId === productId
    );

    if (!itemToDelete) {
      return NextResponse.json(
        { error: "Item not found in cart" },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.item.delete({
      where: {
        id: itemToDelete.id,
      },
    });

    // Refetch the cart
    const updatedCart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({ items: updatedCart!.items });
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized to clear this cart" },
        { status: 403 }
      );
    }

    const cart = await prisma.cart.findUnique({
      where: {
        userId: userId,
      },
      include: {
        items: true,
      },
    });

    if (!cart) {
      return NextResponse.json({ message: "Cart is already empty" });
    }

    // Delete all items in the cart
    await prisma.item.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return NextResponse.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 }
    );
  }
}
