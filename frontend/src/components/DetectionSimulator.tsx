import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, AlertTriangle, CheckCircle } from 'lucide-react';
import RiskBadge from './RiskBadge';

const classifications = ['Illegal Mining', 'Deforestation', 'River Encroachment'];

const DetectionSimulator = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ riskScore: number; confidenceScore: number; classification: string } | null>(null);

  const triggerDetection = () => {
    setScanning(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        riskScore: Math.floor(Math.random() * 48) + 50,
        confidenceScore: Math.floor(Math.random() * 29) + 70,
        classification: classifications[Math.floor(Math.random() * classifications.length)],
      });
      setScanning(false);
    }, 3000);
  };

  const getRiskLevel = (): 'high' | 'medium' | 'low' => {
    if (!result) return 'low';
    if (result.riskScore >= 80) return 'high';
    if (result.riskScore >= 65) return 'medium';
    return 'low';
  };
  const riskLevel = getRiskLevel();

  return (
    <div className="space-y-4">
      <button onClick={triggerDetection} disabled={scanning}
        className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50">
        <Scan className={`h-5 w-5 ${scanning ? 'animate-spin' : ''}`} />
        {scanning ? 'Analyzing Satellite Imagery...' : 'Trigger AI Detection'}
      </button>

      <AnimatePresence>
        {scanning && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <div>
              <p className="font-medium text-card-foreground">Processing satellite imagery...</p>
              <p className="text-sm text-muted-foreground">Running NDVI change detection algorithm</p>
            </div>
          </motion.div>
        )}
        {result && !scanning && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-risk-medium" />
              <h3 className="text-lg font-semibold text-card-foreground">Detection Result</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold text-card-foreground">{result.riskScore}%</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-2xl font-bold text-card-foreground">{result.confidenceScore}%</p>
              </div>
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">Risk Level</p>
                <div className="mt-1"><RiskBadge level={riskLevel} /></div>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="font-medium text-card-foreground">Classification: {result.classification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DetectionSimulator;
