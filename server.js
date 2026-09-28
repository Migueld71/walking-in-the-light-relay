const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;
const STREAM_URL = "https://eu8.fastcast4u.com/stream/miguel71/";
const INDEX_PATH = path.join(__dirname, "index.html");

const server = http.createServer((req, res) => {
  const requestPath = req.url ? req.url.split("?")[0] : "/";

  if (req.method === "OPTIONS" && requestPath === "/stream") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Range, Accept, Icy-Metadata, User-Agent"
    });
    res.end();
    return;
  }

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
    const client = STREAM_URL.startsWith("https") ? https : http;
    const upstreamHeaders = {};

    ["accept", "accept-language", "icy-metadata", "range", "user-agent", "referer"].forEach((header) => {
      if (req.headers[header]) {
        upstreamHeaders[header] = req.headers[header];
      }
    });

    const upstreamRequest = client.get(
      STREAM_URL,
      {
        headers: upstreamHeaders
      },
      (streamRes) => {
        const statusCode = streamRes.statusCode || 200;
        const contentType = streamRes.headers["content-type"] || "audio/mpeg";

        res.writeHead(statusCode, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Range, Accept, Icy-Metadata, User-Agent",
          "Accept-Ranges": "bytes"
        });

        streamRes.pipe(res);
      }
    );

    upstreamRequest.on("error", (error) => {
      console.error("Stream proxy error:", error.message);
      res.writeHead(502, { "Content-Type": "text/plain" });
      res.end("Unable to connect to radio stream.");
    });

    req.on("close", () => {
      upstreamRequest.destroy();
    });

    req.on("aborted", () => {
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
