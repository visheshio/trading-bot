
import { execute as executelighter } from "./executors/lighter";
export type NodeDocument = {
    id: string;
    type:string;     
    credentials?: any;
    data: {
        metadata?: any;
        kind?: "TRIGGER" | "ACTION" | null | undefined;
    };
    nodeId:string;
};

type EdgeDocument={
    source:string;
    target:string;
}


export async function execute(nodes:NodeDocument[],edges:EdgeDocument[]){
    const trigger = nodes.find(x => x.data.kind ==="TRIGGER");
    if (!trigger){
        return;
    }
    await executeRecursive(trigger?.id,nodes,edges);
}

export async function executeRecursive(sourceId:string,nodes:NodeDocument[],edges:EdgeDocument[]) {
    const nodesToExecute = edges.filter(({source,target})=> source === sourceId).map(({target}) => target);

    await Promise.all(nodesToExecute.map(async (nodeClientId) =>{
        const node = nodes.find(({id}) => id === nodeClientId);
        if(!node) {
            return;
        }
        switch(node.type ){
            case "lighter":
               await executelighter(node.data.metadata.asset,node.data.metadata.quantity,node.data.metadata.type,node.credentials.api_key);
            }
    }))

    await Promise.all(nodesToExecute.map(id => executeRecursive(id,nodes,edges)))
}
