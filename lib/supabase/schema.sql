-- Supabase SQL Editor에서 실행하세요.
-- lib/supabase/schema.sql

CREATE TABLE IF NOT EXISTS public.trips (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  destination   TEXT NOT NULL DEFAULT '미정',
  country       TEXT NOT NULL DEFAULT '',
  start_date    DATE NOT NULL,
  end_date      DATE NOT NULL,
  cover_color   TEXT NOT NULL DEFAULT 'var(--chart-1)',
  budget_krw    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT trips_date_range CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_trips_created_at ON public.trips (created_at DESC);

CREATE TABLE IF NOT EXISTS public.days (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  label       TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (trip_id, date)
);

CREATE INDEX IF NOT EXISTS idx_days_trip_id ON public.days (trip_id);
CREATE INDEX IF NOT EXISTS idx_days_trip_sort ON public.days (trip_id, sort_order);

CREATE TABLE IF NOT EXISTS public.spots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id           UUID NOT NULL REFERENCES public.days(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  stay_minutes     INTEGER NOT NULL DEFAULT 0,
  travel_minutes   INTEGER NOT NULL DEFAULT 0,
  arrival          TEXT NOT NULL DEFAULT '09:00',
  hours            TEXT,
  rating           NUMERIC(2,1),
  address          TEXT,
  memo             TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT spots_category_check CHECK (
    category IN ('관광지', '맛집', '카페', '숙소', '교통', '쇼핑')
  ),
  CONSTRAINT spots_rating_check CHECK (
    rating IS NULL OR (rating >= 0 AND rating <= 5)
  )
);

CREATE INDEX IF NOT EXISTS idx_spots_day_id ON public.spots (day_id);
CREATE INDEX IF NOT EXISTS idx_spots_day_sort ON public.spots (day_id, sort_order);

CREATE TABLE IF NOT EXISTS public.expenses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id     UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  category    TEXT NOT NULL,
  title       TEXT NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL,
  amount_krw  INTEGER NOT NULL,
  memo        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT expenses_category_check CHECK (
    category IN ('숙박', '식비', '교통', '관광', '쇼핑', '기타')
  ),
  CONSTRAINT expenses_currency_check CHECK (
    currency IN ('JPY', 'USD', 'EUR', 'KRW', 'THB', 'VND')
  ),
  CONSTRAINT expenses_amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses (trip_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_date ON public.expenses (trip_id, date);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trips_set_updated_at ON public.trips;
CREATE TRIGGER trips_set_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.trips    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.days     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_trips" ON public.trips FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_trips" ON public.trips FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_trips" ON public.trips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_trips" ON public.trips FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_select_days" ON public.days FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_days" ON public.days FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_days" ON public.days FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_days" ON public.days FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_select_spots" ON public.spots FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_spots" ON public.spots FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_spots" ON public.spots FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_spots" ON public.spots FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "public_select_expenses" ON public.expenses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_insert_expenses" ON public.expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_update_expenses" ON public.expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "public_delete_expenses" ON public.expenses FOR DELETE TO anon, authenticated USING (true);
