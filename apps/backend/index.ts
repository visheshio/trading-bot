import express from "express";
import cors from "cors";
import { SignJWT } from "jose"; 
import {
  CreateWorkflowSchema,
  signinSchema,
  signupSchema,
  UpdateWorkflowSchema,
} from "../../packages/common/types/index.js";
import {
  connectToDatabase,
  ExecutionModel,
  NodesModel,
  UserModel,
  WorkflowModel,
} from "../../packages/db/index.js";
import { authMiddleware } from "./middleware.js";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "123123adskkads");

const app = express();
const port = process.env.PORT || 3000;

// Dynamic CORS configuration allowing localhost, Vercel preview/production deployments, and configured frontend URL
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, server-to-server, curl, same-origin)
      if (!origin) return callback(null, true);

      const allowedSpecific = [
        "http://localhost:5173",
        "http://localhost:3000",
        process.env.FRONTEND_URL,
        process.env.CORS_ORIGIN,
        process.env.CLIENT_URL,
        "https://trading-n8n-monorepo-client.vercel.app",
      ].filter(Boolean) as string[];

      if (
        allowedSpecific.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost")
      ) {
        return callback(null, true);
      }

      // Default fallback in non-strict modes: allow origin
      return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

import mongoose from "mongoose";

app.use(express.json());

const router = express.Router();

// Health check endpoint (non-blocking)
router.get("/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatusMap: Record<number, string> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  // Attempt background connect if disconnected
  if (dbState === 0) {
    connectToDatabase().catch((e) => console.error("Background DB connect error:", e.message));
  }
  res.json({
    status: "ok",
    message: "Trading Bot API is running",
    database: dbStatusMap[dbState] || "unknown",
    timestamp: new Date().toISOString(),
  });
});

// Serverless DB Connection Middleware for operational endpoints
router.use(async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  try {
    await connectToDatabase();
    next();
  } catch (err: any) {
    console.error("Database connection error:", err);
    return res.status(500).json({
      message: "Database connection failed",
      error: err?.message || "Internal database connection error",
    });
  }
});


router.post("/signup", async (req, res) => {
  const { success, data } = signupSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({ message: "incorrect inputs" });
  }
  try {
    const user = await UserModel.create({
      username: data.username,
      password: data.password,
    });

    const token = await new SignJWT({ id: user._id.toString() })
      .setProtectedHeader({ alg: "HS256" }) 
      .setExpirationTime("24h")             
      .sign(JWT_SECRET);

    res.json({
      message: "User created successfully",
      token: token,
    });
  } catch (e) {
    return res.status(411).json({ message: "username already exists" });
  }
});

router.post("/signin", async (req, res) => {
  const { success, data } = signinSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({ message: "incorrect inputs" });
  }
  try {
    const user = await UserModel.findOne({
      username: data.username,
      password: data.password,
    });
    
    if (user) {
      const token = await new SignJWT({ id: user._id.toString() })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(JWT_SECRET);
        
      res.json({ id: user._id, token });
    } else {
      return res.status(403).json({ message: "Incorrect Credentials" });
    }
  } catch (e) {
    console.error("Signin error:", e);
    return res.status(411).json({ message: e instanceof Error ? e.message : "Signin error" });
  }
});

router.post("/workflow", authMiddleware, async (req, res) => {
  const userid = req.userid!; 
  
  const { success, data } = CreateWorkflowSchema.safeParse(req.body);
  if (!success) {
    res.status(403).json({ message: "Incorrect inputs" });
    return;
  }
  try {
    const workflow = await WorkflowModel.create({
      userid: userid,
      nodes: data.nodes,
      edges: data.edges,
    });
    res.json({ id: workflow._id });
  } catch (e) {
    res.status(411).json({ message: "Failed to create workflow" });
  }
});

router.put("/workflow/:workflowId", authMiddleware, async (req, res) => {
  const { success, data } = UpdateWorkflowSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({ message: "Incorrect inputs" });
  }
  try {
    const workflow = await WorkflowModel.findByIdAndUpdate(
      req.params.workflowId,
      data,
      { new: true, runValidators: true }
    );
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    res.json({
      id: workflow?._id,
    });
  } catch (e) {
    res.status(411).json({ message: "Failed to update workflow" });
  }
});

router.get("/workflows", authMiddleware, async (req, res) => {
  try {
    const workflows = await WorkflowModel.find({ userid: req.userid });
    res.json(workflows);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch workflows" });
  }
});

router.get("/workflow/:workflowId", authMiddleware, async (req, res) => {
  try {
    const workflow = await WorkflowModel.findById(req.params.workflowId);
    
    if (!workflow || workflow.userid.toString() !== req.userid) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    res.json(workflow);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch workflow" });
  }
});

router.get(
  "/workflow/executions/:workflowId",
  authMiddleware,
  async (req, res) => {
    try {
      const workflow = await WorkflowModel.findOne({
        _id: req.params.workflowId,
        userid: req.userid,
      });
      if (!workflow) {
        return res.status(404).json({ message: "Workflow not found" });
      }

      const executions = await ExecutionModel.find({
        workflowId: req.params.workflowId,
      }); 
      res.json(executions);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch executions" });
    }
  }
);

router.get("/nodes", async (_req, res) => {
  try {
    const nodes = await NodesModel.find();
    res.json(nodes);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch nodes" });
  }
});

// Support both /api/* and /* route prefixes
app.use("/api", router);
app.use("/", router);

// Start standalone server when run locally (not in Vercel serverless environment)
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
}

export default app;

