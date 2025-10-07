-- ========================================
-- COMPLETE AURASYNC DATABASE SCHEMA
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- FITNESS & NUTRITION MODULE
-- ========================================

CREATE TABLE fitness_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    daily_calorie_goal INTEGER,
    daily_protein_g INTEGER,
    daily_carbs_g INTEGER,
    daily_fat_g INTEGER,
    daily_water_glasses INTEGER DEFAULT 8,
    activity_level VARCHAR(20),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meals (
    meal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    meal_type VARCHAR(20) NOT NULL,
    meal_name VARCHAR(255),
    consumed_at TIMESTAMP NOT NULL,
    total_calories INTEGER,
    total_protein_g DECIMAL(6,2),
    total_carbs_g DECIMAL(6,2),
    total_fat_g DECIMAL(6,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meal_items (
    item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES meals(meal_id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    serving_size VARCHAR(100),
    serving_quantity DECIMAL(6,2) DEFAULT 1,
    calories INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    sugar_g DECIMAL(6,2),
    sodium_mg DECIMAL(7,2),
    food_database_id VARCHAR(255),
    barcode VARCHAR(50),
    is_custom BOOLEAN DEFAULT FALSE
);

CREATE TABLE custom_foods (
    food_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    serving_size VARCHAR(100),
    calories INTEGER NOT NULL,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    fiber_g DECIMAL(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    times_used INTEGER DEFAULT 0
);

CREATE TABLE recipes (
    recipe_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recipe_name VARCHAR(255) NOT NULL,
    servings INTEGER DEFAULT 1,
    instructions TEXT,
    prep_time_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_favorite BOOLEAN DEFAULT FALSE
);

CREATE TABLE recipe_ingredients (
    ingredient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(recipe_id) ON DELETE CASCADE,
    food_name VARCHAR(255) NOT NULL,
    quantity DECIMAL(8,2),
    unit VARCHAR(50),
    calories INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2)
);

CREATE TABLE workouts (
    workout_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    workout_name VARCHAR(255),
    workout_type VARCHAR(50),
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    duration_minutes INTEGER,
    total_calories_burned INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exercises (
    exercise_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(50),
    equipment VARCHAR(100),
    difficulty VARCHAR(20),
    instructions TEXT,
    video_url VARCHAR(500),
    animation_url VARCHAR(500),
    is_custom BOOLEAN DEFAULT FALSE,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE workout_exercises (
    workout_exercise_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID NOT NULL REFERENCES workouts(workout_id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercises(exercise_id),
    exercise_order INTEGER,
    sets INTEGER,
    reps INTEGER,
    weight_kg DECIMAL(6,2),
    duration_seconds INTEGER,
    distance_km DECIMAL(6,2),
    calories_burned INTEGER,
    notes TEXT
);

CREATE TABLE water_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    logged_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    glasses INTEGER DEFAULT 1,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- ========================================
-- HEALTH TIMELINE MODULE
-- ========================================

CREATE TABLE health_timeline (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entry_type VARCHAR(50) NOT NULL,
    entry_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE symptoms (
    symptom_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timeline_entry_id UUID NOT NULL REFERENCES health_timeline(entry_id) ON DELETE CASCADE,
    symptom_name VARCHAR(255) NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 10),
    body_part VARCHAR(100),
    notes TEXT,
    tags TEXT[]
);

CREATE TABLE moods (
    mood_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timeline_entry_id UUID NOT NULL REFERENCES health_timeline(entry_id) ON DELETE CASCADE,
    mood_rating INTEGER CHECK (mood_rating BETWEEN 1 AND 5),
    mood_descriptor VARCHAR(50),
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
    notes TEXT
);

CREATE TABLE medications (
    medication_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timeline_entry_id UUID NOT NULL REFERENCES health_timeline(entry_id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    taken_at TIMESTAMP NOT NULL,
    was_taken BOOLEAN DEFAULT TRUE,
    notes TEXT
);

CREATE TABLE supplements (
    supplement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timeline_entry_id UUID NOT NULL REFERENCES health_timeline(entry_id) ON DELETE CASCADE,
    supplement_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    taken_at TIMESTAMP NOT NULL,
    was_taken BOOLEAN DEFAULT TRUE
);

-- ========================================
-- HABITS MODULE
-- ========================================

CREATE TABLE habits (
    habit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    habit_name VARCHAR(255) NOT NULL,
    description TEXT,
    frequency VARCHAR(20) DEFAULT 'daily',
    target_days_per_week INTEGER DEFAULT 7,
    is_active BOOLEAN DEFAULT TRUE,
    color_hex VARCHAR(7) DEFAULT '#005B6A',
    icon_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_position INTEGER DEFAULT 0
);

CREATE TABLE habit_completions (
    completion_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(habit_id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    UNIQUE(habit_id, completion_date)
);

CREATE TABLE habit_streaks (
    streak_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(habit_id) ON DELETE CASCADE,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_completion_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_achievements (
    achievement_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    achievement_type VARCHAR(50) NOT NULL,
    achievement_name VARCHAR(255) NOT NULL,
    achievement_description TEXT,
    icon_url VARCHAR(500),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_viewed BOOLEAN DEFAULT FALSE
);

CREATE TABLE grove_customizations (
    customization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plant_type VARCHAR(100) DEFAULT 'seedling',
    plant_health INTEGER DEFAULT 50 CHECK (plant_health BETWEEN 0 AND 100),
    environment_theme VARCHAR(100) DEFAULT 'forest',
    unlocked_items TEXT[],
    active_items TEXT[],
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- JOURNAL MODULE
-- ========================================

CREATE TABLE journal_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    entry_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    encrypted_content TEXT NOT NULL,
    encryption_key_id VARCHAR(255) NOT NULL,
    prompt_used VARCHAR(255),
    word_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE journal_security (
    security_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    auth_method VARCHAR(20) NOT NULL,
    pin_hash VARCHAR(255),
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CYCLE TRACKING MODULE
-- ========================================

CREATE TABLE cycle_periods (
    period_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length_days INTEGER,
    is_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cycle_daily_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    flow_level VARCHAR(20),
    symptoms TEXT[],
    mood VARCHAR(50),
    sexual_activity BOOLEAN DEFAULT FALSE,
    notes TEXT,
    UNIQUE(user_id, log_date)
);

CREATE TABLE ovulation_tests (
    test_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    result VARCHAR(20),
    notes TEXT
);

CREATE TABLE cycle_predictions (
    prediction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    predicted_period_start DATE NOT NULL,
    predicted_period_end DATE,
    predicted_ovulation_start DATE,
    predicted_ovulation_end DATE,
    confidence_score DECIMAL(3,2),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- AI CHAT MODULE
-- ========================================

CREATE TABLE ai_conversations (
    conversation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    conversation_type VARCHAR(50) DEFAULT 'check_in',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE ai_messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(conversation_id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL,
    message_text TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'text',
    metadata JSONB,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- NOTIFICATIONS & SYSTEM
-- ========================================

CREATE TABLE notification_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_token VARCHAR(500) NOT NULL,
    device_type VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    stripe_subscription_id VARCHAR(255),
    current_period_start DATE,
    current_period_end DATE,
    trial_end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ========================================

CREATE INDEX idx_meals_user_date ON meals(user_id, consumed_at DESC);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, started_at DESC);
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, log_date DESC);
CREATE INDEX idx_health_timeline_user_date ON health_timeline(user_id, entry_date DESC);
CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
CREATE INDEX idx_habit_completions_habit_date ON habit_completions(habit_id, completion_date DESC);
CREATE INDEX idx_journal_entries_user_date ON journal_entries(user_id, entry_date DESC);
CREATE INDEX idx_cycle_periods_user_date ON cycle_periods(user_id, start_date DESC);
CREATE INDEX idx_cycle_daily_logs_user_date ON cycle_daily_logs(user_id, log_date DESC);
CREATE INDEX idx_ai_messages_conversation ON ai_messages(conversation_id, sent_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read, sent_at DESC);
