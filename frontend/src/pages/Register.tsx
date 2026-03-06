import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Satellite } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const role = await register(name, email, password);
      navigate(`/${role}`);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <Satellite className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">PlanetPulse</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Arjun Mehta" />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="you@planetpulse.io" />
          </div>
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-1.5">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};

export default Register;
