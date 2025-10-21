<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Loader2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useAuthStore } from '@/stores/auth'
import { loginValidationSchema, type LoginFormValues } from '@/schemas/authSchema'

const router = useRouter()
const authStore = useAuthStore()

const isSubmitting = ref(false)

const { defineField, handleSubmit, errors } = useForm<LoginFormValues>({
  validationSchema: loginValidationSchema,
  initialValues: {
    email: '',
    password: ''
  }
})

const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

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

const onSubmit = handleSubmit(async (values) => {
  try {
    isSubmitting.value = true
    await authStore.login(values.email, values.password)

    toast.success('¡Bienvenido!', {
      description: `Has iniciado sesión como ${authStore.userDisplayName}`
    })

    router.push({ name: 'Home' })
  } catch (error: unknown) {
    toast.error('Error al iniciar sesión', {
      description: getErrorMessage(error) || 'Verifica tus credenciales e intenta de nuevo'
    })
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
    <Card class="w-full max-w-md shadow-lg">
      <CardHeader class="space-y-1">
        <CardTitle class="text-2xl font-bold text-center">
          Sistema de Mantenimiento
        </CardTitle>
        <CardDescription class="text-center">
          Ingresa tus credenciales para acceder
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form class="space-y-4" @submit="onSubmit">
          <!-- Email -->
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              v-model="email"
              :disabled="isSubmitting"
              autocomplete="email"
              placeholder="tu@email.com"
              type="email"
              v-bind="emailAttrs"
            />
            <p v-if="errors.email" class="text-sm text-destructive">
              {{ errors.email }}
            </p>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <Label for="password">Contraseña</Label>
            <Input
              id="password"
              v-model="password"
              :disabled="isSubmitting"
              autocomplete="current-password"
              placeholder="••••••••"
              type="password"
              v-bind="passwordAttrs"
            />
            <p v-if="errors.password" class="text-sm text-destructive">
              {{ errors.password }}
            </p>
          </div>

          <!-- Submit Button -->
          <Button
            :disabled="isSubmitting"
            class="w-full"
            type="submit"
          >
            <Loader2
              v-if="isSubmitting"
              class="mr-2 h-4 w-4 animate-spin"
            />
            {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </Button>
        </form>

        <!-- Credentials Helper (solo para desarrollo) -->
        <div class="mt-6 p-3 bg-muted rounded-md">
          <p class="text-xs text-muted-foreground text-center">
            Usuario de prueba: <span class="font-mono font-semibold">test@example.com</span>
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
