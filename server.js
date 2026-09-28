const http = require("http");
const https = require("https");
const fs = require("fs");

const PORT = process.env.PORT || 8080;
let currentListeners = 0;
// Put your actual radio stream URL here 
const STREAM_URL = "http://51.255.235.165:3988/stream";

const server = http.createServer((req, res) => {
  if (req.url === "/") {
  fs.readFile(__dirname + "/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end("Error loading radio page");
      return;
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
  return;
}
if (req.url === "/manifest.json") {
  fs.readFile(__dirname + "/manifest.json", (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/manifest+json" });
    res.end(data);
  });
  return;
}

if (req.url === "/sw.js") {
  fs.readFile(__dirname + "/sw.js", (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "application/javascript" });
    res.end(data);
  });
  return;
}
  if (req.url === "/icon-192.png" || req.url === "/icon-512.png") {
  fs.readFile(__dirname + req.url, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(data);
  });
  return;
  }
  
  if (req.url === "/stream") {
  const client = STREAM_URL.startsWith("https") ? https : http;

  const streamReq = client.get(STREAM_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Icy-MetaData": "0"
    }
  }, (streamRes) => {
    if (streamRes.statusCode !== 200) {
      res.writeHead(502);
      res.end("Radio stream unavailable");
      return;
    }

    currentListeners++;
    console.log("Current listeners:", currentListeners);

    let counted = true;
    const removeListener = () => {
      if (counted) {
        counted = false;
        currentListeners = Math.max(0, currentListeners - 1);
        console.log("Current listeners:", currentListeners);
      }
    };

    res.on("close", removeListener);

    res.writeHead(200, {
      "Content-Type": streamRes.headers["content-type"] || "audio/mpeg",
      "Cache-Control": "no-cache, no-store",
      "Connection": "keep-alive"
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8080;

// Radio stream
const STREAM_URL = "http://51.255.235.165:3988/stream";

const server = http.createServer((req, res) => {

  // Relay the radio stream
  if (req.url === "/stream") {
    const streamReq = http.get(STREAM_URL, (streamRes) => {

      res.writeHead(200, {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });

      streamRes.pipe(res);

      req.on("close", () => {
        streamReq.destroy();
      });
    });

    streamReq.on("error", (err) => {
      console.error("Stream error:", err);
      if (!res.headersSent) {
        res.writeHead(502, {
          "Content-Type": "text/plain"
        });
      }
      res.end("Radio stream unavailable");
    });

    return;
  }

  // Serve website files
  let filePath = req.url === "/"
    ? path.join(__dirname, "index.html")
    : path.join(__dirname, req.url);

  const ext = path.extname(filePath).toLowerCase();

  const contentTypes = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon"
  };

  const contentType =
    contentTypes[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.writeHead(404, {
          "Content-Type": "text/plain"
        });
        res.end("Not Found");
      } else {
        res.writeHead(500, {
          "Content-Type": "text/plain"
        });
        res.end("Server Error");
      }
      return;
    }

    res.writeHead(200, {
      "Content-Type": contentType
    });

    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Radio relay is running on port ${PORT}`);
});
