import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
  },
});

const EdgesSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    source: {
      type: String,
      required: true,
    },
    target: {
      type: String,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const PositonSchema = new Schema(
  {
    x: {
      type: Number,
      required: true,
    },
    y: {
      type: Number,
      required: true,
    },
  },
  {
    _id: false,
  }
);

const NodeDataSchema = new Schema(
  {
    kind: { 
        type: String, enum: ["TRIGGER", "ACTION"]
     },
    metadata: Schema.Types.Mixed,
  },
  {
    _id: false,
  }
);
const WorkflowNodesSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    position: PositonSchema,
    credentials: Schema.Types.Mixed,
    nodeId: {
      type: mongoose.Types.ObjectId,
      ref: "Nodes",
    },
    data: NodeDataSchema,
  },
  {
    _id: false,
  }
);

const WorkflowSchema = new Schema({
  userid: {
    type: mongoose.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  nodes: [WorkflowNodesSchema],
  edges: [EdgesSchema],
});
const CredentialsTypeSchema = new Schema({
    title: {type: String,required: true},
    required: {type: Boolean,required: true},
});
const NodesSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ["TRIGGER", "ACTION"],
        required: true,
    },
    credentialsType:[CredentialsTypeSchema]

});

const ExecutionSchema = new Schema({
    workflowId: {
    type: mongoose.Types.ObjectId,
    required: true, 
    ref: "Workflows",
    },
    status: {
    type: String,
    enum: ["pending", "failed", "success"],
    },
    starttime: {
    type: Date,
    default: Date.now(),
    required: true,
    },  
    endtime: {
    type: Date,     
    }   
});    
export const UserModel = mongoose.model("User", UserSchema);
export const WorkflowModel = mongoose.model("Workflows", WorkflowSchema);
export const NodesModel = mongoose.model("Nodes", NodesSchema);
export const ExecutionModel = mongoose.model("Executions", ExecutionSchema);
