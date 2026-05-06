#!/usr/bin/env node
/**
 * webhook_receiver.js — Lightweight HTTP server that acts as a webhook endpoint
 * for load testing HookSniff. Accepts POST requests and returns 200.
 *
 * Usage:
 *   node tests/load/webhook_receiver.js           # default port 8090
 *   PORT=9000 node tests/load/webhook_receiver.js # custom port
 *
 * Endpoints:
 *   GET  /health    → 200 { status: "ok" }
 *   POST /webhook   → 200 { received: true, ts: "..." }
 *   GET  /stats     → 200 { received: N, last_at: "..." }
 */

const http = require("http");

const PORT = parseInt(process.env.PORT || "8090", 10);
const VERBOSE = process.env.VERBOSE === "true";

let received = 0;
let lastAt = null;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (req.method === "GET" && url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // Stats
  if (req.method === "GET" && url.pathname === "/stats") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ received, last_at: lastAt }));
    return;
  }

  // Webhook receiver
  if (req.method === "POST" && url.pathname === "/webhook") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      received++;
      lastAt = new Date().toISOString();

      if (VERBOSE && received % 1000 === 0) {
        console.log(`[${lastAt}] Received: ${received} total`);
      }

      // Respond quickly — simulate a fast endpoint
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ received: true, ts: lastAt }));
    });
    return;
  }

  // Catch-all
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "not found" }));
});

server.listen(PORT, () => {
  console.log(`Webhook receiver listening on http://localhost:${PORT}`);
  console.log(`  POST /webhook  → 200`);
  console.log(`  GET  /health   → 200`);
  console.log(`  GET  /stats    → 200`);
  console.log(`\nSet RECEIVER_URL=http://localhost:${PORT} when running k6 tests.`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log(`\nShutting down. Total received: ${received}`);
  server.close(() => process.exit(0));
});
process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
