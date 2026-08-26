import {WorkflowModel,ExecutionModel} from 'db';
import { execute } from './execute';
import mongoose from "mongoose";

const POLLING_INTERVAL_MS = Number(process.env.POLLING_INTERVAL_MS) || 5000;

async function main() {

    await mongoose.connect(process.env.MONGO_URL!);
    while (1) {
        const workflows = await WorkflowModel.find({});
        await Promise.all(workflows.map(async (workflow: any) => {
            const trigger = workflow.nodes.find((x: any) => x.data?.kind === "TRIGGER");
            
            if (!trigger) {
                return;
            }

            switch (trigger?.type) {
                case "timer":
                    const timeinS = trigger.data?.metadata?.time;
                    const execution = await ExecutionModel.findOne({
                        workflowId: workflow.id,
                    }).sort({
                        starttime: "desc"
                    });

                    if (!execution || new Date(execution.starttime).getTime() <= Date.now() - (timeinS * 1000)) {
                        const newExecution = await ExecutionModel.create({
                            workflowId: workflow.id,
                            status: "pending",
                            starttime: new Date()
                        });

                        try {
                            await execute(workflow.nodes, workflow.edges);
                            newExecution.endtime = new Date();
                            newExecution.status = "success";
                            await newExecution.save();
                        } catch (err) {
                            console.error("Execution error:", err);
                            newExecution.endtime = new Date();
                            newExecution.status = "failed";
                            await newExecution.save();
                        }
                    }
                    break;
            }
        }));

        // Sleep to avoid high CPU usage and tight polling loop
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
    }
}

main()