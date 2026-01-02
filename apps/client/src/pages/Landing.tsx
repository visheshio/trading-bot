import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function Landing() {
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-2xl font-bold text-white">Trading Bot</h1>
        <Link to="/auth">
          <Button variant="outline" size="sm">Sign In</Button>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl px-6">
          <h2 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600">
            Automate Your Trading Workflows
          </h2>

          <p className="text-lg text-white/70 mb-8">

            Design, execute, and monitor trading workflows with a visual workflow builder. Connect triggers and actions to create automated trading strategies.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-12">
            <div className="bg-white/5 backdrop-blur p-4 rounded-lg border border-white/10">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold text-white mb-2">Fast Execution</h3>
              <p className="text-sm text-white/60">Real-time trading automation</p>
            </div>
            <div className="bg-white/5 backdrop-blur p-4 rounded-lg border border-white/10">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="font-semibold text-white mb-2">Visual Builder</h3>
              <p className="text-sm text-white/60">Drag & drop workflow designer</p>
            </div>
            <div className="bg-white/5 backdrop-blur p-4 rounded-lg border border-white/10">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-white mb-2">Analytics</h3>
              <p className="text-sm text-white/60">Track execution and performance</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="outline">View Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-sm text-white/50">
        © 2025 Trading Bot. All rights reserved.
      </footer>
    </div>
  );
}
