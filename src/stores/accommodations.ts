// src/stores/accommodations.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAccommodationService } from '@/composables/useAccommodationService'
import type {
  Accommodation,
  CreateAccommodationData,
  UpdateAccommodationData,
} from '@/types/accommodation'

export const useAccommodationsStore = defineStore('accommodations', () => {
  const accommodationService = useAccommodationService()

  // Estado
  const accommodations = ref<Accommodation[]>([])
  const isLoading = ref(false)
  const selectedAccommodation = ref<Accommodation | null>(null)

  // Computed
  const activeAccommodations = computed(() =>
    accommodations.value.filter((a) => a.status === 'active'),
  )

  const inactiveAccommodations = computed(() =>
    accommodations.value.filter((a) => a.status === 'inactive'),
  )

  const totalCount = computed(() => accommodations.value.length)
  const activeCount = computed(() => activeAccommodations.value.length)
  const inactiveCount = computed(() => inactiveAccommodations.value.length)

  /**
   * Obtiene todos los alojamientos desde la base de datos
   */
  const fetchAccommodations = async (): Promise<void> => {
    try {
      isLoading.value = true
      accommodations.value = await accommodationService.getAll()
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Obtiene un alojamiento específico por ID
   */
  const fetchAccommodationById = async (id: string): Promise<void> => {
    try {
      isLoading.value = true
      selectedAccommodation.value = await accommodationService.getById(id)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Crea un nuevo alojamiento
   */
  const createAccommodation = async (data: CreateAccommodationData): Promise<Accommodation> => {
    const accommodation = await accommodationService.create(data)
    accommodations.value.unshift(accommodation)
    return accommodation
  }

  /**
   * Actualiza un alojamiento existente
   */
  const updateAccommodation = async (data: UpdateAccommodationData): Promise<Accommodation> => {
    const updated = await accommodationService.update(data)
    const index = accommodations.value.findIndex((a) => a.id === updated.id)
    if (index !== -1) {
      accommodations.value[index] = updated
    }
    if (selectedAccommodation.value?.id === updated.id) {
      selectedAccommodation.value = updated
    }
    return updated
  }

  /**
   * Elimina un alojamiento
   */
  const deleteAccommodation = async (id: string): Promise<void> => {
    await accommodationService.remove(id)
    accommodations.value = accommodations.value.filter((a) => a.id !== id)
    if (selectedAccommodation.value?.id === id) {
      selectedAccommodation.value = null
    }
  }

  /**
   * Limpia el alojamiento seleccionado
   */
  const clearSelected = (): void => {
    selectedAccommodation.value = null
  }

  return {
    // Estado
    accommodations,
    isLoading,
    selectedAccommodation,

    // Computed
    activeAccommodations,
    inactiveAccommodations,
    totalCount,
    activeCount,
    inactiveCount,

    // Acciones
    fetchAccommodations,
    fetchAccommodationById,
    createAccommodation,
    updateAccommodation,
    deleteAccommodation,
    clearSelected,
  }
})
