use chrono::prelude::*;
use rust_decimal::Decimal;
use serde::Serialize;

#[allow(non_snake_case)]
#[derive(Debug, Serialize)]
pub struct FilteredUser {
    pub id: String,
    pub email: String,
    pub phone: Option<String>,
    pub last_logged_in: DateTime<Utc>,
    pub verified: bool,
    pub role: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserData {
    pub user: FilteredUser,
}

#[derive(Debug, Serialize)]
pub struct FilteredWallet {
    pub id: String,
    pub user_id: String,
    pub wallet_address: String,
    pub network_used_last: String,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct WalletData {
    pub wallet: FilteredWallet,
}

/*
#[derive(Debug, Serialize)]
pub struct WalletResponse {
    status: String,
    pub data: WalletData
} */

#[derive(Debug, Serialize)]
pub struct FilteredTransaction {
    pub tx_id: String,
    pub user_id: String,
    pub order_type: String,
    pub crypto_amount: Decimal,
    pub crypto_type: String,
    pub fiat_amount: Decimal,
    pub fiat_currency: String,
    pub payment_method: String,
    pub payment_status: String,
    pub t_hash: String,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "updatedAt")]
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct TransactionData {
    pub tx: FilteredTransaction,
}

/*
#[derive(Debug, Serialize)]
pub struct TransactionResponse {
    status: String,
    pub data: TransactionData
} */

#[derive(Debug, Serialize)]
pub struct FilteredUserSecurityLogs {
    pub log_id: String,
    pub user_id: String,
    pub ip_address: String,
    pub city: String,
    pub country: String,
    pub failed_login_attempts: i64,
    pub flagged_for_review: bool,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct UserSecurityLogsData {
    pub user_security_log: FilteredUserSecurityLogs,
}

/*
#[derive(Debug, Serialize)]
pub struct UserSecurityLogsResponse {
    status: String,
    pub data: UserSecurityLogsData
} */

#[derive(Debug, Serialize)]
pub struct FilteredOtp {
    pub otp_id: String,
    pub user_id: String,
    pub otp: i32,
    #[serde(rename = "createdAt")]
    pub created_at: DateTime<Utc>,
    #[serde(rename = "expiresAt")]
    pub expires_at: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct OtpData {
    pub otp: FilteredOtp,
}

/*
#[derive(Debug, Serialize)]
pub struct OtpResponse {
    status: String,
    pub data: OtpData
} */

#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    status: String,
    pub data: T,
}
