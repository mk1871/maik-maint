import type { Accommodation } from './accommodation'
import type { AreaCatalog, ElementCatalog } from './area'

/**
 * Prioridad de la tarea
 */
export type TaskPriority = 'high' | 'medium' | 'low'

/**
 * Estado del ciclo de vida de la tarea
 */
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

/**
 * Tarea de mantenimiento completa desde la base de datos
 */
export interface Task {
  id: string
  accommodation_id: string
  area_catalog_id: string
  element_catalog_id: string | null
  description: string
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  estimated_cost: number | null
  repairer_name: string | null
  repair_cost: number | null
  time_spent_days: number | null
  completion_notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  completed_at: string | null
}

/**
 * Datos para crear una nueva tarea
 */
export interface CreateTaskData {
  accommodation_id: string
  area_catalog_id: string
  element_catalog_id?: string | null
  description: string
  priority?: TaskPriority
  status?: TaskStatus
  due_date?: string | null
  estimated_cost?: number | null
}

/**
 * Datos para actualizar una tarea existente
 */
export interface UpdateTaskData extends Partial<CreateTaskData> {
  id: string
  repairer_name?: string | null
  repair_cost?: number | null
  time_spent_days?: number | null
  completion_notes?: string | null
  status?: TaskStatus
}

/**
 * Tarea con datos relacionados para display (JOIN queries)
 */
export interface TaskWithRelations extends Task {
  accommodation?: Accommodation
  area?: AreaCatalog
  element?: ElementCatalog
}
