import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Plus, Trash2, Edit, RotateCcw, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { MockUser, UserRole } from '@/data/mockData';

const UserManagement = () => {
  const { users, addUser, updateUser, deleteUser } = useAppContext();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'officer' as UserRole,
    region: ''
  });

  const handleCreate = () => {
    if (!formData.name || !formData.email) {
      toast.error("Name and Email are required");
      return;
    }
    addUser(formData);
    toast.success("User created successfully");
    setShowModal(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (editingId) {
      updateUser(editingId, formData);
      toast.success("User updated successfully");
      setEditingId(null);
      resetForm();
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      deleteUser(id);
      toast.success("User deleted");
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'officer', region: '' });
  };

  const startEdit = (user: MockUser) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      region: user.region
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and roles</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Create User
        </button>
      </div>

      {showModal && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-card-foreground">
              {editingId ? 'Edit User' : 'Create New User'}
            </h3>
            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
              <input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Full Name"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
              <input
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="Email"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Role</label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value as UserRole })}
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              >
                <option value="admin">Admin</option>
                <option value="officer">Officer</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Assigned Region</label>
              <input
                value={formData.region}
                onChange={e => setFormData({ ...formData, region: e.target.value })}
                placeholder="Assign Region"
                className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={editingId ? handleUpdate : handleCreate}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all font-bold"
            >
              <Check className="h-4 w-4" /> {editingId ? 'Update Settings' : 'Initialize Account'}
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors font-bold"
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
                <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-widest text-muted-foreground text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-6 py-4 font-bold text-foreground">{u.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                      u.role === 'admin' ? "bg-primary/10 text-primary" :
                        u.role === 'officer' ? "bg-blue-500/10 text-blue-500" : "bg-muted text-muted-foreground"
                    )}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-medium">{u.region}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter",
                      u.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'
                    )}>
                      <span className={cn("h-1 w-1 rounded-full", u.status === 'active' ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground font-mono text-[10px]">{u.lastLogin}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => startEdit(u)}
                        className="rounded-lg p-2 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="rounded-lg p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        title="Delete User"
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

// Simple utility for classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default UserManagement;
