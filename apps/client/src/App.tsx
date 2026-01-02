
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@xyflow/react/dist/style.css';
import { CreateWorkflow } from './components/CreateWorkflow';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { WorkflowDetails } from './pages/WorkflowDetails';
import { WorkflowExecution } from './pages/WorkflowExecution';

import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const isDark = localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create-workflow" element={<CreateWorkflow />} />
        <Route path="/workflow/:id" element={<WorkflowDetails />} />
        <Route path="/workflow/:id/executions" element={<WorkflowExecution />} />
      </Routes>
    </BrowserRouter>
  </div>

}