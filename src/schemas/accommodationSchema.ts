// src/schemas/accommodationSchema.ts
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

const VALIDATION_RULES = {
  CODE: {
    MIN: 1,
    MAX: 4,
    PATTERN: /^[A-Z0-9]+$/,
  },
  NAME: {
    MIN: 3,
    MAX: 100,
  },
  ADDRESS: {
    MAX: 255,
  },
  NOTES: {
    MAX: 500,
  },
} as const

/**
 * Schema de validación para formulario de alojamiento
 */
export const accommodationSchema = z.object({
  code: z
    .string()
    .min(VALIDATION_RULES.CODE.MIN, 'El código es requerido')
    .max(
      VALIDATION_RULES.CODE.MAX,
      `El código debe tener máximo ${VALIDATION_RULES.CODE.MAX} caracteres`,
    )
    .regex(
      VALIDATION_RULES.CODE.PATTERN,
      'El código solo puede contener letras mayúsculas y números',
    )
    .transform((val) => val.toUpperCase()),

  name: z
    .string()
    .min(
      VALIDATION_RULES.NAME.MIN,
      `El nombre debe tener al menos ${VALIDATION_RULES.NAME.MIN} caracteres`,
    )
    .max(
      VALIDATION_RULES.NAME.MAX,
      `El nombre debe tener máximo ${VALIDATION_RULES.NAME.MAX} caracteres`,
    )
    .trim(),

  address: z
    .string()
    .max(
      VALIDATION_RULES.ADDRESS.MAX,
      `La dirección debe tener máximo ${VALIDATION_RULES.ADDRESS.MAX} caracteres`,
    )
    .trim()
    .optional()
    .or(z.literal('')),

  status: z.enum(['active', 'inactive']).default('active'),

  notes: z
    .string()
    .max(
      VALIDATION_RULES.NOTES.MAX,
      `Las notas deben tener máximo ${VALIDATION_RULES.NOTES.MAX} caracteres`,
    )
    .trim()
    .optional()
    .or(z.literal('')),
})

export type AccommodationFormValues = z.infer<typeof accommodationSchema>

export const accommodationValidationSchema = toTypedSchema(accommodationSchema)
