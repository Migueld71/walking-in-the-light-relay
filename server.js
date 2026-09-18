const http = require("http");
const https = require("https");
const fs = require("fs");

const PORT = process.env.PORT || 8080;

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
  
  
  if (req.url === "/stream") {
    const client = STREAM_URL.startsWith("https") ? https : http;

    client.get(STREAM_URL, (streamRes) => {
      res.writeHead(streamRes.statusCode || 200, {
        "Content-Type": streamRes.headers["content-type"] || "audio/mpeg",
        "Cache-Control": "no-cache"
      });

      streamRes.pipe(res);
    }).on("error", () => {
      res.writeHead(502);
      res.end("Unable to connect to radio stream.");
    });

    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Walking in the Light Radio relay running on port ${PORT}`);
});
