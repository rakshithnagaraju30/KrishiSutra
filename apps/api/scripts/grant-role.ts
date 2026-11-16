/**
 * Give a role to a registered user (used to create the FIRST administrator; after that, administrators
 * use POST /api/v1/admin/users/{id}/roles).
 *
 *   npm run user:grant-role -- <mobile number> <ROLE>
 *   npm run user:grant-role -- 9876543210 ADMIN
 *
 * Runs against DATABASE_URL. The user must have verified their phone number (registered in the app).
 */
import { normaliseIndianMobile } from '../src/auth/phone.ts';
import { prisma } from '../src/db/prisma.ts';
import { ROLE_CODES } from '../src/validators/auth.schemas.ts';

async function main() {
  const [rawPhone, rawRole] = process.argv.slice(2);
  const phone = rawPhone ? normaliseIndianMobile(rawPhone) : null;
  const role = rawRole?.toUpperCase();
  if (!phone || !role || !(ROLE_CODES as readonly string[]).includes(role)) {
    console.error(`Usage: npm run user:grant-role -- <mobile number> <${ROLE_CODES.join('|')}>`);
    process.exitCode = 2;
    return;
  }
  const user = await prisma.user.findFirst({ where: { phone, deletedAt: null }, select: { id: true, fullName: true, phoneVerifiedAt: true, status: true } });
  if (!user || !user.phoneVerifiedAt || user.status !== 'ACTIVE') {
    console.error('No active user with a verified phone number found for that number.');
    process.exitCode = 1;
    return;
  }
  const roleRow = await prisma.role.findUniqueOrThrow({ where: { code: role }, select: { id: true } });
  await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: roleRow.id } }, update: {}, create: { userId: user.id, roleId: roleRow.id } });
  console.log(`Role ${role} granted to ${user.fullName} (${user.id}).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
