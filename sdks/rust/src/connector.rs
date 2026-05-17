use std::{future::Future, pin::Pin};

use http1::Uri;
use hyper_util::{
    client::legacy::connect::{
        proxy::{SocksV5, Tunnel},
        HttpConnector,
    },
    rt::TokioIo,
};
use tokio::net::TcpStream;
use tower_service::Service;

type HttpsIfAvailable<T> = T;
type MaybeHttpsStream<T> = T;

#[derive(Clone, Debug)]
pub(crate) enum Connector {
    Regular(HttpsIfAvailable<HttpConnector>),
    Socks5Proxy(HttpsIfAvailable<SocksV5<HttpConnector>>),
    HttpProxy(HttpsIfAvailable<Tunnel<HttpConnector>>),
}

pub(crate) fn make_connector(proxy_addr: Option<String>) -> Connector {
    let mut http = hyper_util::client::legacy::connect::HttpConnector::new();
    http.enforce_http(false);
    http.set_nodelay(true);

    let Some(proxy_addr) = proxy_addr else {
        return Connector::Regular(http);
    };
    let proxy_addr = match proxy_addr.parse::<Uri>() {
        Ok(proxy_addr) => proxy_addr,
        Err(_) => return Connector::Regular(http),
    };

    match proxy_addr.scheme_str() {
        Some("http" | "https") => {
            let tunnel = Tunnel::new(proxy_addr, http);
            Connector::HttpProxy(tunnel)
        }
        Some("socks5") => {
            let socks = SocksV5::new(proxy_addr, http).local_dns(true);
            Connector::Socks5Proxy(socks)
        }
        Some("socks5h") => {
            let socks = SocksV5::new(proxy_addr, http);
            Connector::Socks5Proxy(socks)
        }
        _ => Connector::Regular(http),
    }
}

impl Service<Uri> for Connector {
    type Response = MaybeHttpsStream<TokioIo<TcpStream>>;
    type Error = Box<dyn std::error::Error + Send + Sync>;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(
        &mut self,
        cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        match self {
            Self::Regular(inner) => inner.poll_ready(cx),
            Self::Socks5Proxy(inner) => inner.poll_ready(cx),
            Self::HttpProxy(inner) => inner.poll_ready(cx),
        }
    }

    fn call(&mut self, req: Uri) -> Self::Future {
        match self {
            Self::Regular(inner) => Box::pin(inner.call(req)),
            Self::Socks5Proxy(inner) => Box::pin(inner.call(req)),
            Self::HttpProxy(inner) => Box::pin(inner.call(req)),
        }
    }
}
