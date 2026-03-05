export type UserRole = 'admin' | 'officer' | 'viewer';
export type RiskLevel = 'high' | 'medium' | 'low';
export type DetectionType = 'illegal-mining' | 'deforestation' | 'river-encroachment';

export interface MockUser {
  id: string; name: string; email: string; role: UserRole;
  region: string; status: 'active' | 'inactive'; lastLogin: string;
}

export interface Region {
  id: string; name: string; coordinates: [number, number];
  assignedOfficer: string; riskLevel: RiskLevel; activeDetections: number;
}

export interface Detection {
  id: string; location: string; coordinates: [number, number];
  type: DetectionType; riskScore: number; confidenceScore: number;
  status: 'detected' | 'investigating' | 'resolved'; date: string; region: string;
}

export interface Alert {
  id: string; detectionId: string; type: DetectionType; severity: RiskLevel;
  status: 'active' | 'investigating' | 'resolved' | 'pending_confirmation';
  message: string; date: string; region: string; notes?: string;
}

export const users: MockUser[] = [
  { id: '1', name: 'Arjun Mehta', email: 'arjun@planetpulse.io', role: 'admin', region: 'All', status: 'active', lastLogin: '2026-03-03' },
  { id: '2', name: 'Priya Sharma', email: 'priya@planetpulse.io', role: 'officer', region: 'Western Ghats', status: 'active', lastLogin: '2026-03-02' },
  { id: '3', name: 'Rahul Verma', email: 'rahul@planetpulse.io', role: 'officer', region: 'Sundarbans', status: 'active', lastLogin: '2026-03-01' },
  { id: '4', name: 'Anita Das', email: 'anita@planetpulse.io', role: 'viewer', region: 'Public', status: 'active', lastLogin: '2026-02-28' },
  { id: '5', name: 'Vikram Singh', email: 'vikram@planetpulse.io', role: 'officer', region: 'Aravalli Hills', status: 'inactive', lastLogin: '2026-02-15' },
  { id: '6', name: 'Deepa Nair', email: 'deepa@planetpulse.io', role: 'viewer', region: 'Public', status: 'active', lastLogin: '2026-03-03' },
];

export const regions: Region[] = [
  { id: 'r1', name: 'Western Ghats', coordinates: [13.0, 75.0], assignedOfficer: 'Priya Sharma', riskLevel: 'high', activeDetections: 12 },
  { id: 'r2', name: 'Sundarbans', coordinates: [21.9, 89.2], assignedOfficer: 'Rahul Verma', riskLevel: 'medium', activeDetections: 7 },
  { id: 'r3', name: 'Aravalli Hills', coordinates: [25.3, 73.8], assignedOfficer: 'Vikram Singh', riskLevel: 'low', activeDetections: 3 },
  { id: 'r4', name: 'Thar Desert', coordinates: [27.0, 71.0], assignedOfficer: 'Unassigned', riskLevel: 'medium', activeDetections: 5 },
  { id: 'r5', name: 'Northeast Forests', coordinates: [26.2, 92.9], assignedOfficer: 'Unassigned', riskLevel: 'high', activeDetections: 9 },
];

export const detections: Detection[] = [
  { id: 'd1', location: 'Kudremukh Range', coordinates: [13.2, 75.2], type: 'illegal-mining', riskScore: 92, confidenceScore: 88, status: 'detected', date: '2026-03-03', region: 'Western Ghats' },
  { id: 'd2', location: 'Nilgiri Biosphere', coordinates: [11.4, 76.7], type: 'deforestation', riskScore: 85, confidenceScore: 91, status: 'investigating', date: '2026-03-02', region: 'Western Ghats' },
  { id: 'd3', location: 'Matla River Basin', coordinates: [21.8, 88.9], type: 'river-encroachment', riskScore: 78, confidenceScore: 82, status: 'detected', date: '2026-03-01', region: 'Sundarbans' },
  { id: 'd4', location: 'Jhiri Village', coordinates: [25.1, 73.5], type: 'illegal-mining', riskScore: 65, confidenceScore: 77, status: 'resolved', date: '2026-02-28', region: 'Aravalli Hills' },
  { id: 'd5', location: 'Kaziranga Buffer', coordinates: [26.6, 93.4], type: 'deforestation', riskScore: 88, confidenceScore: 94, status: 'detected', date: '2026-03-03', region: 'Northeast Forests' },
  { id: 'd6', location: 'Sam Sand Dunes', coordinates: [27.0, 70.5], type: 'river-encroachment', riskScore: 55, confidenceScore: 72, status: 'investigating', date: '2026-02-25', region: 'Thar Desert' },
  { id: 'd7', location: 'Wayanad Forest', coordinates: [11.7, 76.1], type: 'deforestation', riskScore: 91, confidenceScore: 89, status: 'detected', date: '2026-03-03', region: 'Western Ghats' },
  { id: 'd8', location: 'Garo Hills', coordinates: [25.5, 90.3], type: 'illegal-mining', riskScore: 73, confidenceScore: 81, status: 'investigating', date: '2026-02-27', region: 'Northeast Forests' },
];

export const alerts: Alert[] = [
  { id: 'a1', detectionId: 'd1', type: 'illegal-mining', severity: 'high', status: 'active', message: 'Unauthorized excavation detected in Kudremukh Range', date: '2026-03-03', region: 'Western Ghats' },
  { id: 'a2', detectionId: 'd2', type: 'deforestation', severity: 'high', status: 'investigating', message: 'Significant NDVI drop in Nilgiri Biosphere Reserve', date: '2026-03-02', region: 'Western Ghats' },
  { id: 'a3', detectionId: 'd3', type: 'river-encroachment', severity: 'medium', status: 'active', message: 'Construction activity near Matla River floodplain', date: '2026-03-01', region: 'Sundarbans' },
  { id: 'a4', detectionId: 'd5', type: 'deforestation', severity: 'high', status: 'active', message: 'Rapid canopy loss near Kaziranga buffer zone', date: '2026-03-03', region: 'Northeast Forests' },
  { id: 'a5', detectionId: 'd4', type: 'illegal-mining', severity: 'medium', status: 'resolved', message: 'Mining operations halted in Jhiri Village', date: '2026-02-28', region: 'Aravalli Hills' },
  { id: 'a6', detectionId: 'd6', type: 'river-encroachment', severity: 'low', status: 'investigating', message: 'Minor encroachment near Sam Sand Dunes water channel', date: '2026-02-25', region: 'Thar Desert' },
  { id: 'a7', detectionId: 'd7', type: 'deforestation', severity: 'high', status: 'active', message: 'Illegal logging activity in Wayanad Forest corridor', date: '2026-03-03', region: 'Western Ghats' },
];

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

export const ndviData = [
  { month: 'Sep', ndvi: 0.72, baseline: 0.78 },
  { month: 'Oct', ndvi: 0.68, baseline: 0.77 },
  { month: 'Nov', ndvi: 0.63, baseline: 0.76 },
  { month: 'Dec', ndvi: 0.59, baseline: 0.75 },
  { month: 'Jan', ndvi: 0.54, baseline: 0.74 },
  { month: 'Feb', ndvi: 0.51, baseline: 0.73 },
  { month: 'Mar', ndvi: 0.48, baseline: 0.72 },
];

export const deforestationTrend = [
  { month: 'Sep', area: 12.4 },
  { month: 'Oct', area: 18.7 },
  { month: 'Nov', area: 24.1 },
  { month: 'Dec', area: 31.5 },
  { month: 'Jan', area: 38.2 },
  { month: 'Feb', area: 45.8 },
  { month: 'Mar', area: 52.3 },
];

export const mapPoints = [
  { id: 'mp1', position: [25, 30] as [number, number], label: 'Kudremukh – Illegal Mining', riskLevel: 'high' as const },
  { id: 'mp2', position: [40, 25] as [number, number], label: 'Nilgiri – Deforestation', riskLevel: 'high' as const },
  { id: 'mp3', position: [70, 40] as [number, number], label: 'Matla River – Encroachment', riskLevel: 'medium' as const },
  { id: 'mp4', position: [35, 55] as [number, number], label: 'Jhiri – Mining (Resolved)', riskLevel: 'low' as const },
  { id: 'mp5', position: [80, 20] as [number, number], label: 'Kaziranga – Deforestation', riskLevel: 'high' as const },
  { id: 'mp6', position: [50, 65] as [number, number], label: 'Sam Dunes – Encroachment', riskLevel: 'low' as const },
  { id: 'mp7', position: [20, 45] as [number, number], label: 'Wayanad – Illegal Logging', riskLevel: 'high' as const },
  { id: 'mp8', position: [75, 55] as [number, number], label: 'Garo Hills – Mining', riskLevel: 'medium' as const },
];

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
