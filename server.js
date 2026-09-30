const http = require("http");
const https = require("https");
const fs = require("fs");

const PORT = process.env.PORT || 8080;

// Your radio station stream
const STREAM_URL = "http://ip165.ip-51-255-235.eu:3988/stream";

const server = http.createServer((req, res) => {

  // MAIN RADIO PAGE
  if (req.url === "/") {
    fs.readFile(__dirname + "/index.html", (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Error loading radio page");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/html"
      });

      res.end(data);
    });

    return;
  }

  // MANIFEST
  if (req.url === "/manifest.json") {
    fs.readFile(__dirname + "/manifest.json", (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/manifest+json"
      });

      res.end(data);
    });

    return;
  }

  // SERVICE WORKER
  if (req.url === "/sw.js") {
    fs.readFile(__dirname + "/sw.js", (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "application/javascript"
      });

      res.end(data);
    });

    return;
  }

  // ICONS
  if (req.url === "/icon-192.png" || req.url === "/icon-512.png") {
    fs.readFile(__dirname + req.url, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }

      res.writeHead(200, {
        "Content-Type": "image/png"
      });

      res.end(data);
    });

    return;
  }

  // RADIO STREAM RELAY
  if (req.url === "/stream") {

    const client = STREAM_URL.startsWith("https:") ? https : http;

    const streamReq = client.get(
      STREAM_URL,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Icy-MetaData": "0",
          "Accept": "*/*",
          "Connection": "keep-alive"
        }
      },
      (streamRes) => {

        if (
          streamRes.statusCode &&
          streamRes.statusCode >= 300 &&
          streamRes.statusCode < 400 &&
          streamRes.headers.location
        ) {
          res.writeHead(302, {
            Location: streamRes.headers.location
          });
          res.end();
          return;
        }

        if (streamRes.statusCode !== 200) {
          res.writeHead(502, {
            "Content-Type": "text/plain"
          });

          res.end("Radio stream unavailable");
          return;
        }

        res.writeHead(200, {
          "Content-Type":
            streamRes.headers["content-type"] || "audio/mpeg",
          "Cache-Control":
            "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Access-Control-Allow-Origin": "*",
          "Connection": "keep-alive"
        });

        streamRes.pipe(res);

        req.on("close", () => {
          streamReq.destroy();
        });
      }
    );

    streamReq.on("error", (err) => {
      console.error("Stream connection error:", err.message);

      if (!res.headersSent) {
        res.writeHead(502, {
          "Content-Type": "text/plain"
        });
      }

      res.end("Unable to connect to radio stream.");
    });

    return;
  }

  // EVERYTHING ELSE
  res.writeHead(404, {
    "Content-Type": "text/plain"
  });

  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Walking in the Light Radio relay running on port ${PORT}`
  );
});
