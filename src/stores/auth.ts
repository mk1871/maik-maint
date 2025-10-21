// src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { User } from '@supabase/supabase-js'
import type { UserProfile } from '@/types/user'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const isInitialized = ref(false)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const userRole = computed(() => profile.value?.role || 'supervisor')
  const userDisplayName = computed(() => profile.value?.full_name || user.value?.email || 'Usuario')

  /**
   * Extrae mensaje de error de forma segura
   */
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    if (typeof error === 'string') return error
    if (error && typeof error === 'object' && 'message' in error) {
      return String(error.message)
    }
    return 'Error desconocido'
  }

  /**
   * Verifica si hay sesión activa al cargar la app
   */
  const checkAuth = async (): Promise<void> => {
    if (isInitialized.value) {
      return
    }

    try {
      isLoading.value = true

      const { data, error } = await supabase.auth.getSession()

      if (error) throw error

      if (data.session) {
        user.value = data.session.user
        // Obtener perfil solo si la sesión está completa
        await fetchProfile()
      } else {
        user.value = null
        profile.value = null
      }
    } catch (error: unknown) {
      console.error('Error checking auth:', getErrorMessage(error))
      user.value = null
      profile.value = null
    } finally {
      isLoading.value = false
      isInitialized.value = true
    }
  }

  /**
   * Obtiene el perfil del usuario desde la tabla users
   */
  const fetchProfile = async (): Promise<void> => {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) throw error

      profile.value = data
    } catch (error: unknown) {
      console.error('Error fetching profile:', getErrorMessage(error))

      // Usar perfil por defecto en caso de error
      if (user.value) {
        profile.value = {
          id: user.value.id,
          role: 'supervisor',
          full_name: user.value.email?.split('@')[0] || 'Usuario',
          profile_picture_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    }
  }

  /**
   * Inicia sesión con email y contraseña
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      isLoading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      user.value = data.user
      await fetchProfile()
    } catch (error: unknown) {
      console.error('Error logging in:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Cierra sesión del usuario
   */
  const logout = async (): Promise<void> => {
    try {
      isLoading.value = true
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      profile.value = null
      isInitialized.value = false
    } catch (error: unknown) {
      console.error('Error logging out:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Listener para cambios en el estado de autenticación
   */
  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Solo reaccionar a eventos específicos después de la inicialización
      if (!isInitialized.value) return

      if (event === 'SIGNED_IN' && session) {
        user.value = session.user
        await fetchProfile()
      } else if (event === 'SIGNED_OUT') {
        user.value = null
        profile.value = null
      }
    })
  }

  return {
    // Estado
    user,
    profile,
    isLoading,
    isInitialized,

    // Computed
    isAuthenticated,
    userRole,
    userDisplayName,

    // Acciones
    checkAuth,
    fetchProfile,
    login,
    logout,
    setupAuthListener
  }
})
