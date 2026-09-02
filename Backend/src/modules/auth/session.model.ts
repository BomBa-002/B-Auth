export interface SessionRecord {
  id: string
  userId: string
  rememberMe: boolean
  userAgent: string | null
  createdAt: string
  expiresAt: string
  revokedAt: string | null
  /**
   * نافذة سماح قصيرة بعد الـ rotation — بتسمح للتابات التانية اللي بتستخدم
   * نفس الـ refresh token القديم إنها تجدد بدل ما تاخد 401 مفاجئ.
   * الـ logout الصريح بيمسحها (null) فمش بتضعف الأمان.
   */
  graceUntil: string | null
}
