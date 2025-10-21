// src/schemas/authSchema.ts
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

/**
 * Schema de validación para el formulario de login
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'El email es requerido').email('Email inválido').toLowerCase().trim(),

  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormValues = z.infer<typeof loginSchema>

export const loginValidationSchema = toTypedSchema(loginSchema)
