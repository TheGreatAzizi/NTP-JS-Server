"use strict";

const dgram = require("dgram");

const HOST = process.env.NTP_HOST || "0.0.0.0";
const PORT = Number(process.env.NTP_PORT || 123);

const server = dgram.createSocket("udp4");

const NTP_UNIX_EPOCH_DIFF = 2208988800;

function writeTimestamp(buffer, offset, unixMs) {
  const seconds = Math.floor(unixMs / 1000) + NTP_UNIX_EPOCH_DIFF;
  const fraction = Math.floor(((unixMs % 1000) / 1000) * 0x100000000);

  buffer.writeUInt32BE(seconds >>> 0, offset);
  buffer.writeUInt32BE(fraction >>> 0, offset + 4);
}

function readMode(packet) {
  return packet[0] & 0x07;
}

function readVersion(packet) {
  return (packet[0] >> 3) & 0x07;
}

function createResponse(request) {
  const receiveTime = Date.now();
  const response = Buffer.alloc(48);

  const clientVersion = readVersion(request);
  const version = clientVersion >= 1 && clientVersion <= 4 ? clientVersion : 4;

  // LI = 0, Version = client version, Mode = 4 server
  response[0] = (0 << 6) | (version << 3) | 4;

  // Stratum 2 یعنی سرور از یک منبع بالادستی/سیستم‌عامل زمان می‌گیرد
  response[1] = 2;

  // Poll interval
  response[2] = 6;

  // Precision
  response[3] = 0xec;

  // Root Delay
  response.writeUInt32BE(0x00010000, 4);

  // Root Dispersion
  response.writeUInt32BE(0x00010000, 8);

  // Reference ID
  response.write("NODE", 12, 4, "ascii");

  // Reference Timestamp
  writeTimestamp(response, 16, receiveTime);

  // Originate Timestamp = Transmit Timestamp درخواست کلاینت
  request.copy(response, 24, 40, 48);

  // Receive Timestamp
  writeTimestamp(response, 32, receiveTime);

  // Transmit Timestamp
  writeTimestamp(response, 40, Date.now());

  return response;
}

server.on("message", (packet, rinfo) => {
  if (!Buffer.isBuffer(packet) || packet.length < 48) return;

  // فقط NTP client mode
  if (readMode(packet) !== 3) return;

  const response = createResponse(packet);

  server.send(response, 0, response.length, rinfo.port, rinfo.address);
});

server.on("listening", () => {
  const address = server.address();
  console.log(`NTP server running on ${address.address}:${address.port}/udp`);
});

server.on("error", (err) => {
  console.error("NTP server error:", err.message);

  if (err.code === "EACCES") {
    console.error("Run terminal as Administrator because UDP 123 needs elevated permission.");
  }

  if (err.code === "EADDRINUSE") {
    console.error("UDP 123 is already in use. Stop Windows Time service or use another server.");
  }

  process.exit(1);
});

server.bind(PORT, HOST);