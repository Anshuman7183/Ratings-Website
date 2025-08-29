import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Always provide an address because your schema requires it
const DEFAULT_ADDRESS = "Seed City";

async function upsertUser({
  email,
  name,
  role,
  address = DEFAULT_ADDRESS,
  password = "pass123",
}: {
  email: string;
  name: string;
  role: "ADMIN" | "OWNER" | "USER";
  address?: string;       // required by your schema; we default to a string
  password?: string;
}) {
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {}, // don't overwrite on reseed
    create: { email, name, role, address, password: hash },
  });
  return user;
}

async function ensureStore({
  name,
  address,
  ownerId,
}: {
  name: string;
  address: string;
  ownerId: number | null;
}) {
  const existing = await prisma.store.findFirst({ where: { name } });
  if (existing) return existing;

  return prisma.store.create({
    data: { name, address, ownerId },
  });
}

async function ensureRating({
  userId,
  storeId,
  value,
}: {
  userId: number;
  storeId: number;
  value: number;
}) {
  // Use upsert if you have @@unique([userId, storeId]); else fallback to create-if-missing
  try {
    return await prisma.rating.upsert({
      where: { userId_storeId: { userId, storeId } },
      update: { value },
      create: { userId, storeId, value },
    });
  } catch {
    const exists = await prisma.rating.findFirst({ where: { userId, storeId } });
    if (exists) return exists;
    return prisma.rating.create({ data: { userId, storeId, value } });
  }
}

async function main() {
  console.log("Seeding users...");
  const admin  = await upsertUser({ email: "admin@example.com",  name: "System Admin", role: "ADMIN" });
  const owner1 = await upsertUser({ email: "owner1@example.com", name: "Owner One",   role: "OWNER" });
  const owner2 = await upsertUser({ email: "owner2@example.com", name: "Owner Two",   role: "OWNER" });
  const user1  = await upsertUser({ email: "user1@example.com",  name: "User One",    role: "USER"  });
  const user2  = await upsertUser({ email: "user2@example.com",  name: "User Two",    role: "USER"  });

  console.log("Seeding stores...");
  const s1 = await ensureStore({ name: "Flipkart",         address: "Bangalore", ownerId: owner1.id });
  const s2 = await ensureStore({ name: "Big Bazaar",       address: "Mumbai",    ownerId: owner1.id });
  const s3 = await ensureStore({ name: "Reliance Trends",  address: "Hyderabad", ownerId: owner2.id });
  const s4 = await ensureStore({ name: "DMart",            address: "Pune",      ownerId: owner2.id });
  const s5 = await ensureStore({ name: "Spencer's Retail", address: "Kolkata",   ownerId: null });

  console.log("Seeding ratings...");
  await Promise.all([
    ensureRating({ userId: user1.id,  storeId: s1.id, value: 5 }),
    ensureRating({ userId: user2.id,  storeId: s1.id, value: 4 }),
    ensureRating({ userId: admin.id,  storeId: s1.id, value: 4 }),

    ensureRating({ userId: user1.id,  storeId: s2.id, value: 3 }),
    ensureRating({ userId: user2.id,  storeId: s2.id, value: 4 }),

    ensureRating({ userId: user1.id,  storeId: s3.id, value: 5 }),
    ensureRating({ userId: user2.id,  storeId: s3.id, value: 5 }),

    ensureRating({ userId: user1.id,  storeId: s4.id, value: 2 }),
    ensureRating({ userId: user2.id,  storeId: s4.id, value: 3 }),
    ensureRating({ userId: admin.id,  storeId: s4.id, value: 4 }),

    ensureRating({ userId: user1.id,  storeId: s5.id, value: 4 }),
    ensureRating({ userId: user2.id,  storeId: s5.id, value: 3 }),
  ]);

  console.log("✅ Seed complete. Login with password: pass123");
  console.log("- admin@example.com (ADMIN)");
  console.log("- owner1@example.com (OWNER)");
  console.log("- owner2@example.com (OWNER)");
  console.log("- user1@example.com (USER)");
  console.log("- user2@example.com (USER)");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
