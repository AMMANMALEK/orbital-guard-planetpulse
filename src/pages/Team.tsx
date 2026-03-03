import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Satellite, ArrowLeft } from 'lucide-react';
import { teamMembers } from '@/data/mockData';

const Team = () => (
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
    <div className="container mx-auto px-4 pt-28 pb-16 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Team OrbitalGuard</h1>
        <p className="text-lg text-muted-foreground">Emerging Technologies Hackathon</p>
      </motion.div>
      <div className="grid gap-6 sm:grid-cols-2">
        {teamMembers.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-xl border border-border bg-card p-6 text-center hover:border-primary/50 transition-colors">
            <div className="text-5xl mb-4">{m.avatar}</div>
            <h3 className="text-lg font-semibold text-card-foreground">{m.name}</h3>
            <p className="text-sm text-primary font-medium mt-1">{m.role}</p>
            <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default Team;
