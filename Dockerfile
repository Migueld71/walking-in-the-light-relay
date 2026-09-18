FROM node:20-alpine

WORKDIR /app

COPY server.js index.html manifest.json sw.js icon-192.png icon-512.png ./

ENV PORT=8080

EXPOSE 8080

CMD ["node", "server.js"]
