import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, AlertTriangle, Shield, MessageSquare, CheckCircle2, UserPlus, MapPin, Trash2, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import StatCard from '@/components/StatCard';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreateOfficerModal } from '@/components/admin/CreateOfficerModal';
import { ManageRegionsModal } from '@/components/admin/ManageRegionsModal';
import api from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

interface Stats {
  total_detections: number;
  active_alerts: number;
  pending_complaints: number;
  resolved_alerts: number;
  risk_distribution?: { name: string; value: number }[];
  monthly_trends?: { month: string; detections: number }[];
}

interface Alert {
  id: string;
  message: string;
  region: string;
  severity: 'high' | 'medium' | 'low';
  status: string;
  date: string;
}

const AdminDashboard = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [officers, setOfficers] = useState<any[]>([]);
  const [unassignedComplaints, setUnassignedComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, usersRes, complaintsRes] = await Promise.all([
        api.get('/stats'),
        api.get('/alerts?limit=5'),
        api.get('/users'),
        api.get('/complaints')
      ]);
      setStats(statsRes.data);
      setRecentAlerts(alertsRes.data);
      setOfficers(usersRes.data.filter((u: any) => u.role === 'officer'));
      setUnassignedComplaints(complaintsRes.data.filter((c: any) => c.status === 'pending_admin_assignment'));
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (complaintId: string, officerId: string) => {
    try {
      await api.patch(`/complaints/${complaintId}/status`, {
        assigned_officer_id: officerId,
        status: 'assigned'
      });
      toast.success('Complaint assigned successfully');
      fetchData();
    } catch {
      toast.error('Failed to assign complaint');
    }
  };

  const handleDeleteOfficer = async (officerId: string, officerName: string) => {
    if (!confirm(`Are you sure you want to delete officer ${officerName}? This will unassign their active complaints.`)) return;
    
    try {
      await api.delete(`/users/${officerId}`);
      toast.success('Officer deleted successfully');
      fetchData();
    } catch {
      toast.error('Failed to delete officer');
    }
  };

  const chartRiskData = (stats?.risk_distribution && stats.risk_distribution.length > 0
    ? stats.risk_distribution
    : [
        { name: 'High Risk', value: 0 },
        { name: 'Medium Risk', value: 0 },
        { name: 'Low Risk', value: 0 },
      ]
  ).filter(r => r.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">System overview and monitoring status</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add New Officer
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Detections" value={stats?.total_detections ?? '—'} icon={Scan} trend="+12% this month" trendUp />
        <StatCard title="Active Alerts" value={stats?.active_alerts ?? '—'} icon={AlertTriangle} trend="System alerts" />
        <StatCard title="Pending Complaints" value={stats?.pending_complaints ?? '—'} icon={MessageSquare} trend="Citizen reports" />
        <StatCard title="Resolved Incidents" value={stats?.resolved_alerts ?? '—'} icon={CheckCircle2} trend="Closed cases" />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-muted/20 border border-border/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="officers">Officer Management ({officers.length})</TabsTrigger>
          <TabsTrigger value="unassigned">Unassigned Queue ({unassignedComplaints.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Monthly Detections</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats?.monthly_trends || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Line type="monotone" dataKey="detections" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Risk Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartRiskData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                    labelLine={(props: any) => props.percent > 0 ? <line {...props} /> : <></>}>
                    {chartRiskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Global Monitoring Map</h3>
            </div>
            <MapView className="h-[450px]" filterRegion={selectedRegion} />
          </motion.div>
        </TabsContent>

        <TabsContent value="officers">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {officers.map(officer => (
              <motion.div 
                key={officer.id} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-xl border border-border bg-card p-6 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-semibold text-card-foreground">{officer.name}</h4>
                    <p className="text-xs text-muted-foreground">{officer.email}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary" className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[10px] h-5">
                      {officer.active_complaints_count || 0} Pending
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5">
                      {officer.resolved_complaints_count || 0} Resolved
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <MapPin className="h-3 w-3" />
                    Jurisdiction Coverage
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                    {officer.assigned_locations?.map((loc: any, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-[10px] bg-muted/30">
                        {loc.city}, {loc.state}
                      </Badge>
                    ))}
                    {(!officer.assigned_locations || officer.assigned_locations.length === 0) && (
                      <span className="text-xs text-muted-foreground italic">No regions assigned</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between gap-2">
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/5 grow"
                      onClick={() => {
                        setSelectedOfficer(officer);
                        setIsManageModalOpen(true);
                      }}
                   >
                      Manage Regions
                   </Button>
                   <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-xs text-destructive hover:bg-destructive/5 px-2"
                      onClick={() => handleDeleteOfficer(officer.id, officer.name)}
                   >
                      <Trash2 className="h-3.5 w-3.5" />
                   </Button>
                </div>
              </motion.div>
            ))}
            {officers.length === 0 && (
              <div className="col-span-full py-12 text-center bg-muted/10 rounded-xl border border-dashed border-border">
                <Shield className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No regional officers registered.</p>
                <Button variant="link" onClick={() => setIsModalOpen(true)}>Create the first officer</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="unassigned">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
             <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
                <h3 className="font-semibold text-sm">Complaints Needing Assignment</h3>
                <Badge variant="outline">{unassignedComplaints.length} Pending</Badge>
             </div>
             <div className="divide-y divide-border">
                {unassignedComplaints.map(complaint => (
                  <div key={complaint.id} className="p-4 flex items-center justify-between hover:bg-muted/5 transition-colors">
                    <div className="flex items-center gap-4">
                      {complaint.complaint_images?.[0] ? (
                        <img src={complaint.complaint_images[0]} className="h-12 w-12 rounded object-cover border border-border shadow-sm" />
                      ) : (
                        <div className="h-12 w-12 rounded bg-muted flex items-center justify-center border border-border">
                           <MapPin className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                           <p className="text-sm font-semibold">{complaint.violation_type}</p>
                           <Badge className="text-[10px] h-4 bg-primary/10 text-primary border-none">
                              {complaint.city}, {complaint.state}
                           </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">Reported by {complaint.submittedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select onValueChange={(val) => handleAssign(complaint.id, val)}>
                         <SelectTrigger className="w-[180px] h-8 text-[11px] bg-background">
                            <SelectValue placeholder="Quick Assign..." />
                         </SelectTrigger>
                         <SelectContent>
                            {officers.map(off => (
                              <SelectItem key={off.id} value={off.id} className="text-xs">
                                {off.name} ({off.active_complaints_count || 0} active)
                              </SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-8 text-xs">View</Button>
                    </div>
                  </div>
                ))}
                {unassignedComplaints.length === 0 && (
                  <div className="text-center py-16">
                     <CheckCircle2 className="h-10 w-10 text-green-500/20 mx-auto mb-3" />
                     <p className="text-muted-foreground text-sm font-medium">All clear! No unassigned complaints.</p>
                  </div>
                )}
             </div>
          </div>
        </TabsContent>
      </Tabs>

      <CreateOfficerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData}
      />

      <ManageRegionsModal
        isOpen={isManageModalOpen}
        onClose={() => {
          setIsManageModalOpen(false);
          setSelectedOfficer(null);
        }}
        onSuccess={fetchData}
        officer={selectedOfficer}
      />
    </div>
  );
};

export default AdminDashboard;
