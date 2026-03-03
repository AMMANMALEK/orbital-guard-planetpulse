import { Download, FileText } from 'lucide-react';

const reports = [
  { title: 'Annual Environmental Impact Report 2025', date: '2026-01-15', size: '2.4 MB' },
  { title: 'Western Ghats Mining Activity Summary', date: '2026-02-28', size: '1.8 MB' },
  { title: 'NDVI Change Detection – Quarterly Report', date: '2026-03-01', size: '3.1 MB' },
  { title: 'Sundarbans Ecosystem Health Assessment', date: '2026-02-15', size: '2.7 MB' },
  { title: 'National Deforestation Trends 2025-2026', date: '2026-03-03', size: '4.2 MB' },
];

const PublicReports = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">Public Reports</h1>
      <p className="text-muted-foreground">Download environmental monitoring reports</p>
    </div>
    <div className="space-y-4">
      {reports.map((r, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-card-foreground">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{r.date} • {r.size}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <Download className="h-4 w-4" /> Download
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default PublicReports;
