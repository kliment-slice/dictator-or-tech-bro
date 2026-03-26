import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { WebSocketServer, WebSocket } from "ws";
import { handleConnection } from "./lib/serverGameState";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = parseInt(process.env.PORT ?? "3000", 10);

async function main() {
  const app = next({ dev, hostname, port });
  const handle = app.getRequestHandler();

  await app.prepare();

  // Next.js exposes its own upgrade handler for HMR websockets in dev
  const nextUpgrade =
    typeof (app as any).getUpgradeHandler === "function"
      ? (app as any).getUpgradeHandler()
      : null;

  const httpServer = createServer(async (req, res) => {
    try {
      await handle(req, res, parse(req.url!, true));
    } catch (err) {
      console.error("Error handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const { pathname } = parse(req.url ?? "");

    if (pathname === "/ws") {
      // Our game websocket
      wss.handleUpgrade(req, socket as import("stream").Duplex, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else if (nextUpgrade) {
      // Let Next.js handle HMR and anything else it owns (e.g. /_next/webpack-hmr)
      nextUpgrade(req, socket, head);
    }
    // Unknown paths: let the socket time out naturally — no destroy
  });

  wss.on("connection", (ws: WebSocket) => handleConnection(ws, wss));

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
