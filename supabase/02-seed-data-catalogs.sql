-- supabase/02-seed-data-catalogs.sql
-- ============================================================================
-- SEED DATA: Catálogos de Áreas y Elementos
-- Este catálogo es FIJO y compartido por todos los alojamientos
-- ============================================================================

-- ============================================================================
-- CATÁLOGO: Áreas
-- ============================================================================
INSERT INTO public.area_catalog (key, label, icon, display_order) VALUES
                                                                      ('kitchen', 'Cocina', 'Utensils', 1),
                                                                      ('bathroom', 'Baño', 'Bath', 2),
                                                                      ('bedroom', 'Dormitorio', 'Bed', 3),
                                                                      ('living_room', 'Sala de estar', 'Sofa', 4),
                                                                      ('dining_room', 'Comedor', 'UtensilsCrossed', 5),
                                                                      ('hallway', 'Pasillo', 'Rows', 6),
                                                                      ('entrance', 'Entrada', 'DoorOpen', 7),
                                                                      ('balcony', 'Balcón', 'Leaf', 8),
                                                                      ('terrace', 'Terraza', 'Trees', 9),
                                                                      ('garden', 'Jardín', 'Flower', 10),
                                                                      ('garage', 'Garaje', 'Car', 11),
                                                                      ('laundry', 'Lavandería', 'Shirt', 12),
                                                                      ('storage', 'Trastero', 'Archive', 13),
                                                                      ('windows', 'Ventanas', 'Square', 14),
                                                                      ('doors', 'Puertas', 'Door', 15),
                                                                      ('roof', 'Tejado', 'Warehouse', 16),
                                                                      ('facade', 'Fachada', 'Building', 17),
                                                                      ('stairs', 'Escaleras', 'Stairs', 18),
                                                                      ('elevator', 'Ascensor', 'MoveVertical', 19),
                                                                      ('pool', 'Piscina', 'Waves', 20),
                                                                      ('basement', 'Sótano', 'ArrowDown', 21),
                                                                      ('attic', 'Ático', 'ArrowUp', 22),
                                                                      ('other', 'Otro', 'MoreHorizontal', 99)
    ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- CATÁLOGO: Elementos por Área
-- ============================================================================

-- Cocina
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Fregadero', 'Grifos', 'Hornillas', 'Horno', 'Microondas',
                  'Nevera', 'Lavavajillas', 'Campana extractora', 'Encimera',
                  'Armarios', 'Cajones', 'Zócalo', 'Iluminación', 'Enchufes',
                  'Interruptores', 'Azulejos', 'Suelo'
                      ]), generate_series(1, 17)
FROM public.area_catalog WHERE key = 'kitchen';

-- Baño
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Inodoro', 'Lavabo', 'Ducha', 'Bañera', 'Grifería',
                  'Mampara', 'Espejo', 'Armario', 'Baldosas', 'Desagües',
                  'Ventilación', 'Toallero', 'Portarrollos', 'Jabonera',
                  'Iluminación', 'Enchufes', 'Calentador', 'Radiador'
                      ]), generate_series(1, 18)
FROM public.area_catalog WHERE key = 'bathroom';

-- Dormitorio (ACTUALIZADO - con elementos adicionales)
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Cama', 'Armario', 'Mesilla', 'Cuna', 'Escritorio', 'Silla de escritorio',
                  'Caja fuerte', 'Espejo', 'Ventanas', 'Persianas', 'Cortinas',
                  'Iluminación', 'Enchufes', 'Interruptores', 'Radiador',
                  'Suelo', 'Paredes', 'Techo', 'Puerta'
                      ]), generate_series(1, 19)
FROM public.area_catalog WHERE key = 'bedroom';

-- Sala de estar (ACTUALIZADO - con elementos adicionales)
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Sofá', 'Mesa', 'Sillas', 'Televisor', 'Estanterías',
                  'Consola de entretenimiento', 'Chimenea', 'Ventanas', 'Persianas',
                  'Cortinas', 'Iluminación', 'Enchufes', 'Radiador', 'Suelo',
                  'Paredes', 'Techo', 'Aire acondicionado'
                      ]), generate_series(1, 17)
FROM public.area_catalog WHERE key = 'living_room';

-- Comedor
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Mesa', 'Sillas', 'Aparador', 'Iluminación', 'Enchufes',
                  'Ventanas', 'Suelo', 'Paredes', 'Techo'
                      ]), generate_series(1, 9)
FROM public.area_catalog WHERE key = 'dining_room';

-- Ventanas
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Ventana', 'Marco', 'Cristal', 'Persiana', 'Cortina',
                  'Mosquitera', 'Cerradura', 'Manilla', 'Bisagras'
                      ]), generate_series(1, 9)
FROM public.area_catalog WHERE key = 'windows';

-- Puertas
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Puerta', 'Marco', 'Cerradura', 'Manilla', 'Bisagras',
                  'Mirilla', 'Pestillo', 'Aldaba'
                      ]), generate_series(1, 8)
FROM public.area_catalog WHERE key = 'doors';

-- Balcón, Terraza, Jardín (elementos similares)
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Suelo', 'Barandilla', 'Iluminación', 'Toldos', 'Mobiliario',
                  'Plantas', 'Sistema de riego', 'Desagües'
                      ]), generate_series(1, 8)
FROM public.area_catalog WHERE key IN ('balcony', 'terrace', 'garden');

-- Lavandería
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Lavadora', 'Secadora', 'Fregadero', 'Grifos', 'Armarios',
                  'Tendedero', 'Iluminación', 'Enchufes', 'Ventilación'
                      ]), generate_series(1, 9)
FROM public.area_catalog WHERE key = 'laundry';

-- Piscina
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Vaso', 'Sistema de filtrado', 'Bombas', 'Iluminación',
                  'Desagües', 'Revestimiento', 'Escalera', 'Depuradora'
                      ]), generate_series(1, 8)
FROM public.area_catalog WHERE key = 'pool';

-- Garaje
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Puerta automática', 'Motor', 'Iluminación', 'Suelo',
                  'Paredes', 'Ventilación', 'Tomas eléctricas'
                      ]), generate_series(1, 7)
FROM public.area_catalog WHERE key = 'garage';

-- Ascensor
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Cabina', 'Motor', 'Puertas', 'Botonera', 'Iluminación',
                  'Sistema de emergencia', 'Cables', 'Sensores'
                      ]), generate_series(1, 8)
FROM public.area_catalog WHERE key = 'elevator';

-- Tejado
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Tejas', 'Canalones', 'Bajantes', 'Impermeabilización',
                  'Chimenea', 'Antenas', 'Claraboyas'
                      ]), generate_series(1, 7)
FROM public.area_catalog WHERE key = 'roof';

-- Fachada
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Revestimiento', 'Pintura', 'Ventanas exteriores', 'Puertas exteriores',
                  'Balcones', 'Molduras', 'Iluminación exterior'
                      ]), generate_series(1, 7)
FROM public.area_catalog WHERE key = 'facade';

-- Escaleras
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Peldaños', 'Barandilla', 'Pasamanos', 'Iluminación',
                  'Revestimiento', 'Rellano'
                      ]), generate_series(1, 6)
FROM public.area_catalog WHERE key = 'stairs';

-- Genéricos para áreas restantes (pasillo, entrada, trastero, sótano, ático, otro)
INSERT INTO public.element_catalog (area_catalog_id, name, display_order)
SELECT id, unnest(ARRAY[
                      'Iluminación', 'Enchufes', 'Interruptores', 'Suelo',
                  'Paredes', 'Techo', 'Ventanas', 'Puertas'
                      ]), generate_series(1, 8)
FROM public.area_catalog
WHERE key IN ('hallway', 'entrance', 'storage', 'basement', 'attic', 'other');
