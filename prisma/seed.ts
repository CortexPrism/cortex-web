import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  { key: "submissions:review:plugins", name: "Review Plugin Submissions", description: "Approve/reject plugin submissions" },
  { key: "submissions:review:agents", name: "Review Agent Submissions", description: "Approve/reject agent submissions" },
  { key: "users:manage", name: "Manage Users", description: "Create, edit, suspend users" },
  { key: "users:roles", name: "Manage Roles", description: "Create and assign roles and permissions" },
  { key: "marketplace:manage", name: "Manage Marketplace", description: "Edit/delete any marketplace listing" },
  { key: "categories:manage", name: "Manage Categories", description: "Create/edit marketplace categories" },
  { key: "github:manage", name: "Manage GitHub Connections", description: "Connect and sync GitHub repositories" },
  { key: "settings:manage", name: "Manage Settings", description: "Configure marketplace and system settings" },
  { key: "audit:view", name: "View Audit Logs", description: "Access system activity logs" },
];

const ROLES = {
  admin: {
    name: "Administrator",
    description: "Full system access",
    permissions: PERMISSIONS.map(p => p.key),
  },
  moderator: {
    name: "Moderator",
    description: "Review submissions and manage content",
    permissions: ["submissions:review:plugins", "submissions:review:agents", "marketplace:manage", "audit:view"],
  },
  developer: {
    name: "Developer",
    description: "Publish and manage own submissions",
    permissions: [],
  },
};

async function main() {
  for (const cat of [
    { name: "Code Execution", slug: "code-execution" },
    { name: "Data Processing", slug: "data-processing" },
    { name: "Developer Tools", slug: "developer-tools" },
    { name: "Analytics", slug: "analytics" },
    { name: "Communication", slug: "communication" },
    { name: "Productivity", slug: "productivity" },
    { name: "Research", slug: "research" },
    { name: "Security", slug: "security" },
  ]) {
    await prisma.category.upsert({ where: { slug: cat.slug }, update: {}, create: cat });
  }

  const permissionMap: Record<string, string> = {};
  for (const p of PERMISSIONS) {
    const perm = await prisma.permission.upsert({
      where: { key: p.key },
      update: { name: p.name, description: p.description },
      create: { key: p.key, name: p.name, description: p.description },
    });
    permissionMap[p.key] = perm.id;
  }

  for (const [key, roleData] of Object.entries(ROLES)) {
    const existingRole = await prisma.role.findUnique({ where: { key } });
    if (existingRole) {
      await prisma.role.update({ where: { key }, data: { name: roleData.name, description: roleData.description } });
      await prisma.rolePermission.deleteMany({ where: { roleId: existingRole.id } });
      await prisma.rolePermission.createMany({
        data: roleData.permissions.map(pk => ({ roleId: existingRole.id, permissionId: permissionMap[pk] })),
      });
    } else {
      const role = await prisma.role.create({
        data: { key, name: roleData.name, description: roleData.description, isSystem: key === "admin" },
      });
      await prisma.rolePermission.createMany({
        data: roleData.permissions.map(pk => ({ roleId: role.id, permissionId: permissionMap[pk] })),
      });
    }
  }

  const adminRole = await prisma.role.findUnique({ where: { key: "admin" } });

  const users = [
    { email: "admin@cortexprism.io", username: "admin", password: "admin12345", role: "admin" },
    { email: "jacob@cortexprism.io", username: "jacob", password: "password123", role: "admin" },
  ];

  for (const u of users) {
    const exists = await prisma.user.findUnique({ where: { email: u.email } });
    if (!exists) {
      const hash = await bcrypt.hash(u.password, 12);
      await prisma.user.create({
        data: {
          email: u.email,
          username: u.username,
          passwordHash: hash,
          role: u.role,
          roleId: adminRole?.id || null,
        },
      });
      console.log(`${u.role} user created (${u.email} / ${u.password})`);
    }
  }

  console.log("Seed complete: roles, permissions, categories, and users created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
