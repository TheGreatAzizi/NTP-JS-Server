# NTP JS Server

A simple lightweight NTP server written in Node.js using UDP sockets.

This project implements a basic NTP server that responds to standard NTP client requests and returns the current system time in NTP timestamp format.

Repository: https://github.com/TheGreatAzizi/NTP-JS-Server

## Features

- Lightweight UDP-based NTP server
- Supports standard NTP client mode requests
- Generates valid 48-byte NTP response packets
- Uses the host machine system clock as the time source
- Configurable host and port using environment variables
- Basic error handling for permission and port conflicts
- No external runtime dependencies
- Docker and Docker Compose support
- GitHub Actions CI workflow included

## Requirements

- Node.js 18 or newer recommended
- Administrator/root privileges if binding to UDP port `123`
- Docker, optional, if you want to run the server in a container

## Installation

Clone the repository:

```bash
git clone https://github.com/TheGreatAzizi/NTP-JS-Server.git
cd NTP-JS-Server
```

Install dependencies:

```bash
npm install
```

This project currently does not require external npm packages, but running `npm install` keeps the workflow consistent if dependencies are added later.

## Usage

Start the server:

```bash
npm start
```

Or run the script directly:

```bash
node ntp-server.js
```

By default, the server listens on:

```txt
0.0.0.0:123/udp
```

### Custom host and port

Linux/macOS:

```bash
NTP_HOST=127.0.0.1 NTP_PORT=12345 npm start
```

Windows PowerShell:

```powershell
$env:NTP_HOST="127.0.0.1"
$env:NTP_PORT="12345"
npm start
```

## Configuration

| Environment Variable | Default | Description |
| --- | --- | --- |
| `NTP_HOST` | `0.0.0.0` | Host address used by the UDP server |
| `NTP_PORT` | `123` | UDP port used by the NTP server |

See `.env.example` for an example configuration file.

> Note: the current script reads directly from environment variables. If you want automatic `.env` loading, add a package such as `dotenv` or pass environment variables through your shell, Docker, or process manager.

## Docker Usage

Build the Docker image:

```bash
docker build -t ntp-js-server .
```

Run the container:

```bash
docker run --rm -p 123:123/udp ntp-js-server
```

Or use Docker Compose:

```bash
docker compose up --build
```

If port `123` is already in use on your machine, change the published port in `docker-compose.yml` or run the server with a different `NTP_PORT`.

## Testing the Server

You can test the server with an NTP client.

Linux/macOS using `ntpdate`:

```bash
ntpdate -q 127.0.0.1
```

Using `chrony`:

```bash
chronyd -Q "server 127.0.0.1 iburst"
```

If you run the server on a non-standard port, use a client or custom script that supports custom NTP ports.

## How It Works

The server listens for UDP packets with a minimum size of 48 bytes. When it receives a valid NTP client mode request, it creates a 48-byte NTP response and fills the required timestamp fields:

- Reference Timestamp
- Originate Timestamp
- Receive Timestamp
- Transmit Timestamp

The server converts Unix time to NTP time using the NTP epoch offset and writes timestamps in big-endian format.

## Security Notice

This project is intended for educational, testing, lab, and local network use.

Be careful before exposing an NTP server publicly on the internet. NTP uses UDP and public NTP servers can be abused if they are not configured safely. Before running this as a public service, add proper monitoring, rate limiting, firewall rules, abuse protection, and time synchronization checks.

For production-grade public NTP services, consider mature and well-tested software such as:

- chrony
- ntpd
- ntpsec

## Limitations

- Uses the local system clock only
- Does not sync directly with upstream NTP servers
- Does not verify whether the host clock is synchronized
- No authentication support
- No built-in rate limiting yet
- No detailed request logging yet
- No metrics or health endpoint yet
- No automated unit tests yet

## Recommended Improvements

These are good additions before treating the repository as a more complete public project:

### 1. Add rate limiting

Add per-IP rate limiting to reduce abuse risk and protect the server from excessive UDP traffic.

### 2. Add structured logging

Log request counts, invalid packets, client addresses, dropped packets, and server errors. For public deployments, consider JSON logs.

### 3. Add automated tests

Add unit tests for:

- NTP timestamp encoding
- NTP version parsing
- NTP mode parsing
- Response packet construction
- Invalid packet handling

### 4. Split the code into modules

A cleaner structure could look like this:

```txt
src/
  server.js
  ntp.js
test/
  ntp.test.js
```

This makes the NTP packet logic easier to test.

### 5. Add an upstream clock health check

Before sending responses, check whether the system clock is synchronized. On Linux, this could be done using tools such as `timedatectl`, `chronyc`, or another trusted source.

### 6. Add a status endpoint

Add a small HTTP health endpoint on a separate port, for example:

```txt
GET /health
GET /metrics
```

This is useful for Docker, Kubernetes, uptime checks, and monitoring.

### 7. Add deployment examples

Add examples for:

- Ubuntu systemd service
- Docker deployment
- Docker Compose deployment
- Windows PowerShell usage
- Running behind firewall rules

### 8. Add GitHub Actions tests

The included workflow currently runs basic installation and syntax checks. Once tests are added, update the workflow to run them automatically.

### 9. Add linting and formatting

Add ESLint and Prettier to keep code style consistent.

### 10. Add documentation for public deployment risks

Document UDP firewall rules, rate limits, and why this server should not be considered production-ready without additional hardening.

## Project Structure

```txt
.
├── .env.example
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── Dockerfile
├── LICENSE
├── README.md
├── docker-compose.yml
├── ntp-server.js
└── package.json
```

## Scripts

```bash
npm start
```

Starts the NTP server.

```bash
npm run check
```

Runs a basic JavaScript syntax check.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
