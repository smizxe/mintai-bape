import { ProductStatus } from "@prisma/client";
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
  accountLoginEmail: string;
  accountLoginPassword: string;
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

export type DeliverableOrder = {
  id: string;
  totalLabel: string;
  customerEmail: string;
  customerName: string;
  deliveryEmailLockedAt: string | null;
  deliveryEmailSentAt: string | null;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    accountLoginEmail: string | null;
    accountLoginPassword: string | null;
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
    const quantity = 1;
    const lineTotalValue = priceValue;

    return {
      id: item.id,
      quantity,
      title: item.product.title,
      slug: item.product.code,
      imageUrl: item.product.images[0]?.imageUrl ?? "/accounts/acc-01.svg",
      priceLabel: item.product.price,
      priceValue,
      lineTotalLabel: formatPriceLabel(lineTotalValue),
      lineTotalValue,
      accountLoginEmail: item.product.accountLoginEmail ?? "",
      accountLoginPassword: item.product.accountLoginPassword ?? "",
    };
  });

  const subtotalValue = items.reduce((sum, item) => sum + item.lineTotalValue, 0);

  return {
    id: cart.id,
    itemCount: items.length,
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
    itemCount: order.items.length,
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

  if (existing) return existing;

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
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true },
  });

  if (!product || product.status !== ProductStatus.ACTIVE) {
    throw new Error("Acc này hiện không còn khả dụng.");
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: {
      quantity: 1,
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

  const hasUnavailableProduct = cart.items.some((item) => item.product.status !== ProductStatus.ACTIVE);
  if (hasUnavailableProduct) {
    throw new Error("Có acc trong giỏ hàng không còn khả dụng. Vui lòng kiểm tra lại trước khi thanh toán.");
  }

  const totalValue = cart.items.reduce((sum, item) => sum + item.product.priceValue, 0);
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
          productSlug: item.product.code,
          title: item.product.title,
          imageUrl: item.product.images[0]?.imageUrl ?? null,
          priceLabel: item.product.price,
          priceValue: item.product.priceValue,
          accountLoginEmail: item.product.accountLoginEmail || null,
          accountLoginPassword: item.product.accountLoginPassword || null,
          quantity: 1,
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
    itemCount: order.items.length,
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      productSlug: item.productSlug,
      imageUrl: item.imageUrl,
      priceLabel: item.priceLabel,
      quantity: 1,
      lineTotalLabel: formatPriceLabel(item.priceValue),
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

  if (!order) return null;
  if (order.status === "paid") return order.id;

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: "paid",
        paidAt: new Date(),
      },
    });

    const productIds = order.items.map((item) => item.productId).filter(Boolean) as string[];
    if (productIds.length > 0) {
      await tx.product.updateMany({
        where: {
          id: { in: productIds },
        },
        data: {
          status: ProductStatus.SOLD,
          isFeaturedHero: false,
          featuredWeekRank: null,
        },
      });
    }

    const latestCart = order.user.carts[0];
    if (!latestCart || productIds.length === 0) return;

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

export async function getDeliverableOrderByPaymentCode(paymentOrderCode: string): Promise<DeliverableOrder | null> {
  const order = await prisma.order.findUnique({
    where: { paymentOrderCode },
    include: {
      user: true,
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order) return null;

  return {
    id: order.id,
    totalLabel: order.totalLabel,
    customerEmail: order.user.email,
    customerName: order.user.displayName || order.user.email.split("@")[0],
    deliveryEmailLockedAt: order.deliveryEmailLockedAt ? order.deliveryEmailLockedAt.toISOString() : null,
    deliveryEmailSentAt: order.deliveryEmailSentAt ? order.deliveryEmailSentAt.toISOString() : null,
    items: order.items.map((item) => ({
      id: item.id,
      title: item.title,
      quantity: item.quantity,
      accountLoginEmail: item.accountLoginEmail ?? null,
      accountLoginPassword: item.accountLoginPassword ?? null,
    })),
  };
}

export async function lockOrderDeliveryEmail(orderId: string) {
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      deliveryEmailSentAt: null,
      deliveryEmailLockedAt: null,
    },
    data: {
      deliveryEmailLockedAt: new Date(),
    },
  });

  return result.count > 0;
}

export async function markOrderDeliveryEmailSent(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryEmailLockedAt: null,
      deliveryEmailSentAt: new Date(),
    },
  });
}

export async function releaseOrderDeliveryEmailLock(orderId: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      deliveryEmailLockedAt: null,
    },
  });
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
      quantity: 1,
      lineTotalLabel: formatPriceLabel(item.priceValue),
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
      quantity: 1,
      lineTotalLabel: formatPriceLabel(item.priceValue),
    })),
  };
}
