<!-- src/components/accommodations/AccommodationCard.vue -->
<script lang="ts" setup>
import { computed } from 'vue'
import { MapPin, Calendar, MoreVertical, Edit, Trash } from 'lucide-vue-next'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { Accommodation } from '@/types/accommodation'

interface Props {
  accommodation: Accommodation
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: [accommodation: Accommodation]
  delete: [accommodation: Accommodation]
  click: [accommodation: Accommodation]
}>()

const statusVariant = computed(() =>
  props.accommodation.status === 'active' ? 'default' : 'secondary'
)

const statusLabel = computed(() =>
  props.accommodation.status === 'active' ? 'Activo' : 'Inactivo'
)

const formattedDate = computed(() => {
  try {
    return format(new Date(props.accommodation.created_at), 'dd MMM yyyy', { locale: es })
  } catch {
    return 'Fecha no disponible'
  }
})
</script>

<template>
  <Card class="hover:shadow-lg transition-shadow cursor-pointer">
    <CardHeader>
      <div class="flex items-start justify-between">
        <div class="flex-1" @click="emit('click', accommodation)">
          <div class="flex items-center gap-2 mb-1">
            <Badge class="font-mono" variant="outline">
              {{ accommodation.code }}
            </Badge>
            <Badge :variant="statusVariant">
              {{ statusLabel }}
            </Badge>
          </div>
          <CardTitle class="text-xl">{{ accommodation.name }}</CardTitle>
          <CardDescription v-if="accommodation.address" class="flex items-center gap-1 mt-2">
            <MapPin class="h-3 w-3" />
            {{ accommodation.address }}
          </CardDescription>
        </div>

        <!-- Actions Menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button class="h-8 w-8" size="icon" variant="ghost">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem class="cursor-pointer" @click="emit('edit', accommodation)">
              <Edit class="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              class="text-destructive cursor-pointer"
              @click="emit('delete', accommodation)"
            >
              <Trash class="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <CardContent @click="emit('click', accommodation)">
      <div v-if="accommodation.notes" class="text-sm text-muted-foreground mb-3">
        {{ accommodation.notes }}
      </div>

      <div class="flex items-center gap-1 text-xs text-muted-foreground">
        <Calendar class="h-3 w-3" />
        Creado {{ formattedDate }}
      </div>
    </CardContent>
  </Card>
</template>
