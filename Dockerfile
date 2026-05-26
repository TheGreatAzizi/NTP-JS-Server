FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY ntp-server.js ./

ENV NTP_HOST=0.0.0.0
ENV NTP_PORT=123

EXPOSE 123/udp

USER node

CMD ["npm", "start"]
