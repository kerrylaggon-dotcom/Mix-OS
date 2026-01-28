import express from "express";
import type { Request, Response } from "express";

const app = express();

console.log("1. Express app created");

// Basic middleware
app.use(express.json());
console.log("2. JSON middleware added");

// Basic routes
app.get("/api/environments", (req: Request, res: Response) => {
  console.log("GET /api/environments called");
  res.json([]);
});

app.post("/api/environments", (req: Request, res: Response) => {
  console.log("POST /api/environments called with:", req.body);
  const env = {
    id: "env-" + Date.now(),
    name: req.body.name || "New VM",
    type: req.body.type || "qemu",
    status: "stopped",
    createdAt: Date.now(),
  };
  res.json(env);
});

app.get("/api/code-server/status", (req: Request, res: Response) => {
  console.log("GET /api/code-server/status called");
  res.json({ status: "stopped", port: null });
});

app.get("/api/downloads", (req: Request, res: Response) => {
  console.log("GET /api/downloads called");
  res.json([
    { id: "code-server", name: "Code Server", size: "85MB" },
    { id: "qemu", name: "QEMU", size: "200MB" },
  ]);
});

const port = parseInt(process.env.PORT || "5000", 10);

try {
  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`✅ Server listening on port ${port}`);
  });

  server.on("error", (err) => {
    console.error("Server error:", err);
    process.exit(1);
  });
} catch (err) {
  console.error("Failed to start server:", err);
  process.exit(1);
}
