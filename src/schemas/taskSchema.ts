import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const VALIDATION_RULES = {
  TITLE: {
    MIN: 5,
    MAX: 150,
  },
  DESCRIPTION: {
    MAX: 1000,
  },
} as const

/**
 * Schema de validación para formulario de tarea
 */
export const taskSchema = z.object({
  accommodation_id: z
    .string()
    .uuid('Debe seleccionar un alojamiento válido')
    .min(1, 'El alojamiento es requerido'),

  title: z
    .string()
    .min(
      VALIDATION_RULES.TITLE.MIN,
      `El título debe tener al menos ${VALIDATION_RULES.TITLE.MIN} caracteres`,
    )
    .max(
      VALIDATION_RULES.TITLE.MAX,
      `El título debe tener máximo ${VALIDATION_RULES.TITLE.MAX} caracteres`,
    )
    .trim(),

  description: z
    .string()
    .max(
      VALIDATION_RULES.DESCRIPTION.MAX,
      `La descripción debe tener máximo ${VALIDATION_RULES.DESCRIPTION.MAX} caracteres`,
    )
    .trim()
    .optional()
    .or(z.literal('')),

  priority: z.enum(['low', 'medium', 'high']).default('medium'),

  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),

  due_date: z
    .string()
    .optional()
    .nullable()
    .refine((val) => {
      if (!val) return true
      const date = new Date(val)
      return !isNaN(date.getTime())
    }, 'Fecha inválida'),
})

export type TaskFormValues = z.infer<typeof taskSchema>

export const taskValidationSchema = toTypedSchema(taskSchema)
