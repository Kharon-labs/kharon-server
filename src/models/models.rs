use chrono::prelude::*;
use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use sqlx::prelude::FromRow;
use sqlx::Type;

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize, Clone, FromRow)]
pub struct User {
    pub id: uuid::Uuid,
    pub email: String,
    pub phone: Option<String>,
    pub last_logged_in: Option<DateTime<Utc>>,
    pub verified: bool,
    pub role: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct UserWallet {
    pub id: uuid::Uuid,
    pub user_id: uuid::Uuid, //foreign key ref
    pub wallet_address: Option<String>,
    pub network_used_last: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, FromRow)]
pub struct Transactions {
    pub tx_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub order_type: String,
    pub crypto_amount: Decimal,
    pub crypto_type: String,
    pub fiat_amount: Decimal,
    pub fiat_currency: String,
    pub payment_method: String,
    pub payment_status: String,
    pub tx_hash: String,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, FromRow)]
pub struct UserSecurityLogs {
    pub log_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub ip_address: String,
    pub city: String,
    pub country: String,
    pub failed_login_attempts: i64,
    pub flagged_for_review: bool,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, FromRow)]
pub struct Otp {
    pub otp_id: uuid::Uuid,
    pub otp: i32,
    pub user_id: uuid::Uuid,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "expiresAt")]
    pub expires_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, Type)]
#[sqlx(type_name = "role", rename_all = "lowercase")]
pub enum Role {
    Admin,
    User,
}

/*      JSONWEBTOKEN TOKEN DECODE PARAMS     */
#[derive(Debug, Serialize, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub iat: usize,
    pub exp: usize,
}

/*  MODEL SCHEMAS */
#[derive(Debug, Deserialize)]
pub struct CreateUserSchema {
    pub email: String,
    pub phone: Option<String>,
    pub role: Role,
}

#[derive(Debug, Deserialize)]
pub struct UserWalletSchema {
    pub user_id: uuid::Uuid,
    pub wallet_address: String,
    pub network: String,
}

#[derive(Debug, Deserialize)]
pub struct TransactionSchema {
    pub user_id: uuid::Uuid,
    pub order_type: String,
    pub crypto_amount: i64,
    pub crypto_type: String,
    pub fiat_amount: i64,
    pub fiat_currency: String,
    pub payment_method: String,
    pub payment_status: String,
    pub tx_hash: String,
}

#[derive(Debug, Deserialize)]
pub struct UserSecurityLogsSchema {
    pub user_id: uuid::Uuid,
    pub ip_address: String,
    pub city: String,
    pub country: String,
    pub failed_login_attempts: i64,
    pub flagged_for_review: bool,
}

#[derive(Debug, Deserialize)]
pub struct OtpSchema {
    pub user_id: uuid::Uuid,
    pub email: String
}

#[derive(Debug, Deserialize)]
pub struct ValidateOtpSchema {
    pub user_id: uuid::Uuid,
    pub otp: i32,
}

// /*  DISPLAY IMPLEMENTATION FOR ENUMS */
macro_rules! impl_display {
    ($($t:ty), *) => {
        $(
            impl std::fmt::Display for $t {
                fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
                    write!(f, "{:?}", self)
                }
            }
        )*
    };
}
impl_display!(Role);
