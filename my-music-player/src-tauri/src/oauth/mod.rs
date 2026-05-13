use tiny_http::{Server, Response};
use url::Url;

// Función para iniciar un servidor web local y escuchar el callback de OAuth
pub fn listen_for_oauth_callback(port: u16) -> Result<String, String> {
    let server = Server::http(format!("127.0.0.1:{}", port))
        .map_err(|e| format!("Failed to start server: {}", e))?;

    // Esperar una única petición
    if let Ok(request) = server.recv() {
        let url_str = format!("http://127.0.0.1:{}{}", port, request.url());

        let response = Response::from_string("<html><body><h1>Autenticación Completada</h1><p>Puedes cerrar esta ventana y volver a Neurid Studio.</p><script>window.close();</script></body></html>")
            .with_header(tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"text/html"[..]).unwrap());
        let _ = request.respond(response);

        if let Ok(url) = Url::parse(&url_str) {
            // Extraer el código (por ejemplo, `?code=XYZ`)
            for (key, value) in url.query_pairs() {
                if key == "code" {
                    return Ok(value.into_owned());
                }
            }
            // En caso de usar implicit grant (el token va en el hash, lo que requeriría JS para extraerlo en la página),
            // pero para OAuth de escritorio asumimos Auth Code Flow.
        }
    }

    Err("No code received".to_string())
}