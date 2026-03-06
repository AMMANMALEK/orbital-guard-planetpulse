import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { monthlyDetections, riskDistribution, deforestationTrend, ndviData, monthlyMiningActivity, riverEncroachmentGrowth } from '@/data/mockData';

const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];
const ts = { backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--card-foreground))' };

const ViewerCharts = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Environmental Charts</h1>
      <p className="text-muted-foreground">Public analytics and trends</p>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Monthly Detections</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyDetections}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip contentStyle={ts} />
            <Bar dataKey="detections" fill="#10b981" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={riskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
              {riskDistribution.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip contentStyle={ts} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Deforestation Trend (sq km)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={deforestationTrend}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip contentStyle={ts} />
            <Line type="monotone" dataKey="area" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Monthly Mining Activity</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyMiningActivity}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip contentStyle={ts} />
            <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">River Encroachment Growth (ha)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={riverEncroachmentGrowth}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip contentStyle={ts} />
            <Line type="monotone" dataKey="area" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">NDVI Health Index</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={ndviData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip contentStyle={ts} />
            <Line type="monotone" dataKey="ndvi" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} name="NDVI" />
            <Line type="monotone" dataKey="baseline" stroke="#94a3b8" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Baseline" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

export default ViewerCharts;
