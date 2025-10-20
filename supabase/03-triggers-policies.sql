-- supabase/03-triggers-policies.sql
-- ============================================================================
-- TRIGGERS Y ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- ============================================================================
-- TRIGGERS: Auto-actualización de updated_at
-- ============================================================================

/**
 * Función reutilizable para actualizar automáticamente updated_at
 * Se ejecuta ANTES de cada UPDATE en las tablas configuradas
 */
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_updated_at() IS 'Actualiza automáticamente el campo updated_at en cada UPDATE';

-- Aplicar trigger a tablas relevantes
CREATE TRIGGER set_updated_at_users
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_accommodations
    BEFORE UPDATE ON public.accommodations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- TRIGGER: Auto-actualizar completed_at en tasks
-- ============================================================================

/**
 * Maneja automáticamente el campo completed_at cuando una tarea cambia de estado
 * - Establece completed_at cuando status cambia a 'completed'
 * - Limpia completed_at si el estado deja de ser 'completed'
 */
CREATE OR REPLACE FUNCTION public.handle_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el estado cambia a 'completed', establecer completed_at
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = NOW();
END IF;

  -- Si el estado cambia desde 'completed' a otro, limpiar completed_at
  IF NEW.status != 'completed' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_task_completion() IS 'Gestiona automáticamente el timestamp de completado de tareas';

CREATE TRIGGER set_task_completion_date
    BEFORE INSERT OR UPDATE OF status ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_task_completion();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS): Habilitación
-- ============================================================================

-- Habilitar RLS en todas las tablas del esquema público
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.area_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.element_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_photos ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS: users
-- ============================================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT
                 TO authenticated
                 USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE
                 TO authenticated
                 USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);

-- ============================================================================
-- POLÍTICAS RLS: Catálogos (SOLO LECTURA para usuarios autenticados)
-- ============================================================================

CREATE POLICY "area_catalog_select_authenticated" ON public.area_catalog
  FOR SELECT
                 TO authenticated
                 USING (true);

CREATE POLICY "element_catalog_select_authenticated" ON public.element_catalog
  FOR SELECT
                 TO authenticated
                 USING (true);

-- ============================================================================
-- POLÍTICAS RLS: accommodations
-- Todos los usuarios autenticados tienen acceso completo
-- (Supervisor y Chief tienen los mismos permisos por ahora)
-- ============================================================================

CREATE POLICY "accommodations_select_authenticated" ON public.accommodations
  FOR SELECT
                 TO authenticated
                 USING (true);

CREATE POLICY "accommodations_insert_authenticated" ON public.accommodations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "accommodations_update_authenticated" ON public.accommodations
  FOR UPDATE
                        TO authenticated
                        USING (true)
      WITH CHECK (true);

CREATE POLICY "accommodations_delete_authenticated" ON public.accommodations
  FOR DELETE
TO authenticated
  USING (true);

-- ============================================================================
-- POLÍTICAS RLS: tasks
-- ============================================================================

CREATE POLICY "tasks_select_authenticated" ON public.tasks
  FOR SELECT
                 TO authenticated
                 USING (true);

CREATE POLICY "tasks_insert_authenticated" ON public.tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_update_authenticated" ON public.tasks
  FOR UPDATE
                        TO authenticated
                        USING (true)
      WITH CHECK (true);

CREATE POLICY "tasks_delete_authenticated" ON public.tasks
  FOR DELETE
TO authenticated
  USING (true);

-- ============================================================================
-- POLÍTICAS RLS: costs y task_photos
-- ============================================================================

CREATE POLICY "costs_all_authenticated" ON public.costs
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "task_photos_all_authenticated" ON public.task_photos
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- FUNCIONES AUXILIARES: Estadísticas y búsquedas
-- ============================================================================

/**
 * Función para obtener estadísticas rápidas del dashboard
 * Optimizada para rendimiento con índices existentes
 */
CREATE OR REPLACE FUNCTION public.get_dashboard_stats(user_id_param UUID)
RETURNS TABLE (
  total_accommodations BIGINT,
  total_tasks BIGINT,
  pending_tasks BIGINT,
  in_progress_tasks BIGINT,
  completed_tasks BIGINT,
  high_priority_tasks BIGINT
) AS $$
BEGIN
RETURN QUERY
SELECT
    (SELECT COUNT(*) FROM public.accommodations WHERE status = 'active'),
    (SELECT COUNT(*) FROM public.tasks),
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'pending'),
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'in_progress'),
    (SELECT COUNT(*) FROM public.tasks WHERE status = 'completed'),
    (SELECT COUNT(*) FROM public.tasks WHERE status IN ('pending', 'in_progress') AND priority = 'high');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_dashboard_stats IS 'Obtiene estadísticas agregadas para el dashboard';
