// src/composables/useAccommodationService.ts
import { supabase } from '@/lib/supabaseClient'
import type {
  Accommodation,
  CreateAccommodationData,
  UpdateAccommodationData,
} from '@/types/accommodation'

/**
 * Obtiene el ID del usuario autenticado actual
 */
const getCurrentUserId = async (): Promise<string> => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuario no autenticado')
  return user.id
}

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

export const useAccommodationService = () => {
  /**
   * Obtiene todos los alojamientos ordenados por fecha de creación
   */
  const getAll = async (): Promise<Accommodation[]> => {
    try {
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: unknown) {
      console.error('Error fetching accommodations:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Obtiene un alojamiento específico por ID
   */
  const getById = async (id: string): Promise<Accommodation | null> => {
    try {
      const { data, error } = await supabase
        .from('accommodations')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    } catch (error: unknown) {
      console.error('Error fetching accommodation:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Crea un nuevo alojamiento
   */
  const create = async (accommodationData: CreateAccommodationData): Promise<Accommodation> => {
    try {
      const userId = await getCurrentUserId()

      const dataToCreate = {
        ...accommodationData,
        code: accommodationData.code.toUpperCase(),
        created_by: userId,
      }

      const { data, error } = await supabase
        .from('accommodations')
        .insert([dataToCreate])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Error creating accommodation:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Actualiza un alojamiento existente
   */
  const update = async (accommodationData: UpdateAccommodationData): Promise<Accommodation> => {
    try {
      const { id, ...updates } = accommodationData

      const { data, error } = await supabase
        .from('accommodations')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Error updating accommodation:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Elimina un alojamiento
   */
  const remove = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('accommodations').delete().eq('id', id)

      if (error) throw error
    } catch (error: unknown) {
      console.error('Error deleting accommodation:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  }
}
