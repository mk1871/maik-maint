/**
 * Estado del alojamiento
 */
export type AccommodationStatus = 'active' | 'inactive'

/**
 * Alojamiento completo desde la base de datos
 */
export interface Accommodation {
  id: string
  code: string
  name: string
  address: string | null
  status: AccommodationStatus
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Datos para crear un nuevo alojamiento
 */
export interface CreateAccommodationData {
  code: string
  name: string
  address?: string
  status?: AccommodationStatus
  notes?: string
}

/**
 * Datos para actualizar un alojamiento existente
 */
export interface UpdateAccommodationData extends Partial<CreateAccommodationData> {
  id: string
}
