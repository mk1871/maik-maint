<!-- src/components/accommodations/AccommodationFormDialog.vue -->
<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Plus, Loader2 } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useAccommodationsStore } from '@/stores/accommodations'
import {
  accommodationValidationSchema,
  type AccommodationFormValues
} from '@/schemas/accommodationSchema'
import type { Accommodation } from '@/types/accommodation'

interface Props {
  accommodation?: Accommodation | null
  mode?: 'create' | 'edit'
}

const props = withDefaults(defineProps<Props>(), {
  accommodation: null,
  mode: 'create'
})

const emit = defineEmits<{
  success: []
}>()

const accommodationsStore = useAccommodationsStore()

const isOpen = ref(false)
const isSubmitting = ref(false)

const isEditMode = computed(() => props.mode === 'edit')
const dialogTitle = computed(() => isEditMode.value ? 'Editar Alojamiento' : 'Crear Nuevo Alojamiento')

const { defineField, handleSubmit, errors, resetForm, setValues } = useForm<AccommodationFormValues>({
  validationSchema: accommodationValidationSchema,
  initialValues: {
    code: '',
    name: '',
    address: '',
    status: 'active',
    notes: '',
  },
})

// Usar defineField correctamente
const [code] = defineField('code')
const [name] = defineField('name')
const [address] = defineField('address')
const [status] = defineField('status')
const [notes] = defineField('notes')

// Cargar datos cuando se edita
watch(() => props.accommodation, (newAccommodation) => {
  if (newAccommodation && isEditMode.value) {
    setValues({
      code: newAccommodation.code,
      name: newAccommodation.name,
      address: newAccommodation.address || '',
      status: newAccommodation.status,
      notes: newAccommodation.notes || '',
    })
  }
}, { immediate: true })

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

    if (isEditMode.value && props.accommodation) {
      await accommodationsStore.updateAccommodation({
        id: props.accommodation.id,
        ...values
      })
      toast.success('Alojamiento actualizado exitosamente')
    } else {
      await accommodationsStore.createAccommodation(values)
      toast.success('Alojamiento creado exitosamente')
    }

    emit('success')
    resetForm()
    isOpen.value = false
  } catch (error: unknown) {
    toast.error(isEditMode.value ? 'Error al actualizar alojamiento' : 'Error al crear alojamiento', {
      description: getErrorMessage(error)
    })
  } finally {
    isSubmitting.value = false
  }
})

const handleOpenChange = (open: boolean) => {
  isOpen.value = open
  if (!open && !isEditMode.value) {
    resetForm()
  }
}
</script>

<template>
  <Dialog :open="isOpen" @update:open="handleOpenChange">
    <DialogTrigger v-if="!isEditMode" as-child>
      <Button>
        <Plus class="mr-2 h-4 w-4" />
        Nuevo Alojamiento
      </Button>
    </DialogTrigger>

    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          {{ isEditMode ? 'Modifica los datos del alojamiento' : 'Completa los datos básicos del alojamiento' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <!-- Código -->
        <div class="grid gap-2">
          <Label html-for="code">Código *</Label>
          <Input
            id="code"
            v-model="code"
            :disabled="isSubmitting"
            maxlength="4"
            placeholder="GB14"
          />
          <p v-if="errors.code" class="text-sm font-medium text-destructive">
            {{ errors.code }}
          </p>
        </div>

        <!-- Nombre -->
        <div class="grid gap-2">
          <Label html-for="name">Nombre *</Label>
          <Input
            id="name"
            v-model="name"
            :disabled="isSubmitting"
            placeholder="Gil Blas 14"
          />
          <p v-if="errors.name" class="text-sm font-medium text-destructive">
            {{ errors.name }}
          </p>
        </div>

        <!-- Dirección -->
        <div class="grid gap-2">
          <Label html-for="address">Dirección</Label>
          <Input
            id="address"
            v-model="address"
            :disabled="isSubmitting"
            placeholder="Calle Gil Blas 14, Madrid"
          />
        </div>

        <!-- Estado -->
        <div class="grid gap-2">
          <Label html-for="status">Estado</Label>
          <Select v-model="status" :disabled="isSubmitting">
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Notas -->
        <div class="grid gap-2">
          <Label html-for="notes">Notas</Label>
          <Textarea
            id="notes"
            v-model="notes"
            :disabled="isSubmitting"
            placeholder="Información adicional..."
            rows="3"
          />
          <p v-if="errors.notes" class="text-sm font-medium text-destructive">
            {{ errors.notes }}
          </p>
        </div>

        <DialogFooter>
          <Button :disabled="isSubmitting" type="button" variant="outline" @click="isOpen = false">
            Cancelar
          </Button>
          <Button :disabled="isSubmitting" type="submit">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            {{ isEditMode ? 'Actualizar' : 'Crear' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
