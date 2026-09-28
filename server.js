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
    });

streamRes.pipe(res);
return;
streamRes.on("error", () => {
  removeListener();
  if (!res.writableEnded) res.end();
});
});

streamReq.on("error", () => {
  if (!res.headersSent) {
    res.writeHead(502);
    res.end("Unable to connect to radio stream");
  }
});

return;
}

<audio controls preload="none">
  <source src="http://51.255.235.165:3988/stream" type="audio/mpeg">
  Your browser does not support the audio player.
</audio>

<div class="message">
  Jesus is Lord • Music • Faith • Encouragement
</div>

<div class="footer">
  Walking in the Light Radio
</div>

</main>

<script>
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js");
  });
}
</script>

</body>
</html>
