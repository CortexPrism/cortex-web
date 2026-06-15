import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await Promise.all([
    prisma.category.upsert({ where: { slug: "code-execution" }, update: {}, create: { name: "Code Execution", slug: "code-execution" } }),
    prisma.category.upsert({ where: { slug: "data-processing" }, update: {}, create: { name: "Data Processing", slug: "data-processing" } }),
    prisma.category.upsert({ where: { slug: "developer-tools" }, update: {}, create: { name: "Developer Tools", slug: "developer-tools" } }),
    prisma.category.upsert({ where: { slug: "analytics" }, update: {}, create: { name: "Analytics", slug: "analytics" } }),
    prisma.category.upsert({ where: { slug: "communication" }, update: {}, create: { name: "Communication", slug: "communication" } }),
    prisma.category.upsert({ where: { slug: "productivity" }, update: {}, create: { name: "Productivity", slug: "productivity" } }),
    prisma.category.upsert({ where: { slug: "research" }, update: {}, create: { name: "Research", slug: "research" } }),
    prisma.category.upsert({ where: { slug: "security" }, update: {}, create: { name: "Security", slug: "security" } }),
  ]);

  const users = [
    { email: "admin@cortexprism.io", username: "admin", password: "admin12345", role: "admin" as const },
    { email: "jacob@cortexprism.io", username: "jacob", password: "password123", role: "admin" as const },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      const hash = await bcrypt.hash(u.password, 12);
      await prisma.user.create({
        data: { email: u.email, username: u.username, passwordHash: hash, role: u.role },
      });
      console.log(`${u.role} user created (${u.email} / ${u.password})`);
    }
  }

  console.log("Seed complete: categories and admin user created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
