const http = require("http");
const https = require("https");
const fs = require("fs");

const PORT = process.env.PORT || 8080;

// Your radio station stream
const STREAM_URL = "http://51.255.235.165:3988/stream";

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
