/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ReactFlow, applyNodeChanges, applyEdgeChanges, addEdge, MiniMap, Controls, Background } from '@xyflow/react';
import './flow.css';
import { TriggerSheet } from './TriggerSheet';
import { PriceTrigger } from '@/nodes/triggers/PriceTrigger';
import { timer } from '@/nodes/triggers/timer';
import { lighter } from '@/nodes/actions/lighter';
import { ActionSheet } from './ActionSheet';
import { hyperliquid } from '@/nodes/actions/hyperliquid';
import { backpack } from '@/nodes/actions/backpack';
import { Button } from './ui/button';
import { type PriceTriggerMetadata, type TimerNodeMetadata, type Tradingmetadata } from 'common/types';
import { apiCreateWorkflow, apiListWorkflows, apiGetWorkflow, apiUpdateWorkflow } from '@/lib/http';


const nodeTypes = {
  "price-trigger": PriceTrigger,
  "timer": timer,
  "lighter": lighter,
  "hyper-liquid": hyperliquid,
  "backpack": backpack
};

export type Nodekind = "timer" | "price-trigger" | "hyper-liquid" | "backpack" | "lighter";
interface Nodetype {
  type: Nodekind,
  data: {
    kind: "action" | "trigger",
    metadata: NodeMetadata
  },
  id: string,
  position: { x: number, y: number },
}
export type NodeMetadata = Tradingmetadata | PriceTriggerMetadata | TimerNodeMetadata;
interface Edge {
  style: { stroke: string; strokeWidth: number; }; id: string,
  source: string,
  target: string,
}

export function CreateWorkflow() {
  const [nodes, setNodes] = useState<Nodetype[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('Ready');
  const [isRunning, setIsRunning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [workflows, setWorkflows] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<{
    position: {
      x: number,
      y: number,
    },
    startingNodeId: string,
  } | null>(null);
  const [isTriggerSheetOpen, setIsTriggerSheetOpen] = useState(true);

  // Load workflows from MongoDB backend on mount
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        const data = await apiListWorkflows();
        const formattedWorkflows = data.map((w: any) => ({
          id: w._id,
          name: w.name || `Workflow ${w._id.slice(0, 6)}`
        }));
        setWorkflows(formattedWorkflows);
        if (formattedWorkflows.length > 0) {
          setSelectedWorkflow(formattedWorkflows[0].id);
        }
      } catch (error) {
        console.error('Failed to load workflows:', error);
      }
    };
    loadWorkflows();
  }, []);

  // Load selected workflow details
  useEffect(() => {
    if (!selectedWorkflow) {
      // Clear state for new workflow
      setNodes([]);
      setEdges([]);
      setStatus('Ready');
      return;
    }
    const fetchWorkflow = async () => {
      try {
        const wf = await apiGetWorkflow(selectedWorkflow);
        if (wf) {
          // Map backend nodes to frontend format
          const mappedNodes = wf.nodes.map((n: any) => ({
            ...n,
            data: {
              ...n.data,
              kind: n.data.kind.toLowerCase()
            }
          }));
          setNodes(mappedNodes);
          setEdges(wf.edges as any);
        }
      } catch (error) {
        console.error('Failed to load workflow details:', error);
      }
    };
    fetchWorkflow();
  }, [selectedWorkflow]);

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nodesSnapshot) => {
      const newNodes = applyNodeChanges(changes, nodesSnapshot);
      setSelectedIds(newNodes.filter((n: any) => n.selected).map((n: any) => n.id));
      return newNodes;
    }),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: any) => setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: any) => setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  const POSITION_OFFSET = 50;
  const onConnectEnd = useCallback(
    (_params: any, connectionInfo: any) => {
      if (!connectionInfo.isValid) {
        console.log(connectionInfo)
        setSelectedAction({
          startingNodeId: connectionInfo.fromNode.id,
          position: {
            x: connectionInfo.from.x + POSITION_OFFSET,
            y: connectionInfo.from.y + POSITION_OFFSET,
          }
        });
        console.log(connectionInfo.fromNode.id);
        console.log(connectionInfo.fromNode.to);
      }
    },
    []
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Delete') {
        if (selectedIds.length) {
          setNodes(prev => prev.filter(n => !selectedIds.includes(n.id)));
          setEdges(prev => prev.filter(e => !selectedIds.includes(e.source) && !selectedIds.includes(e.target)));
          setSelectedIds([]);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveWorkflow();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, nodes, edges, selectedWorkflow]); // Added deps for saveWorkflow closure

  useEffect(() => {
    function onResize() {
      setSidebarCollapsed(window.innerWidth < 1024);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  async function saveWorkflow() {
    setIsSaving(true);
    setStatus('Saving...');
    try {
      // Map nodes to match backend schema
      const mappedNodes = nodes.map(n => ({
        ...n,
        credentials: {},
        data: {
          ...n.data,
          kind: n.data.kind.toUpperCase()
        }
      }));

      if (selectedWorkflow) {
        // Update existing
        await apiUpdateWorkflow(selectedWorkflow, { nodes: mappedNodes, edges });
        setStatus('Saved');
      } else {
        // Create new
        const res = await apiCreateWorkflow({ nodes: mappedNodes, edges });
        // Update workflows list with the new workflow
        const wf = { id: res.id, name: `Workflow ${res.id.slice(0, 6)}` };
        const next = [wf, ...workflows];
        setWorkflows(next);
        setSelectedWorkflow(wf.id);
        setStatus('Saved');
      }
    } catch (e) {
      console.error(e);
      setStatus('Save failed');
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatus('Ready'), 1200);
    }
  }

  async function runWorkflow() {
    setIsRunning(true);
    const start = performance.now();
    setStatus('Running...');
    // animate edges
    setEdges(prev => prev.map(e => ({ ...e, animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } })));
    try {
      // Simulate run
      await new Promise(r => setTimeout(r, 1500));
      const dur = ((performance.now() - start) / 1000).toFixed(2);
      setStatus(`Completed in ${dur}s`);
    } catch (e) {
      setStatus('Run failed');
    } finally {
      setIsRunning(false);
      setEdges(prev => prev.map(e => ({ ...e, animated: false, style: { stroke: '#3b82f6', strokeWidth: 2 } })));
      setTimeout(() => setStatus('Ready'), 2000);
    }
  }
  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b bg-gradient-to-r from-primary/10 via-transparent to-secondary/5">
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2" onClick={() => setSidebarCollapsed(s => !s)} aria-label="toggle sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <Link to="/dashboard" className="text-sm text-foreground/80 mr-2">← Back</Link>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Workflow Builder</h1>
            <span className="text-sm text-foreground/60">Design automations visually</span>
          </div>
          <div className="ml-4">
            <select
              value={selectedWorkflow ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedWorkflow(val === "" ? null : val);
              }}
              className="px-2 py-1 rounded"
            >
              <option value="">New Workflow</option>
              {workflows.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setNodes([]); setEdges([]); setStatus('Ready'); setSelectedWorkflow(null); }}>Clear</Button>
          <Button size="sm" onClick={saveWorkflow} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save'}</Button>
          <Button size="sm" onClick={runWorkflow} disabled={isRunning}>{isRunning ? 'Running...' : 'Run'}</Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`${sidebarCollapsed ? 'hidden md:block' : 'block'} w-80 min-w-[18rem] border-r bg-gradient-to-b from-muted to-transparent p-4`}>
          <div className="rounded-md p-3 shadow-sm bg-card/60">
            <h2 className="text-sm font-medium">Actions</h2>
            <p className="text-xs text-muted-foreground mt-2">Drag triggers and actions into the canvas or connect nodes to build flows.</p>
          </div>
          <div className="mt-4">
            <TriggerSheet
              open={isTriggerSheetOpen}
              setOpen={setIsTriggerSheetOpen}
              onSelect={(type, metadata) => {
                setNodes(prev => ([...prev, {
                  id: Math.random().toString(),
                  type,
                  data: {
                    kind: "trigger",
                    metadata,
                  },
                  position: { x: 0, y: 0 },
                }]));
              }}
            />
          </div>
          <div className="mt-4 border-t pt-4">
            <Button
              className="w-full"
              onClick={() => setIsTriggerSheetOpen(true)}
            >
              Create Trigger
            </Button>
          </div>
        </aside>

        <main className="flex-1 relative">
          {!nodes.length && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              <div className="text-center opacity-80">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="mx-auto mb-3"><path d="M12 2v6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M6 8l6 6 6-6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                <div className="text-xl font-medium">Click Trigger to start</div>
                <a
                  className="text-blue-500 hover:text-blue-700 cursor-pointer"
                  onClick={() => setIsTriggerSheetOpen(true)}
                >
                  Create Trigger
                </a>
                <div className="text-sm text-muted-foreground mt-2">Use the Actions panel to add nodes</div>
              </div>
            </div>
          )}

          {selectedAction && <ActionSheet onSelect={(type, metadata) => {
            const nodeId = Math.random().toString();
            setNodes(prev => ([...prev, {
              id: nodeId,
              type,
              data: {
                kind: "action",
                metadata,
              },
              position: selectedAction.position
            }]));
            setEdges(prev => ([...prev, {
              id: `${selectedAction.startingNodeId}-${nodeId}`,
              source: selectedAction.startingNodeId,
              target: nodeId,
              style: { stroke: '#3b82f6', strokeWidth: 2 }
            }]));
            setSelectedAction(null);
          }} />}

          <div className="absolute inset-0">
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges.map(e => ({ ...e, style: e.style || { stroke: '#3b82f6', strokeWidth: 2 } }))}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectEnd={onConnectEnd}
              fitView
            >
              <MiniMap
                maskColor="var(--background)"
                nodeStrokeColor="var(--foreground)"
                nodeColor="var(--muted)"
                className="!bg-muted/50"
                zoomable
                pannable
              />
              <Controls />
              <Background />
            </ReactFlow>
          </div>
        </main>
      </div>

      <footer className="h-10 border-t flex items-center px-4 text-sm">
        <div className="flex-1 text-muted-foreground">Status: <span className="font-medium">{status}</span></div>
        <div className="text-xs text-muted-foreground">{selectedIds.length ? `${selectedIds.length} selected` : ''}</div>
      </footer>
    </div>
  );

}