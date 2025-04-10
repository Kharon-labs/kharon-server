use core::fmt;
use std::future::{ready, Ready};

use crate::{models::models::TokenClaims, AppState};
use actix_web::{
    dev::Payload, error::ErrorUnauthorized, http, web, Error as ActixWebError, FromRequest,
    HttpMessage, HttpRequest,
};
use jsonwebtoken::{decode, DecodingKey, Validation};
use serde::Serialize;

#[derive(Debug, Serialize)]
struct ErrorResponse {
    status: String,
    message: String,
}

impl fmt::Display for ErrorResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", serde_json::to_string(&self).unwrap())
    }
}

pub struct JwtMiddleware {
    pub user_id: uuid::Uuid,
}

impl FromRequest for JwtMiddleware {
    type Error = ActixWebError;
    type Future = Ready<Result<Self, Self::Error>>;

    fn from_request(req: &HttpRequest, _payload: &mut Payload) -> Self::Future {
        let data = req.app_data::<web::Data<AppState>>().unwrap();

        let token = req
            .cookie("token")
            .map(|c| c.value().to_string())
            .or_else(|| {
                req.headers()
                    .get(http::header::AUTHORIZATION)
                    .map(|h| h.to_str().unwrap().split_at(7).1.to_string())
            });

        if token.is_none() {
            let json_error = ErrorResponse {
                status: "fail".to_string(),
                message: "Access denied. No token found".to_string(),
            };
            return ready(Err(ErrorUnauthorized(json_error)));
        }

        let claims = match decode::<TokenClaims>(
            &token.unwrap(),
            &DecodingKey::from_secret(data.env.jwt_secret.as_ref()),
            &Validation::default(),
        ) {
            Ok(c) => c.claims,
            Err(_) => {
                let json_error = ErrorResponse {
                    status: "fail".to_string(),
                    message: "Invalid token".to_string(),
                };
                return ready(Err(ErrorUnauthorized(json_error)));
            }
        };

        let user_id = uuid::Uuid::parse_str(claims.sub.as_str()).unwrap();
        req.extensions_mut().insert::<uuid::Uuid>(user_id);

        ready(Ok(JwtMiddleware { user_id }))
    }
}
