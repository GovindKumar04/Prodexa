    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_name VARCHAR(100) NOT NULL CHECK (length(trim(user_name)) >= 2),
        user_email VARCHAR(150) NOT NULL UNIQUE CHECK (position('@' in user_email) > 1),
        user_password TEXT NOT NULL,

        account_type VARCHAR(30) NOT NULL
            CHECK (account_type IN ('student', 'working_professional', 'other')),

        preferred_reminder_time TIME NOT NULL DEFAULT '08:00:00',
        email_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
        motivational_emails_enabled BOOLEAN NOT NULL DEFAULT true,

        profile_image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,

        refresh_token TEXT,
        
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_users_updated_at ON users;

    CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();