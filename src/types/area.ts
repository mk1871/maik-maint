/**
 * Área del catálogo fijo (cocina, baño, dormitorio, etc.)
 */
export interface AreaCatalog {
  id: string
  key: string
  label: string
  icon: string | null
  display_order: number
  created_at: string
}

/**
 * Elemento específico dentro de un área del catálogo
 */
export interface ElementCatalog {
  id: string
  area_catalog_id: string
  name: string
  display_order: number
  created_at: string
}

/**
 * Elemento con información del área relacionada (para queries JOIN)
 */
export interface ElementWithArea extends ElementCatalog {
  area: AreaCatalog
}

/**
 * Estructura agrupada para UI: área con sus elementos
 */
export interface AreaWithElements extends AreaCatalog {
  elements: ElementCatalog[]
}
