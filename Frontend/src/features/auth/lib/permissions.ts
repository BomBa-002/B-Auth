/**
 * @file        : Frontend/src/features/auth/lib/permissions.ts
 * @description : طبقة الصلاحيات في الواجهة — فحص موحّد can() فوق مفاتيح الصلاحيات القادمة من الـ Backend (مثل "users:read").
 */

import { useAuthStore } from '@features/auth/store/auth.store'

/** نوع مفتاح الصلاحية بصيغة "resource:action" زي "users:read". */
export type PermissionKey = string

/**
 * فحص صلاحية واحدة أو أكثر ضد صلاحيات المستخدم الحالي.
 * - "users:read" → هل عنده الصلاحية دي؟
 * - wildcard: "storage:*" بتحقق أي صلاحية storage.
 * - المستخدم اللي معندوش جلسة معتبرة معندهوش أي صلاحية.
 */
export function can(user: { permissions: string[] } | null, permission: PermissionKey): boolean {
  if (!user || user.permissions.length === 0) return false
  if (user.permissions.includes('*')) return true
  if (user.permissions.includes(permission)) return true

  // دعم wildcard على مستوى المورد: "storage:*" تحقق "storage:read".
  const [resource] = permission.split(':')
  return user.permissions.includes(`${resource}:*`)
}

/** فحص أي صلاحية من مجموعة — مفيدة للأزرار اللي بتحقق أكتر من إجراء. */
export function canAny(user: { permissions: string[] } | null, permissions: PermissionKey[]): boolean {
  return permissions.some((permission) => can(user, permission))
}

/**
 * Hook للفحص التفاعلي داخل المكوّنات — بيتحدث تلقائياً مع تغيّر الجلسة.
 * مثال: const canManageUsers = useCan('users:write')
 */
export function useCan(permission: PermissionKey): boolean {
  const user = useAuthStore((state) => state.user)
  return can(user, permission)
}
