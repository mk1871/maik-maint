/**
 * Roles disponibles en el sistema
 * supervisor: Usuario estándar con permisos completos
 * chief: Jefe con permisos completos (mismo nivel que supervisor por ahora)
 */
export type UserRole = 'supervisor' | 'chief'

/**
 * Perfil extendido de usuario desde la tabla public.users
 */
export interface UserProfile {
  id: string
  role: UserRole
  full_name: string
  profile_picture_url: string | null
  created_at: string
  updated_at: string
}
