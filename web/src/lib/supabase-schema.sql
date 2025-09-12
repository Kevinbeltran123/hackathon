-- Supabase schema for Rutas VIVAS with RLS policies
-- Run this in your Supabase SQL editor

-- Enable RLS
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create places table
CREATE TABLE IF NOT EXISTS places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('cultura', 'naturaleza', 'gastro', 'musica', 'deporte')),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  address TEXT,
  verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  submitted_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  place_id UUID REFERENCES places(id) ON DELETE CASCADE NOT NULL,
  note TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged', 'rejected')),
  points INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  discount INTEGER NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  agency TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  terms TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired')),
  code TEXT UNIQUE NOT NULL,
  max_redemptions INTEGER DEFAULT 100,
  redemptions INTEGER DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_coupons table (wallet)
CREATE TABLE IF NOT EXISTS user_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, coupon_id)
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target INTEGER NOT NULL,
  reward INTEGER NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_missions table
CREATE TABLE IF NOT EXISTS user_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mission_id UUID REFERENCES missions(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_missions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- RLS Policies for places
CREATE POLICY "Anyone can view verified places" ON places
  FOR SELECT USING (verified = TRUE);

CREATE POLICY "Users can view own submitted places" ON places
  FOR SELECT USING (auth.uid() = submitted_by);

CREATE POLICY "Admins can view all places" ON places
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Users can insert places" ON places
  FOR INSERT WITH CHECK (auth.uid() = submitted_by);

CREATE POLICY "Admins can update all places" ON places
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete places" ON places
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- RLS Policies for checkins
CREATE POLICY "Users can view own checkins" ON checkins
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkins" ON checkins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own checkins" ON checkins
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all checkins" ON checkins
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update all checkins" ON checkins
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete checkins" ON checkins
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- RLS Policies for coupons
CREATE POLICY "Anyone can view active coupons" ON coupons
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all coupons" ON coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can insert coupons" ON coupons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update coupons" ON coupons
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can delete coupons" ON coupons
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- RLS Policies for user_coupons
CREATE POLICY "Users can view own coupons" ON user_coupons
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coupons" ON user_coupons
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coupons" ON user_coupons
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user coupons" ON user_coupons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- RLS Policies for missions
CREATE POLICY "Anyone can view active missions" ON missions
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all missions" ON missions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

CREATE POLICY "Admins can manage missions" ON missions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- RLS Policies for user_missions
CREATE POLICY "Users can view own missions" ON user_missions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own missions" ON user_missions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own missions" ON user_missions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user missions" ON user_missions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() AND p.is_admin = TRUE
    )
  );

-- Create functions for role checking
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_places_verified ON places(verified);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_place_id ON checkins(place_id);
CREATE INDEX IF NOT EXISTS idx_checkins_status ON checkins(status);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON coupons(status);
CREATE INDEX IF NOT EXISTS idx_user_coupons_user_id ON user_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_user_missions_user_id ON user_missions(user_id);

-- Insert sample data
INSERT INTO profiles (id, email, full_name, role, is_admin) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@rutasvivas.com', 'Administrador', 'admin', TRUE),
  ('00000000-0000-0000-0000-000000000002', 'usuario@demo.com', 'Usuario Demo', 'user', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Insert sample places
INSERT INTO places (name, description, category, lat, lng, address, verified, status, submitted_by) VALUES
  ('Conservatorio del Tolima', 'Instituto de educación musical reconocido', 'cultura', 4.4399, -75.2050, 'Calle 10 #3-15, Centro', TRUE, 'verified', '00000000-0000-0000-0000-000000000001'),
  ('Jardín Botánico San Jorge', 'Jardín botánico con especies nativas', 'naturaleza', 4.4350, -75.2100, 'Carrera 5 #12-34, Belén', TRUE, 'verified', '00000000-0000-0000-0000-000000000001'),
  ('Restaurante La Pola', 'Cocina tradicional tolimense', 'gastro', 4.4420, -75.2000, 'Calle 15 #8-20, La Pola', TRUE, 'verified', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert sample missions
INSERT INTO missions (title, description, category, target, reward, difficulty, status) VALUES
  ('Explorador Cultural', 'Visita 5 lugares culturales en Ibagué', 'cultura', 5, 250, 'medium', 'active'),
  ('Gourmet Local', 'Prueba 3 restaurantes diferentes', 'gastro', 3, 150, 'easy', 'active'),
  ('Amante de la Naturaleza', 'Explora 4 lugares naturales', 'naturaleza', 4, 200, 'medium', 'active')
ON CONFLICT DO NOTHING;
