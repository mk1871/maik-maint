-- supabase/01-schema-v2-simplified.sql
-- ============================================================================
-- SISTEMA DE GESTIÓN DE MANTENIMIENTO DE ALOJAMIENTOS
-- Schema Principal - Arquitectura Catalog-Based
-- ============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para búsquedas de texto

-- ============================================================================
-- TABLA: users (Extensión de auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
                                            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('supervisor', 'chief')) DEFAULT 'supervisor',
    full_name TEXT NOT NULL,
    profile_picture_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- Comentarios descriptivos para documentación
COMMENT ON TABLE public.users IS 'Perfiles de usuario extendidos desde auth.users';
COMMENT ON COLUMN public.users.role IS 'Rol del usuario: supervisor o chief (mismo nivel de permisos por ahora)';

-- Índices para optimización de consultas
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON public.users USING gin(full_name gin_trgm_ops);

-- ============================================================================
-- CATÁLOGOS: Áreas y Elementos (FIJOS - NO CAMBIAN POR ALOJAMIENTO)
-- Principio arquitectónico: Referencias directas desde tasks
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.area_catalog (
                                                   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    icon TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

COMMENT ON TABLE public.area_catalog IS 'Catálogo fijo de áreas de alojamientos (cocina, baño, etc.)';
COMMENT ON COLUMN public.area_catalog.key IS 'Identificador único en inglés (kitchen, bathroom, etc.)';
COMMENT ON COLUMN public.area_catalog.label IS 'Etiqueta visible en español';

-- Índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_area_catalog_key ON public.area_catalog(key);
CREATE INDEX IF NOT EXISTS idx_area_catalog_order ON public.area_catalog(display_order);

CREATE TABLE IF NOT EXISTS public.element_catalog (
                                                      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area_catalog_id UUID NOT NULL REFERENCES public.area_catalog(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

COMMENT ON TABLE public.element_catalog IS 'Catálogo de elementos específicos dentro de cada área';
COMMENT ON COLUMN public.element_catalog.name IS 'Nombre del elemento (Fregadero, Inodoro, etc.)';

-- Índices para joins y ordenamiento
CREATE INDEX IF NOT EXISTS idx_element_catalog_area ON public.element_catalog(area_catalog_id);
CREATE INDEX IF NOT EXISTS idx_element_catalog_order ON public.element_catalog(display_order);
CREATE INDEX IF NOT EXISTS idx_element_catalog_name ON public.element_catalog USING gin(name gin_trgm_ops);

-- ============================================================================
-- TABLA: accommodations (Alojamientos)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.accommodations (
                                                     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(4) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

COMMENT ON TABLE public.accommodations IS 'Propiedades/alojamientos que se alquilan (apartamentos, casas)';
COMMENT ON COLUMN public.accommodations.code IS 'Código único de 4 caracteres (GB14, AP22, etc.)';
COMMENT ON COLUMN public.accommodations.status IS 'Estado del alojamiento: activo o inactivo';

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_accommodations_code ON public.accommodations(code);
CREATE INDEX IF NOT EXISTS idx_accommodations_status ON public.accommodations(status);
CREATE INDEX IF NOT EXISTS idx_accommodations_created_by ON public.accommodations(created_by);
CREATE INDEX IF NOT EXISTS idx_accommodations_name ON public.accommodations USING gin(name gin_trgm_ops);

-- ============================================================================
-- TABLA: tasks (Tareas de mantenimiento)
-- Arquitectura: Referencias DIRECTAS a catálogos (no instancias)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tasks (
                                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relaciones principales
    accommodation_id UUID NOT NULL REFERENCES public.accommodations(id) ON DELETE CASCADE,
    area_catalog_id UUID NOT NULL REFERENCES public.area_catalog(id) ON DELETE RESTRICT,
    element_catalog_id UUID REFERENCES public.element_catalog(id) ON DELETE RESTRICT,

    -- Información básica de la tarea
    description TEXT NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',

    -- Fechas y costos estimados
    due_date DATE,
    estimated_cost DECIMAL(10, 2) CHECK (estimated_cost >= 0),

    -- Información de reparación (cuando se completa)
    repairer_name TEXT,
    repair_cost DECIMAL(10, 2) CHECK (repair_cost >= 0),
    time_spent_days INTEGER CHECK (time_spent_days >= 0),
    completion_notes TEXT,

    -- Auditoría
    created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
    );

COMMENT ON TABLE public.tasks IS 'Tareas de mantenimiento de alojamientos';
COMMENT ON COLUMN public.tasks.area_catalog_id IS 'Referencia DIRECTA al catálogo de áreas';
COMMENT ON COLUMN public.tasks.element_catalog_id IS 'Referencia DIRECTA al catálogo de elementos (opcional)';
COMMENT ON COLUMN public.tasks.completed_at IS 'Timestamp automático cuando status = completed';

-- Índices para queries comunes y filtros
CREATE INDEX IF NOT EXISTS idx_tasks_accommodation ON public.tasks(accommodation_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_area ON public.tasks(area_catalog_id);
CREATE INDEX IF NOT EXISTS idx_tasks_element ON public.tasks(element_catalog_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date) WHERE status != 'completed';
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_description ON public.tasks USING gin(description gin_trgm_ops);

-- Índice compuesto para query de dashboard (tareas pendientes por alojamiento)
CREATE INDEX IF NOT EXISTS idx_tasks_dashboard ON public.tasks(accommodation_id, status, priority);

-- ============================================================================
-- TABLA: costs (Costos detallados - OPCIONAL)
-- Para registrar múltiples gastos asociados a una tarea
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.costs (
                                            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('materials', 'labor', 'tools', 'transport', 'other')),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    receipt_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

COMMENT ON TABLE public.costs IS 'Desglose detallado de costos por tarea (opcional)';
COMMENT ON COLUMN public.costs.category IS 'Categoría del gasto: materiales, mano de obra, herramientas, transporte, otro';

-- Índices
CREATE INDEX IF NOT EXISTS idx_costs_task ON public.costs(task_id);
CREATE INDEX IF NOT EXISTS idx_costs_category ON public.costs(category);

-- ============================================================================
-- TABLA: task_photos (Fotos de evidencia - OPCIONAL)
-- Para documentar visualmente el estado de las reparaciones
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.task_photos (
                                                  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('before', 'during', 'after')),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

COMMENT ON TABLE public.task_photos IS 'Fotos de evidencia del estado de tareas (antes/durante/después)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_photos_task ON public.task_photos(task_id);
CREATE INDEX IF NOT EXISTS idx_task_photos_category ON public.task_photos(category);
