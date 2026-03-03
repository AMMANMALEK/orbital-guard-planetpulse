import { useState } from 'react';
import { users as initialUsers } from '@/data/mockData';
import { Plus, Trash2, Edit, RotateCcw } from 'lucide-react';
import RiskBadge from '@/components/RiskBadge';
import type { MockUser } from '@/data/mockData';

const UserManagement = () => {
  const [userList] = useState<MockUser[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage system users and roles</p>
        </div>
        <button onClick={() => setShowModal(!showModal)} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Create User
        </button>
      </div>

      {showModal && (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-lg font-semibold text-card-foreground">Create New User</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input placeholder="Full Name" className="rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <input placeholder="Email" className="rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
            <select className="rounded-lg border border-input bg-background px-4 py-2.5 text-foreground focus:border-primary focus:outline-none">
              <option value="admin">Admin</option><option value="officer">Officer</option><option value="viewer">Viewer</option>
            </select>
            <input placeholder="Assign Region" className="rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none" />
          </div>
          <div className="flex gap-3">
            <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Save User</button>
            <button onClick={() => setShowModal(false)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Name</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Email</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Role</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Region</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Status</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Last Login</th>
                <th className="px-4 py-3 text-left text-muted-foreground font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {userList.map(u => (
                <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-card-foreground font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize">{u.role}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.region}</td>
                  <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${u.status === 'active' ? 'bg-risk-low/20 text-risk-low' : 'bg-muted text-muted-foreground'}`}>{u.status}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{u.lastLogin}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="rounded p-1.5 hover:bg-muted text-muted-foreground"><Edit className="h-4 w-4" /></button>
                      <button className="rounded p-1.5 hover:bg-muted text-muted-foreground"><RotateCcw className="h-4 w-4" /></button>
                      <button className="rounded p-1.5 hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
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
