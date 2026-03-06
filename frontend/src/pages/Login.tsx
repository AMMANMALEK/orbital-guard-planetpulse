import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Satellite, Eye, EyeOff, FlaskConical } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const TEST_ACCOUNTS = [
  { label: 'Admin', email: 'admin@test.com', password: 'admin123', color: 'text-purple-400 border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20' },
  { label: 'Officer', email: 'officer@test.com', password: 'officer123', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20' },
  { label: 'Viewer', email: 'viewer@test.com', password: 'viewer123', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20' },
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const role = await login(email, password);
      navigate(`/${role}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillAndLogin = async (acc: typeof TEST_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setLoading(true);
    try {
      const role = await login(acc.email, acc.password);
      navigate(`/${role}`);
    } catch {
      toast.error('Test login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Satellite className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">PlanetPulse</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        {/* Demo credentials banner */}
        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-yellow-400 text-xs font-bold uppercase tracking-wider">
            <FlaskConical className="h-4 w-4" />
            Demo Test Accounts — click to login instantly
          </div>
          <div className="grid grid-cols-3 gap-2">
            {TEST_ACCOUNTS.map(acc => (
              <button
                key={acc.label}
                type="button"
                onClick={() => fillAndLogin(acc)}
                disabled={loading}
                className={`rounded-lg border px-3 py-2 text-xs font-bold transition-all disabled:opacity-50 ${acc.color}`}
              >
                <div>{acc.label}</div>
                <div className="font-mono text-[10px] opacity-70 mt-0.5">{acc.email}</div>
                <div className="font-mono text-[10px] opacity-70">{acc.password}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="admin@test.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-sm text-muted-foreground">Don't have an account? <Link to="/register" className="text-primary hover:underline">Register</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
