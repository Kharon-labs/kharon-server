-- Add up migration script here
-- Add up migration script here
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- DROP TYPE IF EXISTS role CASCADE;
-- DROP TYPE IF EXISTS order_type CASCADE;
-- DROP TYPE IF EXISTS crypto_type CASCADE;
-- DROP TYPE IF EXISTS payment_method CASCADE;
-- DROP TYPE IF EXISTS payment_status CASCADE;

-- CREATE TYPE role AS ENUM ('admin', 'user');
-- CREATE TYPE order_type AS ENUM ('buy', 'sell', 'swap');
-- CREATE TYPE crypto_type AS ENUM ('USDC', 'USDT');
-- CREATE TYPE payment_method AS ENUM ('bank_transfer', 'crypto', 'card');
-- CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed');

CREATE TABLE "users" (
    id UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) UNIQUE,
    last_logged_in TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    role VARCHAR(10) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "user_wallet" (
    id UUID NOT NULL PRIMARY KEY DEFAULT (uuid_generate_v4()),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_address VARCHAR(100) UNIQUE,
    network_used_last VARCHAR(50),
    -- wallet_balance DECIMAL(18,8) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "transactions" (
    tx_id UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_type VARCHAR(10) NOT NULL,
    crypto_amount DECIMAL(18,8) NOT NULL DEFAULT 0.0,
    crypto_type VARCHAR(10) NOT NULL,
    fiat_amount DECIMAL(18,8) NOT NULL DEFAULT 0.0,
    fiat_currency VARCHAR(20) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    tx_hash VARCHAR(250) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "user_security_logs" (
    log_id UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(50) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    flagged_for_review BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE "otp" (
    otp_id UUID PRIMARY KEY DEFAULT (uuid_generate_v4()),
    otp INT NOT NULL DEFAULT 0 CHECK (otp BETWEEN 100000 AND 999999), --ONLY 6 DIGITS
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes')
);


CREATE INDEX users_email_idx ON users (email);
CREATE INDEX users_phone_idx ON users (phone);
CREATE INDEX user_wallet_idx ON user_wallet(user_id);
CREATE INDEX user_tx_idx ON transactions(user_id);
CREATE INDEX tx_created_at_idx ON transactions(created_at);
CREATE INDEX user_security_logs_idx ON user_security_logs(user_id);
CREATE INDEX user_security_logs_flagged ON user_security_logs(flagged_for_review);
CREATE INDEX otp_user_idx ON otp(user_id);
CREATE INDEX otp_expires_at_idx ON otp(expires_at);