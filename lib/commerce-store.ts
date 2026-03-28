import { prisma } from "@/lib/prisma";
import { formatPriceLabel } from "@/lib/products-store";
import { hashPassword, verifyPassword } from "@/lib/session";

export type CartItemView = {
  id: string;
  quantity: number;
  title: string;
  slug: string;
  imageUrl: string;
  priceLabel: string;
  priceValue: number;
  lineTotalLabel: string;
  lineTotalValue: number;
};

export type CartView = {
  id: string;
  itemCount: number;
  subtotalLabel: string;
  subtotalValue: number;
  items: CartItemView[];
};

export type OrderSummary = {
  id: string;
  createdAt: string;
  totalLabel: string;
  totalValue: number;
  status: string;
  itemCount: number;
  checkoutUrl?: string | null;
  paymentOrderCode?: string | null;
};

export type OrderDetail = OrderSummary & {
  items: Array<{
    id: string;
    title: string;
    productSlug: string | null;
    imageUrl: string | null;
    priceLabel: string;
    quantity: number;
    lineTotalLabel: string;
  }>;
};

export type UserProfileView = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
};

type CartWithProducts = Awaited<ReturnType<typeof getOrCreateCart>>;

function mapCart(cart: CartWithProducts): CartView {
  const items = cart.items.map((item) => {
    const priceValue = item.product.priceValue;
    const lineTotalValue = priceValue * item.quantity;

    return {
      id: item.id,
      quantity: item.quantity,
      title: item.product.title,
      slug: item.product.slug,
      imageUrl: item.product.images[0]?.imageUrl ?? "/accounts/acc-01.svg",
      priceLabel: item.product.price,
      priceValue,
      lineTotalLabel: formatPriceLabel(lineTotalValue),
      lineTotalValue,
    };
  });

  const subtotalValue = items.reduce((sum, item) => sum + item.lineTotalValue, 0);

  return {
    id: cart.id,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalLabel: formatPriceLabel(subtotalValue),
    subtotalValue,
    items,
  };
}

function mapOrderSummary(order: {
  id: string;
  createdAt: Date;
  totalLabel: string;
  totalValue: number;
  status: string;
  paymentOrderCode: string | null;
  checkoutUrl: string | null;
  items: Array<{ quantity: number }>;
}): OrderSummary {
  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    totalLabel: order.totalLabel,
    totalValue: order.totalValue,
    status: order.status,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    checkoutUrl: order.checkoutUrl,
    paymentOrderCode: order.paymentOrderCode,
  };
}

async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.cart.create({
    data: { userId },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
        include: {
          product: {
            include: {
              images: {
                orderBy: { position: "asc" },
              },
            },
          },
        },
      },
    },
  });
}

export async function getUserProfileByEmail(email: string): Promise<UserProfileView | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || user.email.split("@")[0],
    createdAt: user.createdAt.toISOString(),
  };
}

export async function updateUserDisplayName(email: string, displayName: string) {
  const nextDisplayName = displayName.trim();
  const user = await prisma.user.update({
    where: { email },
    data: {
      displayName: nextDisplayName || null,
    },
  });

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName || user.email.split("@")[0],
    createdAt: user.createdAt.toISOString(),
  };
}

export async function changeUserPassword(email: string, oldPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user?.passwordHash) {
    return { ok: false as const, error: "Tài khoản chưa sẵn sàng để đổi mật khẩu." };
  }

  if (!verifyPassword(oldPassword, user.passwordHash)) {
    return { ok: false as const, error: "Mật khẩu hiện tại chưa đúng." };
  }

  await prisma.user.update({
    where: { email },
    data: {
      passwordHash: hashPassword(newPassword),
    },
  });

  return { ok: true as const };
}

export async function getCartByUserId(userId: string): Promise<CartView> {
  const cart = await getOrCreateCart(userId);
  return mapCart(cart);
}

export async function addProductToCart(userId: string, productId: string) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: {
        increment: 1,
      },
    },
    create: {
      cartId: cart.id,
      productId,
      quantity: 1,
    },
  });

  return getCartByUserId(userId);
}

export async function removeCartItem(userId: string, cartItemId: string) {
  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.deleteMany({
    where: {
      id: cartItemId,
      cartId: cart.id,
    },
  });

  return getCartByUserId(userId);
}

export async function createPendingOrderFromCart(input: {
  userId: string;
  orderCode: number;
  checkoutUrl?: string | null;
  paymentLinkId?: string | null;
}) {
  const cart = await getOrCreateCart(input.userId);
  if (cart.items.length === 0) {
    return null;
  }

  const totalValue = cart.items.reduce((sum, item) => sum + item.product.priceValue * item.quantity, 0);
  const totalLabel = formatPriceLabel(totalValue);

  const order = await prisma.order.create({
    data: {
      userId: input.userId,
      paymentOrderCode: String(input.orderCode),
      paymentLinkId: input.paymentLinkId ?? null,
      checkoutUrl: input.checkoutUrl ?? null,
      paymentProvider: "payos",
      status: "pending",
      totalLabel,
      totalValue,
      items: {
        create: cart.items.map((item) => ({
          productId: item.product.id,
          productSlug: item.product.slug,
          title: item.product.title,
          imageUrl: item.product.images[0]?.imageUrl ?? null,
          priceLabel: item.product.price,
          priceValue: item.product.priceValue,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    totalLabel: order.totalLabel,
    totalValue: order.totalValue,
    status: order.status,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      productSlug: item.productSlug,
      imageUrl: item.imageUrl,
      priceLabel: item.priceLabel,
      quantity: item.quantity,
      lineTotalLabel: formatPriceLabel(item.priceValue * item.quantity),
    })),
  };
}

export async function attachPaymentLinkToOrder(orderId: string, input: { checkoutUrl: string; paymentLinkId?: string | null }) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      checkoutUrl: input.checkoutUrl,
      paymentLinkId: input.paymentLinkId ?? null,
    },
  });
}

export async function cancelOrderById(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "cancelled",
    },
  });
}

export async function markOrderPaidByPaymentCode(paymentOrderCode: string) {
  const order = await prisma.order.findUnique({
    where: { paymentOrderCode },
    include: {
      items: true,
      user: {
        include: {
          carts: {
            orderBy: { updatedAt: "desc" },
            include: {
              items: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    return null;
  }

  if (order.status === "paid") {
    return order.id;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    const latestCart = order.user.carts[0];
    if (!latestCart) return;

    const productIds = order.items.map((item) => item.productId).filter(Boolean) as string[];
    if (productIds.length === 0) return;

    await tx.cartItem.deleteMany({
      where: {
        cartId: latestCart.id,
        productId: { in: productIds },
      },
    });
  });

  return order.id;
}

export async function markOrderCancelledByPaymentCode(paymentOrderCode: string) {
  const order = await prisma.order.findUnique({
    where: { paymentOrderCode },
    select: { id: true, status: true },
  });

  if (!order || order.status === "paid") {
    return null;
  }

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "cancelled" },
  });

  return order.id;
}

export async function getOrderByPaymentCode(paymentOrderCode: string): Promise<OrderDetail | null> {
  const order = await prisma.order.findUnique({
    where: { paymentOrderCode },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) return null;

  return {
    ...mapOrderSummary(order),
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      productSlug: item.productSlug,
      imageUrl: item.imageUrl,
      priceLabel: item.priceLabel,
      quantity: item.quantity,
      lineTotalLabel: formatPriceLabel(item.priceValue * item.quantity),
    })),
  };
}

export async function getOrdersByUserId(userId: string): Promise<OrderSummary[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
    },
  });

  return orders.map(mapOrderSummary);
}

export async function getOrderDetailByUserId(userId: string, orderId: string): Promise<OrderDetail | null> {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) return null;

  return {
    ...mapOrderSummary(order),
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      productSlug: item.productSlug,
      imageUrl: item.imageUrl,
      priceLabel: item.priceLabel,
      quantity: item.quantity,
      lineTotalLabel: formatPriceLabel(item.priceValue * item.quantity),
    })),
  };
}
