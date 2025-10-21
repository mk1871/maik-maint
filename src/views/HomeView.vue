<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { LogOut, Home as HomeIcon, Building2, ClipboardList } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
  // Asegurar que el perfil está cargado
  if (!authStore.profile && authStore.user) {
    await authStore.fetchProfile()
  }
})

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

const handleLogout = async () => {
  try {
    await authStore.logout()
    toast.success('Sesión cerrada correctamente')
    router.push({ name: 'Login' })
  } catch (error: unknown) {
    toast.error('Error al cerrar sesión', {
      description: getErrorMessage(error)
    })
  }
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <HomeIcon class="h-6 w-6 text-primary" />
            <h1 class="text-xl font-bold">Sistema de Mantenimiento</h1>
          </div>

          <!-- User Menu -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button class="relative h-10 w-10 rounded-full" variant="ghost">
                <Avatar>
                  <AvatarFallback>
                    {{ getInitials(authStore.userDisplayName) }}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium leading-none">
                    {{ authStore.userDisplayName }}
                  </p>
                  <p class="text-xs leading-none text-muted-foreground">
                    {{ authStore.user?.email }}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-destructive cursor-pointer" @click="handleLogout">
                <LogOut class="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="space-y-6">
        <!-- Welcome Card -->
        <Card>
          <CardHeader>
            <CardTitle>¡Bienvenido, {{ authStore.userDisplayName }}!</CardTitle>
            <CardDescription>
              Sistema de gestión de mantenimiento de alojamientos
            </CardDescription>
          </CardHeader>
        </Card>

        <!-- Quick Actions -->
        <div class="grid gap-4 md:grid-cols-2">
          <Card class="hover:bg-slate-50 transition-colors cursor-pointer" @click="router.push({ name: 'Accommodations' })">
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-lg">Alojamientos</CardTitle>
                <Building2 class="h-8 w-8 text-muted-foreground" />
              </div>
              <CardDescription>
                Gestionar propiedades y sus datos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card class="hover:bg-slate-50 transition-colors cursor-pointer" @click="router.push({ name: 'Tasks' })">
            <CardHeader>
              <div class="flex items-center justify-between">
                <CardTitle class="text-lg">Tareas</CardTitle>
                <ClipboardList class="h-8 w-8 text-muted-foreground" />
              </div>
              <CardDescription>
                Ver y crear tareas de mantenimiento
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <!-- Placeholder Stats -->
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>
              Panel de estadísticas (próximamente)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p class="text-sm text-muted-foreground">
              Aquí se mostrarán las estadísticas del sistema cuando implementemos el dashboard completo.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
</template>
