import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/lib/api';
import OfficerRegionSelector from '@/components/OfficerRegionSelector';
import OfficerLocationPreview from '@/components/OfficerLocationPreview';
import { Badge } from '@/components/ui/badge';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  assigned_region?: {
    name: string;
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'inactive';
  lastLogin: string;
}

// Local demo store (used when backend unavailable)
let demoUsers: User[] = [];

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'officer',
    assigned_region: null as { name: string; latitude: number; longitude: number } | null,
  });

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      setIsDemo(false);
    } catch {
      // Backend unavailable – use local demo store
      setIsDemo(true);
      setUsers([...demoUsers]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.email) {
      toast.error('Name and Email are required');
      return;
    }

    if (isDemo) {
      // Local demo mode
      const newUser: User = {
        id: 'demo-' + Date.now(),
        name: formData.name,
        email: formData.email,
        role: 'officer',
        assigned_region: formData.assigned_region || undefined,
        status: 'active',
        lastLogin: 'Never',
      };
      demoUsers = [...demoUsers, newUser];
      setUsers([...demoUsers]);
      toast.success('User created (demo mode)');
      setShowModal(false);
      resetForm();
      return;
    }

    try {
      await api.post('/users', { ...formData, role: 'officer' });
      toast.success('User created successfully');
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to create user'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    if (isDemo || id.startsWith('demo-')) {
      demoUsers = demoUsers.filter(u => u.id !== id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('User deleted');
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: any) {
      toast.error(getErrorMessage(err, 'Failed to delete user'));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', role: 'officer', assigned_region: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage environment officers</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Add Officer
        </button>
      </div>

      {isDemo && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-xs text-yellow-400">
          ⚠️ Demo mode — users are stored locally and won't persist after reload.
        </div>
      )}

      {showModal && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">Add Environment Officer</h3>
            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
              <input
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="officer@agency.gov"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                placeholder="Min. 6 characters"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</label>
              <div className="w-full rounded-lg border border-input bg-muted/30 px-4 py-2.5 text-foreground text-sm font-medium">
                🌿 Environment Officer
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Region Deployment</label>
              <OfficerRegionSelector 
                value={formData.assigned_region}
                onRegionChange={(region) => setFormData({ ...formData, assigned_region: region })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all font-bold"
            >
              <Check className="h-4 w-4" /> Create Officer Account
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto text-card-foreground">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Name</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Email</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Role</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Region</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground">Last Login</th>
                <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-muted-foreground">No officers found. Click "Add Officer" to create one.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-primary/[0.02] transition-colors">
                  <td className="px-6 py-4 font-bold text-foreground">{u.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter bg-emerald-500/10 text-emerald-500">
                      Environment Officer
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground font-medium">{u.assigned_region?.name || 'Unassigned'}</span>
                      {u.assigned_region && (
                        <div className="mt-1 flex items-center gap-2">
                          <OfficerLocationPreview 
                            officerName={u.name}
                            regionName={u.assigned_region.name}
                            latitude={u.assigned_region.latitude}
                            longitude={u.assigned_region.longitude}
                          />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      <span className={`h-1 w-1 rounded-full ${u.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-[10px]">{u.lastLogin || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="rounded-lg p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete Officer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
