// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Importar vistas principales que se cargan frecuentemente
import LoginView from '@/views/LoginView.vue'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false, title: 'Iniciar Sesión' },
  },
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { requiresAuth: true, title: 'Dashboard' },
  },
  {
    path: '/accommodations',
    name: 'Accommodations',
    component: () => import('@/views/AccommodationsView.vue'),
    meta: { requiresAuth: true, title: 'Alojamientos' },
  },
  // {
  //   path: '/accommodations/:id',
  //   name: 'AccommodationDetail',
  //   component: () => import('@/views/AccommodationDetailView.vue'),
  //   meta: { requiresAuth: true, title: 'Detalle de Alojamiento' }
  // },
  // {
  //   path: '/tasks',
  //   name: 'Tasks',
  //   component: () => import('@/views/TasksView.vue'),
  //   meta: { requiresAuth: true, title: 'Tareas' }
  // },
  // {
  //   path: '/tasks/:id',
  //   name: 'TaskDetail',
  //   component: () => import('@/views/TaskDetailView.vue'),
  //   meta: { requiresAuth: true, title: 'Detalle de Tarea' }
  // },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundView,
    meta: { requiresAuth: false, title: 'Página No Encontrada' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

/**
 * Guard de autenticación global
 */
router.beforeEach(async (to, _from, next) => {
  // Declarar authStore DENTRO del beforeEach
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth !== false

  // Actualizar título de la página
  document.title = to.meta.title ? `${to.meta.title} | Maintenance App` : 'Maintenance App'

  // Si la ruta NO requiere autenticación
  if (!requiresAuth) {
    // Pero si está autenticado y va a login, redirigir a home
    if (to.name === 'Login' && authStore.isAuthenticated) {
      next({ name: 'Home' })
      return
    }
    next()
    return
  }

  // Si la ruta requiere autenticación
  // Verificar sesión solo si no se ha inicializado
  if (!authStore.isInitialized) {
    await authStore.checkAuth()
  }

  // Verificar si está autenticado
  if (!authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Todo correcto, permitir navegación
  next()
})

export default router
