use actix_web::web;

use crate::routes::routes::{
    create_user_handler, get_transaction_handler, get_user_handler, get_user_logs_handler,
    get_wallet_handler, request_otp_handler, update_transaction_handler,
    update_user_wallet_handler, validate_otp_handler,
};


pub fn config(conf: &mut web::ServiceConfig) {
    let scope = web::scope("/api")
        .service(create_user_handler)
        .service(update_user_wallet_handler)
        .service(update_transaction_handler)
        .service(request_otp_handler)
        .service(validate_otp_handler)
        .service(get_user_handler)
        .service(get_transaction_handler)
        .service(get_user_logs_handler)
        .service(get_wallet_handler);

    conf.service(scope);
}