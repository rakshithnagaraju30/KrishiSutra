/**
 * User profiles and role management (Part 3.2).
 *
 * - Profile: a user may change only fullName, email and preferred language. Phone, status,
 *   verification dates and roles are protected (the request schema rejects them).
 * - Roles: only administrators grant or remove roles. Privileged roles require a verified phone
 *   (device accounts stay FARMER). An administrator cannot remove their own ADMIN role.
 */
import type { PrismaClient } from '../../generated/prisma/client.ts';
import { HttpError } from '../utils/http-error.ts';
import type { UpdateProfileBody } from '../validators/auth.schemas.ts';

const PROFILE_SELECT = {
  id: true, fullName: true, phone: true, phoneVerifiedAt: true, email: true, emailVerifiedAt: true, status: true,
  isDeviceAccount: true, createdAt: true, lastLoginAt: true,
  preferredLanguage: { select: { code: true } },
  roles: { select: { role: { select: { code: true } } } },
} as const;

type ProfileRow = {
  id: string; fullName: string; phone: string | null; phoneVerifiedAt: Date | null; email: string | null; emailVerifiedAt: Date | null;
  status: string; isDeviceAccount: boolean; createdAt: Date; lastLoginAt: Date | null;
  preferredLanguage: { code: string } | null; roles: { role: { code: string } }[];
};

function view(u: ProfileRow) {
  return {
    id: u.id,
    fullName: u.fullName,
    phone: u.phone,
    phoneVerified: u.phoneVerifiedAt !== null,
    email: u.email,
    emailVerified: u.emailVerifiedAt !== null,
    language: u.preferredLanguage?.code ?? null,
    status: u.status,
    roles: u.roles.map((r) => r.role.code).sort(),
    isDeviceAccount: u.isDeviceAccount,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

const PRIVILEGED = new Set(['ADMIN', 'CONTENT_EDITOR', 'AGRI_EXPERT']);

export type UserService = ReturnType<typeof createUserService>;

export function createUserService(prisma: PrismaClient) {
  async function load(userId: string) {
    const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: PROFILE_SELECT });
    if (!user) throw new HttpError(404, 'NOT_FOUND', 'User not found.');
    return view(user);
  }

  return {
    getProfile: load,

    async updateProfile(userId: string, body: UpdateProfileBody) {
      const data: { fullName?: string; email?: string | null; emailVerifiedAt?: null; preferredLanguageId?: string } = {};
      if (body.fullName !== undefined) data.fullName = body.fullName;
      if (body.language !== undefined) {
        const lang = await prisma.language.findUnique({ where: { code: body.language }, select: { id: true, isActive: true } });
        if (!lang || !lang.isActive) throw new HttpError(400, 'VALIDATION_ERROR', 'Unknown language.', [{ path: 'body.language', message: 'is not available', code: 'invalid' }]);
        data.preferredLanguageId = lang.id;
      }
      if (body.email !== undefined) {
        const current = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true, phone: true, isDeviceAccount: true } });
        if (body.email !== current.email) {
          if (body.email) {
            const owner = await prisma.user.findUnique({ where: { email: body.email }, select: { id: true } });
            if (owner && owner.id !== userId) throw new HttpError(409, 'EMAIL_ALREADY_REGISTERED', 'This email address is already used by another account.');
          } else if (!current.phone && !current.isDeviceAccount) {
            throw new HttpError(400, 'VALIDATION_ERROR', 'An account needs a phone number or an email address.');
          }
          data.email = body.email;
          data.emailVerifiedAt = null; // a changed email is not verified
        }
      }
      await prisma.user.update({ where: { id: userId }, data });
      return load(userId);
    },

    async findByPhone(phone: string) {
      const user = await prisma.user.findFirst({ where: { phone, deletedAt: null }, select: PROFILE_SELECT });
      if (!user) throw new HttpError(404, 'NOT_FOUND', 'User not found.');
      return view(user);
    },

    getUser: load,

    async grantRole(adminId: string, userId: string, roleCode: string) {
      const user = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { phoneVerifiedAt: true, status: true } });
      if (!user) throw new HttpError(404, 'NOT_FOUND', 'User not found.');
      if (PRIVILEGED.has(roleCode) && (!user.phoneVerifiedAt || user.status !== 'ACTIVE')) {
        throw new HttpError(409, 'USER_NOT_VERIFIED', 'Privileged roles can only be given to active users with a verified phone number.');
      }
      const role = await prisma.role.findUnique({ where: { code: roleCode }, select: { id: true } });
      if (!role) throw new HttpError(400, 'VALIDATION_ERROR', 'Unknown role.');
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId, roleId: role.id } },
        update: {},
        create: { userId, roleId: role.id, assignedById: adminId },
      });
      return load(userId);
    },

    async revokeRole(adminId: string, userId: string, roleCode: string) {
      if (adminId === userId && roleCode === 'ADMIN') {
        throw new HttpError(409, 'CANNOT_REMOVE_OWN_ADMIN', 'You cannot remove your own administrator role.');
      }
      const role = await prisma.role.findUnique({ where: { code: roleCode }, select: { id: true } });
      if (!role) throw new HttpError(400, 'VALIDATION_ERROR', 'Unknown role.');
      const exists = await prisma.user.findFirst({ where: { id: userId, deletedAt: null }, select: { id: true } });
      if (!exists) throw new HttpError(404, 'NOT_FOUND', 'User not found.');
      await prisma.userRole.deleteMany({ where: { userId, roleId: role.id } });
      return load(userId);
    },
  };
}
