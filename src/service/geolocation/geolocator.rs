// use awc::Client;
use ipinfo::{IpInfo, IpInfoConfig};
use serde::Deserialize;

#[derive(Debug, Deserialize, Default)]
pub struct IpInfoResponse {
    pub city: Option<String>,
    pub country: Option<String>,
}

#[derive(Clone)]
pub struct GeoLocator {
    token: String,
}

impl GeoLocator {
    pub fn new(token: String) -> Self {
        Self { token }
    }

    pub async fn lookup(&self, ip: &str) -> Result<IpInfoResponse, Box<dyn std::error::Error>> {
        let config = IpInfoConfig {
            token: Some(self.token.clone()),
            ..Default::default()
        };

        let mut ipinfo = IpInfo::new(config).expect("should construct ipInfo");

        let res = ipinfo.lookup(ip).await?;

        let geo = IpInfoResponse {
            city: Some(res.city),
            country: Some(res.country),
        };

        Ok(geo)
    }
}
