<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Building2, Loader2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { useAuthStore } from '@/stores/auth'
import { loginValidationSchema, type LoginFormValues } from '@/schemas/authSchema'

const router = useRouter()
const authStore = useAuthStore()

const isSubmitting = ref(false)

const { defineField, handleSubmit, errors } = useForm<LoginFormValues>({
  validationSchema: loginValidationSchema,
  initialValues: {
    email: '',
    password: '',
  },
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
    console.log('🔐 Intentando login con:', values.email) // Debug
    await authStore.login(values.email, values.password)

    console.log('✅ Login exitoso, usuario:', authStore.user) // Debug

    toast.success('¡Bienvenido!', {
      description: `Has iniciado sesión como ${authStore.userDisplayName}`,
    })

    router.push({ name: 'Home' })
  } catch (error: unknown) {
    console.error('❌ Error completo:', error) // Debug más detallado
    toast.error('Error al iniciar sesión', {
      description: getErrorMessage(error),
    })
  } finally {
    isSubmitting.value = false
  }
})
</script>

<template>
  <div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
    <div class="flex w-full max-w-sm flex-col gap-6">
      <!-- Logo/Brand -->
      <a class="flex items-center gap-2 self-center font-medium" href="#">
        <div
          class="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground"
        >
          <Building2 class="size-4" />
        </div>
        Sistema de Mantenimiento
      </a>

      <!-- Login Form Card -->
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader class="text-center">
            <CardTitle class="text-xl"> Bienvenido </CardTitle>
            <CardDescription> Ingresa tus credenciales para acceder al sistema </CardDescription>
          </CardHeader>
          <CardContent>
            <form @submit="onSubmit">
              <div class="grid gap-6">
                <!-- Email Field -->
                <div class="grid gap-2">
                  <Label html-for="email">Email</Label>
                  <Input
                    id="email"
                    v-model="email"
                    :disabled="isSubmitting"
                    autocomplete="email"
                    placeholder="tu@email.com"
                    required
                    type="email"
                    v-bind="emailAttrs"
                  />
                  <p v-if="errors.email" class="text-sm font-medium text-destructive">
                    {{ errors.email }}
                  </p>
                </div>

                <!-- Password Field -->
                <div class="grid gap-2">
                  <Label html-for="password">Contraseña</Label>
                  <Input
                    id="password"
                    v-model="password"
                    :disabled="isSubmitting"
                    autocomplete="current-password"
                    placeholder="••••••••"
                    required
                    type="password"
                    v-bind="passwordAttrs"
                  />
                  <p v-if="errors.password" class="text-sm font-medium text-destructive">
                    {{ errors.password }}
                  </p>
                </div>

                <!-- Submit Button -->
                <Button :disabled="isSubmitting" class="w-full" type="submit">
                  <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                  {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
                </Button>

                <!-- Separator -->
                <div
                  class="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"
                >
                  <span class="relative z-10 bg-background px-2 text-muted-foreground">
                    Entorno de desarrollo
                  </span>
                </div>

                <!-- Dev Credentials Info -->
                <div class="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p class="text-sm font-medium text-blue-900 mb-1">Usuario de prueba</p>
                  <p class="text-xs text-blue-700 font-mono">test@example.com</p>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
