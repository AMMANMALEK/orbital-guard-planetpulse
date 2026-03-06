import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, FileText } from 'lucide-react';
import { monthlyDetections, ndviData, deforestationTrend } from '@/data/mockData';

const tooltipStyle = { backgroundColor: 'hsl(220,22%,10%)', border: '1px solid hsl(215,20%,18%)', borderRadius: '8px', color: '#e2e8f0' };

const Reports = () => (
  <div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Data & Reports</h1>
        <p className="text-muted-foreground">Analytics, trends, and exportable reports</p>
      </div>
      <div className="flex gap-2">
        <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Download className="h-4 w-4" /> Export PDF
        </button>
        <button className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted">
          <FileText className="h-4 w-4" /> Export CSV
        </button>
      </div>
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Detection Breakdown</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyDetections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="mining" fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="deforestation" fill="#f59e0b" radius={[4,4,0,0]} />
            <Bar dataKey="encroachment" fill="#06b6d4" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">NDVI Trend Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ndviData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="ndvi" stroke="#10b981" strokeWidth={2} name="Current NDVI" />
            <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Baseline" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Deforestation Area Trend (sq km)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={deforestationTrend}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="area" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default Reports;
