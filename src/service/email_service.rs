use handlebars::Handlebars;
use lettre::message::header::ContentType;
use lettre::message::Mailbox;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};
use serde_json::json;
use std::env;
use std::error::Error;

pub async fn send_verification_email(to_email: &str, otp: i32) -> Result<(), Box<dyn Error>> {
    let template_path = "src/service/templates/request_otp.hbs";
    println!("Current working directory: {:?}", std::env::current_dir()?);

    let from_email = env::var("EMAIL_FROM")?;
    let smtp_username = env::var("SMTP_USERNAME")?;
    let smtp_password = env::var("SMTP_PASSWORD")?;

    let mut handlebars = Handlebars::new();
    handlebars.register_template_file("Verify OTP", template_path)?;

    let data = json!({
        "otp": otp
    });

    let html_body = handlebars.render("Verify OTP", &data)?;

    let email = Message::builder()
        .from(format!("Kharon Pay <{}>", from_email).parse::<Mailbox>()?)
        .to(to_email.parse::<Mailbox>()?)
        .subject("Verify your Kharon Pay account")
        .header(ContentType::TEXT_HTML)
        .body(html_body)?;

    let creds = Credentials::new(smtp_username, smtp_password);

    let mailer = SmtpTransport::relay("smtp.gmail.com")?
        .credentials(creds)
        .build();

    mailer.send(&email)?;

    Ok(())
}

pub async fn send_request_password_reset_email(
    to_email: &str,
    link: &str,
) -> Result<(), Box<dyn Error>> {
    let template_path = "service/templates/request_password_reset.hbs";
    let from_email = env::var("EMAIL_FROM")?;
    let smtp_username = env::var("SMTP_USERNAME")?;
    let smtp_password = env::var("SMTP_PASSWORD")?;

    let mut handlebars = Handlebars::new();
    handlebars.register_template_file("Reset Password Token", template_path)?;

    let data = json!({
        "link": link
    });

    let html_body = handlebars.render("Reset Password Token", &data)?;

    let email = Message::builder()
        .from(format!("Kharon Pay <{}>", from_email).parse::<Mailbox>()?)
        .to(to_email.parse::<Mailbox>()?)
        .subject("Password Reset Link")
        .header(ContentType::TEXT_HTML)
        .body(html_body)?;

    let creds = Credentials::new(smtp_username, smtp_password);

    let mailer = SmtpTransport::relay("smtp.gmail.com")?
        .credentials(creds)
        .build();

    mailer.send(&email)?;

    Ok(())
}

pub async fn send_password_reset_email(to_email: &str) -> Result<(), Box<dyn Error>> {
    let template_path = "./templates/reset_password.hbs";
    let from_email = env::var("EMAIL_FROM")?;
    let smtp_username = env::var("SMTP_USERNAME")?;
    let smtp_password = env::var("SMTP_PASSWORD")?;

    let mut handlebars = Handlebars::new();
    handlebars.register_template_file("Password Reset", template_path)?;

    let html_body = handlebars.render("Password Reset", &json!({}))?;

    let email = Message::builder()
        .from(format!("Kharon Pay <{}>", from_email).parse::<Mailbox>()?)
        .to(to_email.parse::<Mailbox>()?)
        .subject("Password Reset Successful")
        .header(ContentType::TEXT_HTML)
        .body(html_body)?;

    let creds = Credentials::new(smtp_username, smtp_password);

    let mailer = SmtpTransport::relay("smtp.gmail.com")?
        .credentials(creds)
        .build();

    mailer.send(&email)?;

    Ok(())
}
