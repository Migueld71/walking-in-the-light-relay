const http = require("http");

const PORT = process.env.PORT || 8080;
const STREAM_URL = "http://51.255.235.165:3988/stream";

const server = http.createServer((req, res) => {
  if (req.url === "/stream") {
    const upstreamRequest = http.get(STREAM_URL, (streamRes) => {
      res.writeHead(streamRes.statusCode || 200, streamRes.headers);
      streamRes.pipe(res);
    });

    upstreamRequest.on("error", (error) => {
      res.writeHead(502);
      res.end("Stream unavailable");
    });

    req.on("close", () => {
      upstreamRequest.destroy();
    });

    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Radio relay on port ${PORT}`);
});
