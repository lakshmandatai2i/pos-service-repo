-- ═══════════════════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE SCHEMA: SAFE NON-DESTRUCTIVE CREATION
-- ═══════════════════════════════════════════════════════════════════════════════

-- 1. CREATE SEQUENCE (IF NOT EXISTS)
CREATE SEQUENCE IF NOT EXISTS public.item_id_seq START WITH 1 INCREMENT BY 1;

-- 2. CREATE ITEMS TABLE (IF NOT EXISTS - DOES NOT DISTURB EXISTING TABLE)
CREATE TABLE IF NOT EXISTS public.items (
    id VARCHAR(10) PRIMARY KEY DEFAULT LPAD(nextval('public.item_id_seq')::text, 3, '0'),
    name VARCHAR(255) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category VARCHAR(100) NOT NULL
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_items_name ON public.items(name);
CREATE INDEX IF NOT EXISTS idx_items_category ON public.items(category);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on items') THEN
        CREATE POLICY "Allow public read access on items" ON public.items FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access for authenticated on items') THEN
        CREATE POLICY "Allow full access for authenticated on items" ON public.items FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- SAMPLE SEED DATA FOR ITEMS (PRESERVES EXISTING DATA)
INSERT INTO public.items (name, price, category) VALUES
    ('Butter Chicken', 600.00, 'Main Course'),
    ('Chicken Biryani', 550.00, 'Main Course'),
    ('Veg Biryani', 480.00, 'Main Course'),
    ('Paneer Tikka', 350.00, 'Starters'),
    ('Garlic Naan', 120.00, 'Breads'),
    ('Dal Makhani', 450.00, 'Main Course'),
    ('Sweet Lassi', 160.00, 'Beverages'),
    ('Mango Lassi', 180.00, 'Beverages'),
    ('Gulab Jamun', 150.00, 'Desserts')
ON CONFLICT DO NOTHING;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. ITEM QUANTITIES TABLE (SAFE CREATION: DATE, ITEM ID, ITEM NAME, PREPARED QTY, QTY LEFT)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.item_quantities (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_id VARCHAR(10) NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    prepared_quantity INT NOT NULL DEFAULT 0 CHECK (prepared_quantity >= 0),
    quantity_left INT NOT NULL DEFAULT 0 CHECK (quantity_left >= 0 AND quantity_left <= prepared_quantity),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_daily_item_qty UNIQUE (date, item_id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_item_quantities_date ON public.item_quantities(date);
CREATE INDEX IF NOT EXISTS idx_item_quantities_item_id ON public.item_quantities(item_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.item_quantities ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on item_quantities') THEN
        CREATE POLICY "Allow public read access on item_quantities" ON public.item_quantities FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full access for authenticated on item_quantities') THEN
        CREATE POLICY "Allow full access for authenticated on item_quantities" ON public.item_quantities FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- SAMPLE SEED DATA FOR TODAY (SAFE INSERT)
INSERT INTO public.item_quantities (date, item_id, item_name, prepared_quantity, quantity_left) VALUES
    (CURRENT_DATE, '001', 'Butter Chicken', 50, 18),
    (CURRENT_DATE, '002', 'Chicken Biryani', 60, 24),
    (CURRENT_DATE, '003', 'Veg Biryani', 40, 15),
    (CURRENT_DATE, '004', 'Paneer Tikka', 30, 8),
    (CURRENT_DATE, '005', 'Garlic Naan', 120, 45),
    (CURRENT_DATE, '006', 'Dal Makhani', 45, 20),
    (CURRENT_DATE, '007', 'Sweet Lassi', 50, 32),
    (CURRENT_DATE, '008', 'Mango Lassi', 50, 12),
    (CURRENT_DATE, '009', 'Gulab Jamun', 80, 50)
ON CONFLICT (date, item_id) DO NOTHING;


