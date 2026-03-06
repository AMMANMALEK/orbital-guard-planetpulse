import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Satellite, Shield, BarChart3, Globe, AlertTriangle, Leaf, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

const Landing = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Satellite className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">PlanetPulse</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            <Link to="/team" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Team</Link>
            <Link to="/roadmap" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roadmap</Link>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-lg p-2 hover:bg-muted text-muted-foreground">
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">Login</Link>
          </div>
        </div>
      </nav>

      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full bg-accent/20 blur-3xl animate-pulse" />
        </div>
        <div className="relative container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Shield className="h-4 w-4" /> Orbital Guard – Emerging Technologies
            </div>
            <h1 className="mb-6 text-4xl sm:text-5xl md:text-7xl font-bold leading-tight text-foreground">
              AI-Powered Satellite<br /><span className="text-primary">Environmental Monitoring</span>
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Detect illegal mining, deforestation, and river encroachment using advanced satellite imagery and NDVI change detection algorithms.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
                Access Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-semibold text-foreground hover:bg-muted transition-colors">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Core Capabilities</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Advanced satellite monitoring powered by artificial intelligence</p>
          </motion.div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Globe, title: 'Satellite Monitoring', desc: 'Real-time satellite imagery analysis across multiple regions' },
              { icon: AlertTriangle, title: 'Illegal Mining Detection', desc: 'AI-powered detection of unauthorized mining activities' },
              { icon: Leaf, title: 'Deforestation Tracking', desc: 'NDVI change detection for forest cover analysis' },
              { icon: Shield, title: 'Risk Scoring', desc: 'Automated risk assessment with confidence metrics' },
              { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive data visualization and trend analysis' },
              { icon: Satellite, title: 'Multi-Agency Access', desc: 'Role-based dashboards for administrators and officers' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              { value: '2,847', label: 'Detections Made' },
              { value: '156', label: 'Active Alerts' },
              { value: '94.7%', label: 'Model Accuracy' },
              { value: '12', label: 'Monitored Regions' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <p className="text-4xl font-bold text-primary">{s.value}</p>
                <p className="mt-2 text-muted-foreground">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 PlanetPulse by Team OrbitalGuard | Emerging Technologies Hackathon
        </div>
      </footer>
    </div>
  );
};

export default Landing;
