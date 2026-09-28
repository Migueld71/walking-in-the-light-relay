const http = require("http");

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Walking in the Light Radio relay is running.");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Walking in the Light Radio relay running on port ${PORT}`);
});
