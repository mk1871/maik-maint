import { supabase } from '@/lib/supabaseClient'
import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task'

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

export const useTaskService = () => {
  /**
   * Obtiene todas las tareas con información del alojamiento
   */
  const getAll = async (): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          accommodation:accommodations(id, code, name)
        `,
        )
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: unknown) {
      console.error('Error fetching tasks:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Obtiene tareas de un alojamiento específico
   */
  const getByAccommodation = async (accommodationId: string): Promise<Task[]> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          accommodation:accommodations(id, code, name)
        `,
        )
        .eq('accommodation_id', accommodationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error: unknown) {
      console.error('Error fetching tasks by accommodation:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Obtiene una tarea específica por ID
   */
  const getById = async (id: string): Promise<Task | null> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(
          `
          *,
          accommodation:accommodations(id, code, name, address)
        `,
        )
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null
        throw error
      }
      return data
    } catch (error: unknown) {
      console.error('Error fetching task:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Crea una nueva tarea
   */
  const create = async (taskData: CreateTaskData): Promise<Task> => {
    try {
      const userId = await getCurrentUserId()

      const dataToCreate = {
        ...taskData,
        created_by: userId,
        assigned_to: userId, // Por defecto asignar al creador
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([dataToCreate])
        .select(
          `
          *,
          accommodation:accommodations(id, code, name)
        `,
        )
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Error creating task:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Actualiza una tarea existente
   */
  const update = async (taskData: UpdateTaskData): Promise<Task> => {
    try {
      const { id, ...updates } = taskData

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(
          `
          *,
          accommodation:accommodations(id, code, name)
        `,
        )
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Error updating task:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Elimina una tarea
   */
  const remove = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id)

      if (error) throw error
    } catch (error: unknown) {
      console.error('Error deleting task:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  /**
   * Cambia el estado de una tarea
   */
  const updateStatus = async (id: string, status: Task['status']): Promise<Task> => {
    try {
      const updates: Partial<Task> = { status }

      // Si se marca como completada, guardar la fecha
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString()
      } else {
        updates.completed_at = null
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select(
          `
          *,
          accommodation:accommodations(id, code, name)
        `,
        )
        .single()

      if (error) throw error
      return data
    } catch (error: unknown) {
      console.error('Error updating task status:', getErrorMessage(error))
      throw new Error(getErrorMessage(error))
    }
  }

  return {
    getAll,
    getByAccommodation,
    getById,
    create,
    update,
    remove,
    updateStatus,
  }
}
