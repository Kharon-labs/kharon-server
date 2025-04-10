install:
	cargo install sqlx-cli
	cargo add actix-web
	cargo add actix-cors
	cargo add serde_json
	cargo add serde --features derive
	cargo add chrono --features serde
	cargo add env_logger
	cargo add dotenv
	cargo add uuid --features "serde v4"
	cargo add sqlx --features "runtime-async-std-native-tls postgres chrono uuid rust_decimal"
	cargo add jsonwebtoken
	cargo add argon2
	cargo add rand_core --features "std"
	cargo add rand
	cargo add rust_decimal --features "db-postgres"
	cargo add lettre --features "smtp-transport builder serde"
	cargo add handlebars
	cargo add awc
	# cargo add futures
	cargo add futures-util
	cargo add actix-web-lab
	cargo install cargo-watch


run: 
	cargo r -r 

watch:
	cargo watch -q -c -w src/ -x run 

migrate:
	sqlx migrate run

create_migrate:
	sqlx migrate add -r init

restart postgres:
	sudo systemctl restart postgresql