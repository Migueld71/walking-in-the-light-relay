const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const STREAM_URL = "http://51.255.235.165:3988/stream";
const INDEX_PATH = path.join(__dirname, "index.html");

const server = http.createServer((req, res) => {
  const requestPath = req.url || "/";

  if (requestPath === "/") {
    fs.readFile(INDEX_PATH, "utf8", (err, html) => {
      if (err) {
        console.error("Error loading index.html:", err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Unable to load page.");
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
    return;
  }

  if (requestPath === "/stream") {
    const upstreamRequest = http.get(STREAM_URL, (streamRes) => {
      const statusCode = streamRes.statusCode || 200;

      res.writeHead(statusCode, {
        "Content-Type": streamRes.headers["content-type"] || "audio/mpeg",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        "Access-Control-Allow-Origin": "*"
      });

      streamRes.pipe(res);
    });

    upstreamRequest.on("error", (error) => {
      console.error("Stream proxy error:", error.message);
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Unable to connect to radio stream.");
    });

    req.on("close", () => {
      upstreamRequest.destroy();
    });

    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Walking in the Light Radio relay running on port ${PORT}`);
});
