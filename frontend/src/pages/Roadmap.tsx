import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Satellite, ArrowLeft, CheckCircle, Circle } from 'lucide-react';

const milestones = [
  { phase: 'Phase 1 – MVP', status: 'done', items: ['Satellite image ingestion pipeline', 'NDVI change detection algorithm', 'Basic dashboard with role-based access', 'Mock AI detection simulation'] },
  { phase: 'Phase 2 – Beta', status: 'current', items: ['Integration with Sentinel-2 live API', 'Real-time alert notification system', 'Mobile responsive officer app', 'Multi-region polygon monitoring'] },
  { phase: 'Phase 3 – Launch', status: 'upcoming', items: ['Advanced ML model with 97%+ accuracy', 'Multi-agency collaboration features', 'Automated report generation', 'Government API integrations'] },
  { phase: 'Phase 4 – Scale', status: 'upcoming', items: ['Global coverage expansion', 'Drone imagery integration', 'Predictive risk modeling', 'Carbon credit marketplace'] },
];

const Roadmap = () => (
  <div className="min-h-screen bg-background">
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2 mx-auto">
          <Satellite className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground">PlanetPulse</span>
        </div>
      </div>
    </nav>
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Future Roadmap</h1>
        <p className="text-lg text-muted-foreground">Our vision for Orbital Guard's evolution</p>
      </motion.div>
      <div className="space-y-6">
        {milestones.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className={`rounded-xl border p-6 ${m.status === 'current' ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <div className="flex items-center gap-3 mb-4">
              {m.status === 'done' ? <CheckCircle className="h-5 w-5 text-risk-low" /> : <Circle className={`h-5 w-5 ${m.status === 'current' ? 'text-primary' : 'text-muted-foreground'}`} />}
              <h3 className="text-lg font-semibold text-card-foreground">{m.phase}</h3>
              {m.status === 'current' && <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">In Progress</span>}
            </div>
            <ul className="space-y-2 ml-8">
              {m.items.map((item, j) => (
                <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-muted-foreground flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Roadmap;
