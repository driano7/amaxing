-- amaxing - Premium Tourism Agency Database Schema
-- PostgreSQL/SQL for Supabase

-- Created: 2026-01-20
-- Purpose: Complete database schema with authentication, experiences, and booking system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table for authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  passport_number TEXT,
  phone TEXT,
  date_of_birth DATE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'guide')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT email_format_check CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT password_length_check CHECK (LENGTH(password_hash) >= 60)
);

-- Profiles table for additional user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT,
  dietary_restrictions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social auth tokens table (for OAuth providers)
CREATE TABLE social_auth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'facebook', 'apple', 'microsoft')),
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_provider_user UNIQUE (provider, provider_user_id)
);

-- API keys table for external integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login attempts tracking for security
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_result TEXT CHECK (attempt_result IN ('success', 'failed', 'locked_out')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiences table
CREATE TABLE experiences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL CHECK (price_usd > 0),
  max_guests INTEGER NOT NULL CHECK (max_guests > 0 AND max_guests <= 50),
  duration_hours INTEGER NOT NULL CHECK (duration_hours > 0 AND duration_hours <= 48),
  creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
  difficulty_level TEXT DEFAULT 'moderate' CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'expert')),
  minimum_age INTEGER DEFAULT 18 CHECK (minimum_age > 0 AND minimum_age <= 100),
  group_size_min INTEGER DEFAULT 2 CHECK (group_size_min > 0 AND group_size_min <= 50),
  rating_avg NUMERIC(3,2) DEFAULT 0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  rating_count INTEGER DEFAULT 0 CHECK (rating_count >= 0),
  total_bookings INTEGER DEFAULT 0,
  image_url TEXT,
  gallery_images TEXT[],
  video_url TEXT,
  highlights JSONB DEFAULT '[]',
  location TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  booking_lead_time_days INTEGER DEFAULT 7,
  cancellation_policy TEXT DEFAULT 'flexible',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT slug_check CHECK (slug !~ '^[0-9]+$'),
  CONSTRAINT age_check CHECK (minimum_age <= max_guests)
);

-- Booking system
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_reference TEXT UNIQUE NOT NULL,
  booking_date DATE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  guests INTEGER NOT NULL CHECK (guests > 0 AND guests <= 10),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'refunded')),
  total_amount NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  taxes_amount NUMERIC(10,2) DEFAULT 0,
  payed_amount NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'MXN', 'CAD')),
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  special_requests TEXT,
  dietary_restrictions TEXT[],
  accessibility_needs TEXT,
  agent_fee NUMERIC(10,2) DEFAULT 0,
  commission_rate NUMERIC(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_booking CHECK (
    end_date >= start_date AND
    booking_date <= start_date
  ),
  CONSTRAINT experience_capacity_check CHECK (
    EXISTS (
      SELECT 1 FROM experiences 
      WHERE id = experience_id AND max_guests >= guests
    )
  ),
  CONSTRAINT booking_reference_check CHECK (booking_reference ~ '^[A-Z0-9]{8}$')
);

-- Booking items (for multi-day experiences, add-ons, etc.)
CREATE TABLE booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('experience', 'addon', 'upgrade', 'tax', 'fee')),
  item_id UUID,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  item_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'cash', 'stripe', 'razorpay')),
  payment_provider TEXT,
  payment_token TEXT,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'partially_refunded')),
  gateway_response JSONB,
  processed_at TIMESTAMPTZ,
  refund_id TEXT,
  refund_amount NUMERIC(10,2),
  refund_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experience reviews and ratings
CREATE TABLE experience_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  pros TEXT[],
  cons TEXT[],
  would_recommend BOOLEAN NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  curator_response TEXT,
  response_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_review_per_booking UNIQUE (booking_id),
  CONSTRAINT user_can_only_review_once UNIQUE (experience_id, user_id)
);

-- User favorites/wishlist
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_favorite UNIQUE (user_id, experience_id)
);

-- Experience analytics and tracking
CREATE TABLE experience_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  experience_id UUID NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  conversion_rate NUMERIC(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_daily_analytics UNIQUE (experience_id, date)
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  refresh_token TEXT NOT NULL UNIQUE,
  user_agent TEXT,
  ip_address INET,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'webview')),
  os_name TEXT,
  browser_name TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_path TEXT NOT NULL,
  request_query JSONB,
  request_body JSONB,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create the users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  nationality TEXT,
  passport_number TEXT,
  phone TEXT,
  date_of_birth DATE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMPTZ,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer', 'guide')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT email_format_check CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  CONSTRAINT password_length_check CHECK (LENGTH(password_hash) >= 60)
);

-- Profiles table for additional user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT,
  dietary_restrictions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Password reset tokens table
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email verification tokens table
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social auth tokens table (for OAuth providers)
CREATE TABLE social_auth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'facebook', 'apple', 'microsoft')),
  provider_user_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  profile_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_provider_user UNIQUE (provider, provider_user_id)
);

-- API keys table for external integrations
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  permissions JSONB DEFAULT '[]',
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Login attempts tracking for security
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  attempt_result TEXT CHECK (attempt_result IN ('success', 'failed', 'locked_out')),
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Experiences table (already created above)
-- Booking system (already created above)
-- Booking items (already created above)
-- Payments table (already created above)
-- Experience reviews (already created above)
-- User favorites (already created above)
-- Experience analytics (already created above)
-- User sessions (already created above)
-- API usage log (already created above)

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
CREATE INDEX idx_password_reset_tokens_is_used ON password_reset_tokens(is_used);

CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);
CREATE INDEX idx_email_verification_tokens_is_used ON email_verification_tokens(is_used);

CREATE INDEX idx_social_auth_accounts_user_id ON social_auth_accounts(user_id);
CREATE INDEX idx_social_auth_accounts_provider ON social_auth_accounts(provider, provider_user_id);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX idx_login_attempts_created_at ON login_attempts(created_at DESC);

CREATE INDEX idx_experiences_slug ON experiences(slug);
CREATE INDEX idx_experiences_active ON experiences(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_experiences_featured ON experiences(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_experiences_created_at ON experiences(created_at DESC);
CREATE INDEX idx_experiences_rating ON experiences(rating_avg DESC);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_experience_id ON bookings(experience_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_date ON bookings(booking_date);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

CREATE INDEX idx_booking_items_booking_id ON booking_items(booking_id);

CREATE INDEX idx_payments_booking_id ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_experience_reviews_experience_id ON experience_reviews(experience_id);
CREATE INDEX idx_experience_reviews_user_id ON experience_reviews(user_id);
CREATE INDEX idx_experience_reviews_created_at ON experience_reviews(created_at DESC);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_experience_id ON user_favorites(experience_id);

CREATE INDEX idx_experience_analytics_experience_id ON experience_analytics(experience_id);
CREATE INDEX idx_experience_analytics_date ON experience_analytics(date);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active) WHERE is_active = TRUE;

CREATE INDEX idx_api_usage_log_api_key_id ON api_usage_log(api_key_id);
CREATE INDEX idx_api_usage_log_created_at ON api_usage_log(created_at DESC);

-- Triggers for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for tables that need updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_email_verification_tokens_updated_at
    BEFORE UPDATE ON email_verification_tokens
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_social_auth_accounts_updated_at
    BEFORE UPDATE ON social_auth_accounts
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_experiences_updated_at
    BEFORE UPDATE ON experiences
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_booking_items_updated_at
    BEFORE UPDATE ON booking_items
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_experience_reviews_updated_at
    BEFORE UPDATE ON experience_reviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_experience_analytics_updated_at
    BEFORE UPDATE ON experience_analytics
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER trigger_user_sessions_updated_at
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_auth_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;

-- Users Policies
-- Allow public read for profiles (if needed)
CREATE POLICY "profiles_public_read" ON profiles
    FOR SELECT
    USING (true);

-- Users can read/update their own profile
CREATE POLICY "users_own_profile" ON users
    FOR SELECT, UPDATE
    TO authenticated
    USING (id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "users_insert_own_profile" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- Admin can read all users
CREATE POLICY "users_admin_read" ON users
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Users can only update their own account (except role, which admin only)
CREATE POLICY "users_update_own_account" ON users
    FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (
        id = auth.uid() AND
        (role = OLD.role OR (
            EXISTS (
                SELECT 1 FROM users
                WHERE id = auth.uid() AND role = 'admin'
            )
        ))
    );

-- Profiles Policies
-- Users can read/update their own profile
CREATE POLICY "profiles_own_user" ON profiles
    FOR SELECT, INSERT, UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Password reset tokens policies
-- Only the user can use their own token
CREATE POLICY "password_reset_own_token" ON password_reset_tokens
    FOR SELECT, UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Only expired or used tokens can be deleted
CREATE POLICY "password_reset_delete_expired" ON password_reset_tokens
    FOR DELETE
    TO authenticated
    USING (is_used = TRUE OR expires_at < NOW());

-- Email verification tokens policies
-- Users can manage their own email verification tokens
CREATE POLICY "email_verification_own_token" ON email_verification_tokens
    FOR SELECT, UPDATE, INSERT
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Social auth accounts policies
-- Users can manage their social auth accounts
CREATE POLICY "social_auth_own_accounts" ON social_auth_accounts
    FOR SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- API keys policies
-- Users can manage their own API keys
CREATE POLICY "api_keys_own_keys" ON api_keys
    FOR SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Login attempts policies
-- Users can see their own login attempts
CREATE POLICY "login_attempts_own" ON login_attempts
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Only system/admin can insert login attempts
CREATE POLICY "login_attempts_system_insert" ON login_attempts
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Experiences policies
-- Active experiences are visible to everyone
CREATE POLICY "experiences_public_read" ON experiences
    FOR SELECT
    USING (is_active = TRUE);

-- Users can manage their own experiences (if they are creators)
CREATE POLICY "experiences_creator_manage" ON experiences
    FOR SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        creator_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Bookings policies
-- Users can manage their own bookings
CREATE POLICY "bookings_own_user" ON bookings
    FOR SELECT, INSERT, UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admin can read all bookings
CREATE POLICY "bookings_admin_read" ON bookings
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Experience reviews policies
-- Reviews are visible to everyone
CREATE POLICY "experience_reviews_public_read" ON experience_reviews
    FOR SELECT
    USING (true);

-- Users can manage their own reviews
CREATE POLICY "experience_reviews_own_user" ON experience_reviews
    FOR SELECT, INSERT, UPDATE, DELETE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- User favorites policies
-- Users can manage their own favorites
CREATE POLICY "user_favorites_own_user" ON user_favorites
    FOR SELECT, INSERT, DELETE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Experience analytics policies
-- Only authenticated users can read analytics (admin controls access)
CREATE POLICY "experience_analytics_read" ON experience_analytics
    FOR SELECT
    TO authenticated
    USING (true);

-- User sessions policies
-- Users can manage their own sessions
CREATE POLICY "user_sessions_own_user" ON user_sessions
    FOR SELECT, UPDATE, DELETE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- API usage log policies
-- Only system can log API usage
CREATE POLICY "api_usage_log_system_insert" ON api_usage_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Function to create user profile automatically after registration
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_user_profile
    AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Function to update booking reference automatically
CREATE OR REPLACE FUNCTION generate_booking_reference()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_reference = 'TRP-' || SUBSTRING(NEW.id::text, 1, 8) || '-' || EXTRACT(YEAR FROM NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_booking_reference
    BEFORE INSERT ON bookings
    FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

-- Function to check user authentication status
CREATE OR REPLACE FUNCTION is_authenticated_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to increment failed login attempts
CREATE OR REPLACE FUNCTION increment_failed_login_attempts(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET failed_login_attempts = failed_login_attempts + 1,
      account_locked_until = CASE
        WHEN failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
        ELSE account_locked_until
      END
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to reset failed login attempts
CREATE OR REPLACE FUNCTION reset_failed_login_attempts(user_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE users
  SET failed_login_attempts = 0,
      account_locked_until = NULL
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- Function to create activity log entry
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource TEXT DEFAULT NULL,
  p_resource_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO user_activity_logs (
    user_id, action, resource, resource_id, metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_resource, p_resource_id, p_metadata,
    current_setting('request.headers.x-forwarded-for'),
    current_setting('request.headers.user-agent')
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Table for user activity logging
CREATE TABLE user_activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON user_activity_logs(created_at DESC);

-- Insert sample data
INSERT INTO users (
  id, email, password_hash, first_name, last_name, phone, role,
  is_email_verified, is_active, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@amaxing.com',
  'argon2$id$v=19$m=65536,t=3,p=4$ZnRlVUY1d2R6UFh6Z0NLdA$k2Z6zGx8eH5dQlN9tFfR2bE3vK8mP1y2Z',
  'Admin',
  'User',
  '+525512291607',
  'admin',
  true,
  true,
  NOW(),
  NOW()
);

INSERT INTO users (
  id, email, password_hash, first_name, last_name, phone, role,
  is_email_verified, is_active, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000002',
  'demo@amaxing.com',
  'argon2$id$v=19$m=65536,t=3,p=4$ZnRlVUY1d2R6UFh6Z0NLdA$k2Z6zGx8eH5dQlN9tFfR2bE3vK8mP1y2Z',
  'Demo',
  'Customer',
  '+525512291607',
  'customer',
  true,
  true,
  NOW(),
  NOW()
);

INSERT INTO experiences (
  id, title, slug, description_en, description_es, price_usd, max_guests, duration_hours,
  creator_id, difficulty_level, minimum_age, group_size_min, rating_avg, rating_count,
  total_bookings, image_url, video_url, highlights, location, latitude, longitude,
  start_date, end_date, is_active, is_featured, booking_lead_time_days,
  cancellation_policy, created_at, updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Teotihuacan Sun Pyramid Experience',
  'teotihuacan-sun-pyramid',
  'Discover the ancient mystery of the Sun Pyramid with exclusive access beyond public hours. Your expert guide will reveal the secrets of this UNESCO World Heritage site, including access to restricted areas and advanced historical insights.',
  'Descubre el misterio antiguo de la Pirámide del Sol con acceso exclusivo fuera del horario público. Tu guía experto te revelará los secretos de este sitio Patrimonio de la Humanidad, incluyendo áreas restringidas y conocimientos históricos avanzados.',
  250.00,
  8,
  6,
  '00000000-0000-0000-0000-000000000001',
  'challenging',
  18,
  2,
  4.8,
  125,
  450,
  'https://images.unsplash.com/photo-1548013146-7246369b97b0',
  NULL,
  '[]',
  'Teotihuacan, Mexico City',
  19.6842,
  -99.0989,
  NULL,
  NULL,
  true,
  true,
  7,
  'flexible',
  NOW(),
  NOW()
),
(
  '22222222-2222-2222-2222-222222222222',
  'Chichen Itza Venus Temple Tour',
  'chichen-itza-venus-temple',
  'Witness the astronomical precision of the Venus Temple and understand the Mayan calendar system. This intimate experience offers unprecedented views of this ancient wonder with expert Mayan historians.',
  'Presencia la precisión astronómica del Templo de Venus y comprende el calendario maya. Esta experiencia íntima ofrece vistas sin precedentes de esta antigua maravilla con historiadores mayas expertos.',
  320.00,
  6,
  8,
  '00000000-0000-0000-0000-000000000001',
  'moderate',
  16,
  2,
  4.9,
  89,
  285,
  'https://images.unsplash.com/photo-1551632836-0f3a722d2dbb',
  'https://example.com/chichen-video.mp4',
  '[]',
  'Chichen Itza, Yucatán',
  20.6832,
  -88.5687,
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '14 days',
  true,
  true,
  7,
  'flexible',
  NOW(),
  NOW()
),
(
  '33333333-3333-3333-3333-333333333333',
  'Valley of the Volcanoes Private Expedition',
  'valley-of-the-volcanoes',
  'Trek through sacred volcanic landscapes with local Huichol guides. Experience ancient rituals and discover hidden waterfalls in this exclusive natural paradise, complete with cultural immersion.',
  'Trek through paisajes volcánicos sagrados con guías Huichol locales. Experimenta rituales antiguos y descubre cascadas ocultas en este paraíso natural exclusivo, con inmersión cultural.',
  450.00,
  4,
  12,
  '00000000-0000-0000-0000-000000000001',
  'challenging',
  18,
  2,
  4.7,
  67,
  201,
  'https://images.unsplash.com/photo-1508570052400-4715ca23347c',
  NULL,
  '[]',
  'Sierra de Puebla',
  19.0214,
  -97.5321,
  CURRENT_DATE + INTERVAL '3 days',
  CURRENT_DATE + INTERVAL '10 days',
  true,
  true,
  7,
  'flexible',
  NOW(),
  NOW()
);

-- Create profiles for the sample users
INSERT INTO profiles (id, user_id, bio, emergency_contact_name, emergency_contact_phone)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000001',
  'Administrator with 10+ years of experience in luxury travel and tour management.',
  'John Doe Admin',
  '+525512291607'
),
(
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000002',
  'Travel enthusiast with previous experience in European tour guiding.',
  'Jane Smith Customer',
  '+525512291607'
);

-- Insert sample reviews
INSERT INTO experience_reviews (
  id, experience_id, user_id, rating, title, content, pros, cons,
  would_recommend, is_verified, created_at, updated_at
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000002',
  5,
  'Absolutely Amazing!',
  'The exclusive access to the Sun Pyramid was incredible. The guide was knowledgeable and the experience was premium throughout. Highly recommended!',
  '{Expert guide, Exclusive access, Great value}',
  '{}',
  true,
  true,
  NOW(),
  NOW()
),
(
  '77777777-7777-7777-7777-777777777777',
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000002',
  5,
  'Unforgettable Mayan Experience',
  'Understanding the Mayan calendar system was fascinating. The intimate setting and expert knowledge made this one of the best tours ever.',
  '{Knowledgeable guide, Intimate setting, Historical insights}',
  '{}',
  true,
  true,
  NOW(),
  NOW()
);

-- Create initial experience analytics
INSERT INTO experience_analytics (
  id, experience_id, date, views_count, bookings_count, revenue,
  conversion_rate, created_at, updated_at
) VALUES (
  '88888888-8888-8888-8888-888888888888',
  '11111111-1111-1111-1111-111111111111',
  CURRENT_DATE,
  150,
  8,
  2000.00,
  0.0533,
  NOW(),
  NOW()
),
(
  '99999999-9999-9999-9999-999999999999',
  '22222222-2222-2222-2222-222222222222',
  CURRENT_DATE,
  120,
  5,
  1600.00,
  0.0417,
  NOW(),
  NOW()
);

-- Create initial bookings
INSERT INTO bookings (
  id, experience_id, user_id, booking_reference, booking_date,
  start_date, end_date, guests, status, payment_status,
  total_amount, discount_amount, taxes_amount, payed_amount,
  currency, created_at, updated_at
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000002',
  'TRP-a1b2c3d4-2026',
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '15 days',
  2,
  'confirmed',
  'paid',
  500.00,
  0.00,
  40.00,
  540.00,
  'USD',
  NOW(),
  NOW()
);

-- Create payments for the booking
INSERT INTO payments (
  id, booking_id, payment_method, payment_provider,
  amount, currency, status, processed_at,
  created_at, updated_at
) VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'stripe',
  'Stripe',
  540.00,
  'USD',
  'completed',
  NOW(),
  NOW(),
  NOW()
);

-- Create user favorites
INSERT INTO user_favorites (
  id, user_id, experience_id, created_at
) VALUES (
  'cccccccc-cccc-cccc-ccff-cccccccccccc',
  '00000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  NOW()
);

-- Create session for admin user
INSERT INTO user_sessions (
  id, user_id, session_token, refresh_token,
  user_agent, ip_address, device_type, os_name,
  browser_name, is_active, last_activity_at, expires_at
) VALUES (
  'dddddddd-dddd-dddd-dddd-dddddddddd',
  '00000000-0000-0000-0000-000000000001',
  'session_token_admin_123',
  'refresh_token_admin_456',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  '192.168.1.100',
  'desktop',
  'Windows',
  'Chrome',
  true,
  NOW(),
  NOW() + INTERVAL '7 days'
);

-- Create session for customer user
INSERT INTO user_sessions (
  id, user_id, session_token, refresh_token,
  user_agent, ip_address, device_type, os_name,
  browser_name, is_active, last_activity_at, expires_at
) VALUES (
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  '00000000-0000-0000-0000-000000000002',
  'session_token_user_123',
  'refresh_token_user_456',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  '192.168.1.101',
  'mobile',
  'iOS',
  'Safari',
  true,
  NOW(),
  NOW() + INTERVAL '7 days'
);

-- Create password reset tokens
INSERT INTO password_reset_tokens (
  id, user_id, token_hash, expires_at, is_used, created_at
) VALUES (
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  '00000000-0000-0000-0000-000000000002',
  'hash_for_reset_token_123',
  NOW() + INTERVAL '1 hour',
  false,
  NOW()
);

-- Create email verification tokens
INSERT INTO email_verification_tokens (
  id, user_id, token_hash, expires_at, is_used, created_at
) VALUES (
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  '00000000-0000-0000-0000-000000000002',
  'hash_for_email_verification_123',
  NOW() + INTERVAL '24 hours',
  false,
  NOW()
);

-- Create API key for customer
INSERT INTO api_keys (
  id, user_id, name, key_prefix, key_hash,
  permissions, expires_at, is_active, last_used_at
) VALUES (
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  '00000000-0000-0000-0000-000000000002',
  'Mobile API Key',
  'akey_prefix_123',
  'hash_for_api_key_456',
  '["read_bookings", "create_bookings", "update_bookings"]',
  NOW() + INTERVAL '30 days',
  true,
  NOW(),
  NOW()
);

-- Create login attempts (mixed records)
INSERT INTO login_attempts (
  id, user_id, ip_address, user_agent, attempt_result, failure_reason, created_at
) VALUES (
  'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii',
  '00000000-0000-0000-0000-000000000002',
  '192.168.1.101',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  'failed',
  'Invalid password',
  NOW()
),
(
  'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj',
  '00000000-0000-0000-0000-000000000002',
  '192.168.1.101',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
  'success',
  NULL,
  NOW() - INTERVAL '1 hour'
);

-- Views
COMMENT ON TABLE users IS 'System users table containing authentication and user profile data';
COMMENT ON TABLE experiences IS 'Master catalog of available tour experiences';
COMMENT ON TABLE bookings IS 'Customer booking reservations and management';
COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON TABLE experience_reviews IS 'Customer reviews and ratings for experiences';

-- Sample data comments
COMMENT ON TABLE users IS 'Contains system users including admin and demo customer for testing';
COMMENT ON TABLE experiences IS 'Two premium experiences: Teotihuacan pyramid tour (250/8 guests) and Chichen Itza Venus temple tour (320/6 guests)';
COMMENT ON TABLE bookings IS 'Sample booking for Teotihuacan experience with confirmed status';

-- Function documentation
COMMENT ON FUNCTION handle_updated_at() IS 'Generic function to automatically update updated_at timestamp';
COMMENT ON FUNCTION create_user_profile() IS 'Trigger function to create user profile automatically when new user is registered';
COMMENT ON FUNCTION generate_booking_reference() IS 'Trigger function to generate unique booking reference';