// Static type definitions (kept for compatibility with remaining pages)
export type UserRole = 'admin' | 'officer' | 'viewer';
export type RiskLevel = 'high' | 'medium' | 'low';
export type DetectionType = 'illegal-mining' | 'deforestation' | 'river-encroachment';
export type ComplaintStatus = 'pending' | 'investigating' | 'resolved' | 'rejected';
export type ViolationType = 'illegal-mining' | 'deforestation' | 'river-encroachment' | 'pollution' | 'other';

// Static chart data (historical trends – not strictly tied to live DB for this hackathon)
export const monthlyDetections = [
  { month: 'Sep', detections: 142, mining: 45, deforestation: 67, encroachment: 30 },
  { month: 'Oct', detections: 198, mining: 58, deforestation: 89, encroachment: 51 },
  { month: 'Nov', detections: 234, mining: 72, deforestation: 102, encroachment: 60 },
  { month: 'Dec', detections: 278, mining: 85, deforestation: 118, encroachment: 75 },
  { month: 'Jan', detections: 312, mining: 94, deforestation: 134, encroachment: 84 },
  { month: 'Feb', detections: 356, mining: 108, deforestation: 152, encroachment: 96 },
  { month: 'Mar', detections: 389, mining: 118, deforestation: 165, encroachment: 106 },
];

export const riskDistribution = [
  { name: 'High Risk', value: 35 },
  { name: 'Medium Risk', value: 45 },
  { name: 'Low Risk', value: 20 },
];

export const mapPoints = []; // Empty - now handled by live API in MapView.tsx

export const modelPerformance = {
  accuracy: 94.7,
  precision: 92.3,
  recall: 96.1,
  f1Score: 94.2,
  lastTrained: '2026-02-28',
  datasetSize: '45,000 images',
  modelVersion: 'v3.2.1',
};

export const systemLogs = [
  { id: 'l1', timestamp: '2026-03-03 14:32:01', level: 'info', message: 'Satellite image batch processed – 142 tiles analyzed' },
  { id: 'l2', timestamp: '2026-03-03 14:28:45', level: 'warning', message: 'High risk detection in Western Ghats – Alert dispatched' },
  { id: 'l3', timestamp: '2026-03-03 14:15:22', level: 'info', message: 'NDVI change detection completed for Sundarbans region' },
  { id: 'l4', timestamp: '2026-03-03 13:58:10', level: 'error', message: 'Sentinel-2 API timeout – retrying in 30s' },
  { id: 'l5', timestamp: '2026-03-03 13:45:33', level: 'info', message: 'Model inference pipeline healthy – latency: 1.2s avg' },
  { id: 'l6', timestamp: '2026-03-03 13:30:00', level: 'info', message: 'Scheduled monitoring cycle initiated for all regions' },
  { id: 'l7', timestamp: '2026-03-03 12:55:18', level: 'warning', message: 'Storage utilization at 78% – consider archiving old data' },
  { id: 'l8', timestamp: '2026-03-03 12:40:05', level: 'info', message: 'Officer Priya Sharma acknowledged alert a2' },
  { id: 'l9', timestamp: '2026-03-03 12:22:41', level: 'info', message: 'New detection model v3.2.1 deployed successfully' },
  { id: 'l10', timestamp: '2026-03-03 11:50:00', level: 'error', message: 'Google Earth Engine rate limit reached – cooling down' },
];

export const teamMembers = [
  { id: 't1', name: 'Arjun Mehta', role: 'Team Lead & Backend Dev', avatar: '🧑‍💻', bio: 'Full-stack developer with expertise in satellite data processing' },
  { id: 't2', name: 'Priya Sharma', role: 'AI/ML Engineer', avatar: '👩‍🔬', bio: 'Specialist in computer vision and NDVI analysis algorithms' },
  { id: 't3', name: 'Rahul Verma', role: 'Frontend Developer', avatar: '🎨', bio: 'UI/UX expert building intuitive monitoring dashboards' },
  { id: 't4', name: 'Anita Das', role: 'Data Scientist', avatar: '📊', bio: 'Environmental data analyst and risk modeling specialist' },
];

export const riverEncroachmentGrowth = [
  { month: 'Sep', area: 2.1 },
  { month: 'Oct', area: 3.4 },
  { month: 'Nov', area: 4.8 },
  { month: 'Dec', area: 6.2 },
  { month: 'Jan', area: 7.9 },
  { month: 'Feb', area: 9.5 },
  { month: 'Mar', area: 11.2 },
];

export const monthlyMiningActivity = [
  { month: 'Sep', count: 45 },
  { month: 'Oct', count: 58 },
  { month: 'Nov', count: 72 },
  { month: 'Dec', count: 85 },
  { month: 'Jan', count: 94 },
  { month: 'Feb', count: 108 },
  { month: 'Mar', count: 118 },
];
export const ndviData = [
  { month: 'Sep', ndvi: 0.65, baseline: 0.68 },
  { month: 'Oct', ndvi: 0.62, baseline: 0.67 },
  { month: 'Nov', ndvi: 0.58, baseline: 0.66 },
  { month: 'Dec', ndvi: 0.55, baseline: 0.65 },
  { month: 'Jan', ndvi: 0.52, baseline: 0.64 },
  { month: 'Feb', ndvi: 0.48, baseline: 0.64 },
  { month: 'Mar', ndvi: 0.45, baseline: 0.64 },
];

export const deforestationTrend = [
  { month: 'Sep', area: 12.5 },
  { month: 'Oct', area: 15.8 },
  { month: 'Nov', area: 18.2 },
  { month: 'Dec', area: 22.4 },
  { month: 'Jan', area: 25.6 },
  { month: 'Feb', area: 28.9 },
  { month: 'Mar', area: 32.1 },
];

export interface Complaint {
  id: string;
  title: string;
  description: string;
  violation_type: ViolationType;
  status: ComplaintStatus;
  location_coordinates?: [number, number];
  evidence_image?: string;
  submittedBy: string;
  submittedAt: string;
  region?: string;
  assignedOfficer?: string;
  officerNotes?: string;
  resolutionTimeline?: { date: string; note: string }[];
}

export const complaints: Complaint[] = [];
export const alerts = [];
export const detections = [];
