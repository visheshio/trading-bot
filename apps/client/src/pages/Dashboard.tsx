/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { apiListWorkflows, setAuthToken, apiListExecution } from '@/lib/http';

interface Workflow {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  executions: number;
  lastRun?: string;
}

export function Dashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    // Fetch workflows from MongoDB backend
    const fetchWorkflows = async () => {
      try {
        const workflows = await apiListWorkflows();
        const workflowsWithDetails = await Promise.all(
          workflows.map(async (item: any) => {
            let executions: any[] = [];
            try {
              executions = await apiListExecution(item._id);
            } catch (err) {
              console.error(`Failed to fetch executions for workflow ${item._id}`, err);
            }

            // Find the most recent execution date
            let lastRunStr = undefined;
            if (executions.length > 0) {
              const dates = executions
                .map((e: any) => new Date(e.createdAt || e.date || 0).getTime()) // Adjust based on actual execution object structure
                .filter((d) => !isNaN(d));
              if (dates.length > 0) {
                lastRunStr = new Date(Math.max(...dates)).toLocaleDateString();
              }
            }

            return {
              id: item._id,
              name: item.name || `Workflow ${item._id.slice(0, 6)}`,
              status: 'active' as const, // You might want to derive this from real data too if available
              executions: executions.length,
              lastRun: lastRunStr,
            };
          })
        );
        setWorkflows(workflowsWithDetails);
      } catch (error) {
        console.error('Failed to load workflows:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const toggleTheme = () => setIsDark(!isDark);

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 dark:text-green-400';
      case 'inactive': return 'text-gray-500 dark:text-gray-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-screen h-screen bg-background text-foreground flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b bg-muted/20">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your trading workflows</p>
        </div>
        <div className="flex gap-3">
          <Link to="/create-workflow">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90"> New Workflow</Button>
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 text-sm border border-border rounded hover:bg-muted transition-colors"
            title="Toggle Theme"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <button
            onClick={() => {
              setAuthToken(null);
              window.location.href = '/';
            }}
            className="px-4 py-2 text-sm border border-border rounded hover:bg-muted text-foreground"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-muted-foreground">Loading workflows...</div>
          </div>
        ) : workflows.length === 0 ? (
          <div className="flex items-center justify-left h-full">
            <div className="text-center">
              <div className="text-4xl mb-4">📋</div>
              <h2 className="text-xl font-medium text-foreground mb-2">No Workflows Yet</h2>
              <p className="text-muted-foreground mb-6">Create your first trading workflow to get started</p>
              <Link to="/create-workflow">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Create Workflow</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-sm"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{workflow.name}</h3>
                    <div className={`text-sm mt-1 ${getStatusColor(workflow.status)}`}>
                      ● {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Executions</span>
                    <span className="text-foreground font-medium">{workflow.executions}</span>
                  </div>
                  {workflow.lastRun && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Last Run</span>
                      <span className="text-foreground font-medium">{workflow.lastRun}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link to={`/workflow/${workflow.id}`} className="flex-1">
                    <Button size="sm" variant="dashboard" className="w-full">View</Button>
                  </Link>
                  <Link to={`/workflow/${workflow.id}/executions`} className="flex-1">
                    <Button size="sm" variant="dashboard" className="w-full">Executions</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
