// src/stores/tasks.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTaskService } from '@/composables/useTaskService'
import type { Task, CreateTaskData, UpdateTaskData } from '@/types/task'

export const useTasksStore = defineStore('tasks', () => {
  const taskService = useTaskService()

  // Estado
  const tasks = ref<Task[]>([])
  const isLoading = ref(false)
  const selectedTask = ref<Task | null>(null)

  // Computed - Filtros por estado
  const pendingTasks = computed(() => tasks.value.filter((t) => t.status === 'pending'))

  const inProgressTasks = computed(() => tasks.value.filter((t) => t.status === 'in_progress'))

  const completedTasks = computed(() => tasks.value.filter((t) => t.status === 'completed'))

  const cancelledTasks = computed(() => tasks.value.filter((t) => t.status === 'cancelled'))

  // Computed - Filtros por prioridad
  const highPriorityTasks = computed(() =>
    tasks.value.filter((t) => t.priority === 'high' && t.status !== 'completed'),
  )

  const mediumPriorityTasks = computed(() =>
    tasks.value.filter((t) => t.priority === 'medium' && t.status !== 'completed'),
  )

  const lowPriorityTasks = computed(() =>
    tasks.value.filter((t) => t.priority === 'low' && t.status !== 'completed'),
  )

  // Computed - Contadores
  const totalCount = computed(() => tasks.value.length)
  const pendingCount = computed(() => pendingTasks.value.length)
  const inProgressCount = computed(() => inProgressTasks.value.length)
  const completedCount = computed(() => completedTasks.value.length)

  /**
   * Obtiene todas las tareas
   */
  const fetchTasks = async (): Promise<void> => {
    try {
      isLoading.value = true
      tasks.value = await taskService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene tareas de un alojamiento específico
   */
  const fetchTasksByAccommodation = async (accommodationId: string): Promise<void> => {
    try {
      isLoading.value = true
      tasks.value = await taskService.getByAccommodation(accommodationId)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene una tarea específica por ID
   */
  const fetchTaskById = async (id: string): Promise<void> => {
    try {
      isLoading.value = true
      selectedTask.value = await taskService.getById(id)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea una nueva tarea
   */
  const createTask = async (data: CreateTaskData): Promise<Task> => {
    const task = await taskService.create(data)
    tasks.value.unshift(task)
    return task
  }

  /**
   * Actualiza una tarea existente
   */
  const updateTask = async (data: UpdateTaskData): Promise<Task> => {
    const updated = await taskService.update(data)
    const index = tasks.value.findIndex((t) => t.id === updated.id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
    if (selectedTask.value?.id === updated.id) {
      selectedTask.value = updated
    }
    return updated
  }

  /**
   * Elimina una tarea
   */
  const deleteTask = async (id: string): Promise<void> => {
    await taskService.remove(id)
    tasks.value = tasks.value.filter((t) => t.id !== id)
    if (selectedTask.value?.id === id) {
      selectedTask.value = null
    }
  }

  /**
   * Actualiza el estado de una tarea
   */
  const updateTaskStatus = async (id: string, status: Task['status']): Promise<Task> => {
    const updated = await taskService.updateStatus(id, status)
    const index = tasks.value.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
    if (selectedTask.value?.id === id) {
      selectedTask.value = updated
    }
    return updated
  }

  /**
   * Limpia la tarea seleccionada
   */
  const clearSelected = (): void => {
    selectedTask.value = null
  }

  return {
    // Estado
    tasks,
    isLoading,
    selectedTask,

    // Computed - Estados
    pendingTasks,
    inProgressTasks,
    completedTasks,
    cancelledTasks,

    // Computed - Prioridades
    highPriorityTasks,
    mediumPriorityTasks,
    lowPriorityTasks,

    // Computed - Contadores
    totalCount,
    pendingCount,
    inProgressCount,
    completedCount,

    // Acciones
    fetchTasks,
    fetchTasksByAccommodation,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    clearSelected,
  }
})
