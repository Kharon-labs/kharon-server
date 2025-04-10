mod auth;
mod config;
mod middleware;
mod models;
mod routes;
mod service;

use std::sync::Arc;

use actix_cors::Cors;
use actix_web::{http::header, middleware::{from_fn, Logger}, web, App, HttpServer};
use config::{config::Config, config_scope};
use dotenv::dotenv;
use middleware::security_log::security_logger_middleware;
use service::geolocation::geolocator::GeoLocator;
use sqlx::{postgres::PgPoolOptions, Pool, Postgres};

pub struct AppState {
    db: Pool<Postgres>,
    env: Config,
    pub geo_locator: GeoLocator,
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    if std::env::var_os("RUST_LOG").is_none() {
        std::env::set_var("RUST_LOG", "actix_web=info");
    }
    dotenv().ok();
    env_logger::init();

    let config = Config::init();
    println!("Database URL: {}", config.database_url);

    let pool = match PgPoolOptions::new()
        .max_connections(10)
        .connect(&config.database_url)
        .await
    {
        Ok(pool) => {
            println!("Connection to database successful.");
            pool
        }
        Err(e) => {
            println!("Connection to database failed!: {:?}", e);
            std::process::exit(1);
        }
    };

    println!("Server started successfully...");

    let geo_locator = GeoLocator::new(config.ip_info_token.clone());

    HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:3000")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE"])
            .allowed_headers(vec![
                header::CONTENT_TYPE,
                header::AUTHORIZATION,
                header::ACCEPT,
            ]);
        // .supports_credentials()

        App::new()
        .app_data(web::Data::from(Arc::new(AppState {
            db: pool.clone(),
            env: config.clone(),
            geo_locator: geo_locator.clone(),
        })))        
            .configure(config_scope::config)
            .wrap(cors)
            .wrap(Logger::default())
            .wrap(from_fn(security_logger_middleware))
    })
    .bind(("127.0.0.1", 8000))?
    .run()
    .await
}
