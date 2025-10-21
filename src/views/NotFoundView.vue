<!-- src/views/NotFoundView.vue -->
<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Home } from 'lucide-vue-next'

const router = useRouter()

const goHome = () => {
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="text-center">
        <CardTitle class="text-6xl font-bold text-gray-300">404</CardTitle>
        <CardDescription class="text-lg mt-2">
          Página no encontrada
        </CardDescription>
      </CardHeader>
      <CardContent class="text-center space-y-4">
        <p class="text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
        <Button class="w-full" @click="goHome">
          <Home class="mr-2 h-4 w-4" />
          Volver al inicio
        </Button>
      </CardContent>
    </Card>
  </div>
</template>
