FROM node:20-alpine

WORKDIR /app

COPY index.html styles.css app.js game-engine.js manifest.webmanifest sw.js server.js ./
COPY IMG_372201B13BB8-1.jpeg IMG_8924138EE2D3-1.jpeg IMG_9A4EEE619E96-1.jpeg ./

RUN mkdir -p /data

ENV PORT=8080
ENV DATA_DIR=/data

EXPOSE 8080

CMD ["node", "server.js"]
