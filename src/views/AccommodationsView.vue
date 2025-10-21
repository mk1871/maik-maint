<!-- src/views/AccommodationsView.vue -->
<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { Home as HomeIcon, Building2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

import AccommodationFormDialog from '@/components/accommodations/AccommodationFormDialog.vue'
import AccommodationCard from '@/components/accommodations/AccommodationCard.vue'
import { useAccommodationsStore } from '@/stores/accommodations'
import { useAuthStore } from '@/stores/auth'
import type { Accommodation } from '@/types/accommodation'

const router = useRouter()
const accommodationsStore = useAccommodationsStore()
const authStore = useAuthStore()

const accommodationToDelete = ref<Accommodation | null>(null)
const isDeleteDialogOpen = ref(false)
const isDeleting = ref(false)

onMounted(async () => {
  await accommodationsStore.fetchAccommodations()
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

const handleAccommodationCreated = async () => {
  await accommodationsStore.fetchAccommodations()
}

const handleEditAccommodation = (accommodation: Accommodation) => {
  // Por ahora solo mostramos un mensaje, implementaremos edición después
  toast.info('Edición', {
    description: 'La función de edición se implementará próximamente'
  })
}

const handleDeleteClick = (accommodation: Accommodation) => {
  accommodationToDelete.value = accommodation
  isDeleteDialogOpen.value = true
}

const confirmDelete = async () => {
  if (!accommodationToDelete.value) return

  try {
    isDeleting.value = true
    await accommodationsStore.deleteAccommodation(accommodationToDelete.value.id)
    toast.success('Alojamiento eliminado exitosamente')
    isDeleteDialogOpen.value = false
    accommodationToDelete.value = null
  } catch (error: unknown) {
    toast.error('Error al eliminar alojamiento', {
      description: getErrorMessage(error)
    })
  } finally {
    isDeleting.value = false
  }
}

const handleCardClick = (accommodation: Accommodation) => {
  router.push({
    name: 'AccommodationDetail',
    params: { id: accommodation.id }
  })
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <header class="bg-white border-b sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              @click="router.push({ name: 'Home' })"
            >
              <HomeIcon class="h-5 w-5" />
            </Button>
            <div class="flex items-center gap-3">
              <Building2 class="h-6 w-6 text-primary" />
              <h1 class="text-xl font-bold">Alojamientos</h1>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-sm text-muted-foreground">
              {{ authStore.userDisplayName }}
            </div>
            <AccommodationFormDialog @success="handleAccommodationCreated" />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <!-- Stats -->
      <div class="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Total</CardDescription>
            <CardTitle class="text-3xl">{{ accommodationsStore.totalCount }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Activos</CardDescription>
            <CardTitle class="text-3xl text-green-600">{{ accommodationsStore.activeCount }}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="pb-3">
            <CardDescription>Inactivos</CardDescription>
            <CardTitle class="text-3xl text-slate-400">{{ accommodationsStore.inactiveCount }}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <!-- Loading State -->
      <div v-if="accommodationsStore.isLoading" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="i in 6" :key="i">
          <CardHeader>
            <Skeleton class="h-4 w-24 mb-2" />
            <Skeleton class="h-6 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton class="h-4 w-full" />
          </CardContent>
        </Card>
      </div>

      <!-- Accommodations Grid -->
      <div
        v-else-if="accommodationsStore.accommodations.length > 0"
        class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        <AccommodationCard
          v-for="accommodation in accommodationsStore.accommodations"
          :key="accommodation.id"
          :accommodation="accommodation"
          @click="handleCardClick"
          @delete="handleDeleteClick"
          @edit="handleEditAccommodation"
        />
      </div>

      <!-- Empty State -->
      <Card v-else>
        <CardContent class="flex flex-col items-center justify-center py-12">
          <Building2 class="h-12 w-12 text-muted-foreground mb-4" />
          <p class="text-lg font-medium mb-2">No hay alojamientos registrados</p>
          <p class="text-muted-foreground mb-4">
            Crea tu primer alojamiento para comenzar
          </p>
          <AccommodationFormDialog @success="handleAccommodationCreated" />
        </CardContent>
      </Card>
    </main>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="isDeleteDialogOpen" @update:open="isDeleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará permanentemente el alojamiento
            <span v-if="accommodationToDelete" class="font-semibold">
              "{{ accommodationToDelete.name }}"
            </span>.
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="isDeleting">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            :disabled="isDeleting"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            @click="confirmDelete"
          >
            {{ isDeleting ? 'Eliminando...' : 'Eliminar' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
