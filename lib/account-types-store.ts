import { prisma } from "@/lib/prisma";

export type AccountType = {
  id: string;
  name: string;
  slug: string;
  className: string;
  sortOrder: number;
};

export const ACCOUNT_TYPE_CLASS_OPTIONS = [
  { value: "tier-starter", label: "Xanh la" },
  { value: "tier-elite", label: "Xanh duong" },
  { value: "tier-rare", label: "Tim" },
  { value: "tier-mythic", label: "Do" },
] as const;

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function mapAccountType(record: {
  id: string;
  name: string;
  slug: string;
  className: string;
  sortOrder: number;
}): AccountType {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    className: record.className,
    sortOrder: record.sortOrder,
  };
}

export async function getAllAccountTypes(): Promise<AccountType[]> {
  const items = await prisma.accountType.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return items.map(mapAccountType);
}

export async function getAccountTypeByName(name: string): Promise<AccountType | null> {
  const normalized = name.trim();
  if (!normalized) return null;

  const item = await prisma.accountType.findFirst({
    where: {
      name: {
        equals: normalized,
        mode: "insensitive",
      },
    },
  });

  return item ? mapAccountType(item) : null;
}

export async function createAccountType(input: {
  name: string;
  className?: string;
  sortOrder?: number;
}): Promise<AccountType> {
  const name = input.name.trim();
  const slug = slugify(name);

  const item = await prisma.accountType.create({
    data: {
      name,
      slug,
      className: input.className || "tier-starter",
      sortOrder: input.sortOrder ?? 0,
    },
  });

  return mapAccountType(item);
}

export async function updateAccountType(
  id: string,
  input: {
    name?: string;
    className?: string;
    sortOrder?: number;
  },
): Promise<AccountType | null> {
  const existing = await prisma.accountType.findUnique({ where: { id } });
  if (!existing) return null;

  const name = input.name?.trim() || existing.name;
  const slug = slugify(name);

  const item = await prisma.accountType.update({
    where: { id },
    data: {
      name,
      slug,
      className: input.className,
      sortOrder: input.sortOrder,
    },
  });

  return mapAccountType(item);
}

export async function deleteAccountType(id: string): Promise<boolean> {
  try {
    await prisma.accountType.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function resolveAccountTypeClass(name: string): Promise<string> {
  const item = await getAccountTypeByName(name);
  if (item) {
    return item.className;
  }

  const normalized = name.trim().toLowerCase();
  if (
    normalized.includes("xịn") ||
    normalized.includes("xin") ||
    normalized.includes("chiến") ||
    normalized.includes("chien")
  ) {
    return "tier-mythic";
  }
  if (normalized.includes("hiem")) {
    return "tier-rare";
  }
  if (normalized.includes("ngon")) {
    return "tier-elite";
  }

  return "tier-starter";
}
