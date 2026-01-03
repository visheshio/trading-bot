import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import {
  CreateWorkflowSchema,
  signinSchema,
  signupSchema,
  UpdateWorkflowSchema,
} from "../../packages/common/types";
import {
  ExecutionModel,
  NodesModel,
  UserModel,
  WorkflowModel,
} from "db/client";
import jwt from "jsonwebtoken";
import { authMiddleware } from "./middleware";
console.log("Mongo URL:", process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL!);
const JWT_SECRET = process.env.JWT_SECRET!;

const app = express();
const port = 3000;

app.use(cors({
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

app.post("/signup", async (req, res) => {
  const { success, data } = signupSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({ message: "incorrect inputs" });
    return;
  }
  try {
    const user = await UserModel.create({
      username: data.username,
      password: data.password,
    });
    const token = jwt.sign({
      id: user._id,
    }, JWT_SECRET);

    res.json({
      message: "User created successfully",
      token: token,
    });
  } catch (e) {
    return res.status(411).json({ message: "username already exists" });
  }
});

app.post("/signin", async (req, res) => {
  const { success, data } = signinSchema.safeParse(req.body);
  if (!success) {
    return res.status(403).json({ message: "incorrect inputs" });
    return;
  }
  try {
    const user = await UserModel.findOne({
      username: data.username,
      password: data.password,
    });
    if (user) {
      const token = jwt.sign(
        {
          id: user._id,
        },
        JWT_SECRET
      );
      res.json({ id: user._id, token });
    } else {
      return res.status(403).json({ message: "Incorrect Credentials" });
    }
  } catch (e) {
    console.log(e)
    return res.status(411).json({ message: e });
  }
});

app.post("/workflow", authMiddleware, async (req, res) => {
  const userid = req.userid!;
  console.log(userid);
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
app.put("/workflow/:workflowId", authMiddleware, async (req, res) => {
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

app.get("/workflow/:workflowId", authMiddleware, async (req, res) => {
  const workflow = await WorkflowModel.findById(req.params.workflowId);
  if (!workflow || workflow.userid.toString() !== req.userid) {
    return res.status(404).json({ message: "Workflow not found" });
    return;
  }
  res.json(workflow);
});

app.get("/workflows", authMiddleware, async (req, res) => {
  const workflows = await WorkflowModel.find({ userid: req.userid });
  res.json(workflows);
});

app.get(
  "/workflow/executions/:workflowId",
  authMiddleware,
  async (req, res) => {
    const executions = await ExecutionModel.find({
      workflowId: req.params.workflowId, userId: req.userid
    }); 
    res.json(executions);
  }
);

app.get("/nodes", async (req, res) => {
  const nodes = await NodesModel.find();
  res.json(nodes);
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});
