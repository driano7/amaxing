-- =====================================================================
--  amaxing - Esquema SQL para Supabase/PostgreSQL
--  Mega Menú (tour_categories) + Sistema de Reseñas (reviews)
--  Ejecuta en el esquema "public".
-- =====================================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ---------------------------------------------------------------------
-- Función helper para updatedAt (reutilizable)
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 1. TOUR CATEGORIES (para Mega Menú)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.tour_categories (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  slug TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_es TEXT NOT NULL,
  icon_name TEXT NOT NULL,          -- ej. 'Utensils', 'Skull', 'MapPin', 'Palette'
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tour_categories_slug_idx ON public.tour_categories (slug);
CREATE INDEX IF NOT EXISTS tour_categories_active_idx ON public.tour_categories ("isActive");

DROP TRIGGER IF EXISTS trg_tour_categories_touch_updated_at ON public.tour_categories;
CREATE TRIGGER trg_tour_categories_touch_updated_at
  BEFORE UPDATE ON public.tour_categories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Datos semilla para Mega Menú
INSERT INTO public.tour_categories (slug, name_en, name_es, icon_name, "displayOrder") VALUES
  ('gastronomy', 'Gastronomy', 'Gastronomía', 'Utensils', 1),
  ('history', 'History', 'Historia', 'Skull', 2),
  ('neighborhoods', 'Neighborhoods', 'Barrios', 'MapPin', 3),
  ('museums', 'Museums', 'Museos', 'Palette', 4)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_es = EXCLUDED.name_es,
  icon_name = EXCLUDED.icon_name,
  "displayOrder" = EXCLUDED."displayOrder";

-- =====================================================================
-- 2. EXPERIENCES (tabla existente - agregar category_id FK)
-- =====================================================================
-- Si la tabla no existe, créala con la estructura base
CREATE TABLE IF NOT EXISTS public.experiences (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title_en TEXT NOT NULL,
  title_es TEXT NOT NULL,
  description_en TEXT,
  description_es TEXT,
  price NUMERIC(10,2) NOT NULL,
  duration_hours INTEGER NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 8,
  image_url TEXT,
  location_en TEXT,
  location_es TEXT,
  highlights_en TEXT[],
  highlights_es TEXT[],
  "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Agregar category_id si no existe
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.tour_categories(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS experiences_category_id_idx ON public.experiences (category_id);
CREATE INDEX IF NOT EXISTS experiences_active_idx ON public.experiences ("isActive");

DROP TRIGGER IF EXISTS trg_experiences_touch_updated_at ON public.experiences;
CREATE TRIGGER trg_experiences_touch_updated_at
  BEFORE UPDATE ON public.experiences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================================
-- 3. REVIEWS (sistema de reseñas para tours)
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  experience_id TEXT NOT NULL REFERENCES public.experiences(id) ON DELETE CASCADE,
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL,           -- nombre visible (anonimizado si se desea)
  origin_country TEXT,                   -- código ISO país (ej. 'US', 'MX', 'ES')
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment_text TEXT NOT NULL,
  "isVerified" BOOLEAN NOT NULL DEFAULT FALSE,  -- compra verificada
  "isPublished" BOOLEAN NOT NULL DEFAULT TRUE,  -- moderación
  "helpfulVotes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reviews_experience_id_idx ON public.reviews (experience_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS reviews_published_idx ON public.reviews ("isPublished");
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews ("createdAt" DESC);

DROP TRIGGER IF EXISTS trg_reviews_touch_updated_at ON public.reviews;
CREATE TRIGGER trg_reviews_touch_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =====================================================================
-- 4. FUNCIÓN: get_experience_rating
--    Calcula promedio y cuenta de reseñas para un tour específico
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_experience_rating(p_experience_id TEXT)
RETURNS TABLE (
  experience_id TEXT,
  avg_rating NUMERIC(3,2),
  review_count BIGINT,
  rating_distribution JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.experience_id,
    ROUND(AVG(r.rating)::numeric, 2) AS avg_rating,
    COUNT(*) AS review_count,
    jsonb_build_object(
      '5', COUNT(*) FILTER (WHERE r.rating = 5),
      '4', COUNT(*) FILTER (WHERE r.rating = 4),
      '3', COUNT(*) FILTER (WHERE r.rating = 3),
      '2', COUNT(*) FILTER (WHERE r.rating = 2),
      '1', COUNT(*) FILTER (WHERE r.rating = 1)
    ) AS rating_distribution
  FROM public.reviews r
  WHERE r.experience_id = p_experience_id
    AND r."isPublished" = TRUE
  GROUP BY r.experience_id;
END;
$$ LANGUAGE plpgsql STABLE;

-- Comentario de documentación
COMMENT ON FUNCTION public.get_experience_rating(TEXT) IS
'Returns average rating, total review count, and rating distribution (1-5 stars) for a given experience. Only considers published reviews.';

-- =====================================================================
-- 5. TRIGGER: Auto-actualizar avg_rating y review_count en experiences (opcional)
--    Para evitar calcular en frontend, mantenemos campos denormalizados
-- =====================================================================
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS review_count INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.refresh_experience_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_experience_id TEXT;
BEGIN
  v_experience_id := COALESCE(NEW.experience_id, OLD.experience_id);

  UPDATE public.experiences e
  SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      WHERE r.experience_id = v_experience_id
        AND r."isPublished" = TRUE
    ), 0),
    review_count = COALESCE((
      SELECT COUNT(*)
      FROM public.reviews r
      WHERE r.experience_id = v_experience_id
        AND r."isPublished" = TRUE
    ), 0),
    "updatedAt" = NOW()
  WHERE e.id = v_experience_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reviews_refresh_rating_ins ON public.reviews;
CREATE TRIGGER trg_reviews_refresh_rating_ins
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_experience_rating();

DROP TRIGGER IF EXISTS trg_reviews_refresh_rating_upd ON public.reviews;
CREATE TRIGGER trg_reviews_refresh_rating_upd
  AFTER UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_experience_rating();

DROP TRIGGER IF EXISTS trg_reviews_refresh_rating_del ON public.reviews;
CREATE TRIGGER trg_reviews_refresh_rating_del
  AFTER DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.refresh_experience_rating();

-- =====================================================================
-- 6. VISTA: v_experience_with_rating (para queries simples)
-- =====================================================================
CREATE OR REPLACE VIEW public.v_experience_with_rating AS
SELECT
  e.*,
  tc.slug AS category_slug,
  tc.name_en AS category_name_en,
  tc.name_es AS category_name_es,
  tc.icon_name AS category_icon,
  COALESCE(r.avg_rating, 0) AS avg_rating,
  COALESCE(r.review_count, 0) AS review_count,
  r.rating_distribution
FROM public.experiences e
LEFT JOIN public.tour_categories tc ON tc.id = e.category_id
LEFT JOIN LATERAL public.get_experience_rating(e.id) r ON TRUE
WHERE e."isActive" = TRUE;

-- =====================================================================
-- 7. RLS (Row Level Security) - Políticas básicas
-- =====================================================================
ALTER TABLE public.tour_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- tour_categories: lectura pública, escritura solo admin
DROP POLICY IF EXISTS "tour_categories_public_read" ON public.tour_categories;
CREATE POLICY "tour_categories_public_read" ON public.tour_categories
  FOR SELECT USING ("isActive" = TRUE);

-- experiences: lectura pública
DROP POLICY IF EXISTS "experiences_public_read" ON public.experiences;
CREATE POLICY "experiences_public_read" ON public.experiences
  FOR SELECT USING ("isActive" = TRUE);

-- reviews: lectura pública (solo publicadas), inserción para usuarios autenticados
DROP POLICY IF EXISTS "reviews_public_read" ON public.reviews;
CREATE POLICY "reviews_public_read" ON public.reviews
  FOR SELECT USING ("isPublished" = TRUE);

DROP POLICY IF EXISTS "reviews_insert_own" ON public.reviews;
CREATE POLICY "reviews_insert_own" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid()::TEXT = user_id);

DROP POLICY IF EXISTS "reviews_update_own" ON public.reviews;
CREATE POLICY "reviews_update_own" ON public.reviews
  FOR UPDATE USING (auth.uid()::TEXT = user_id);

-- =====================================================================
-- Fin del script
-- =====================================================================