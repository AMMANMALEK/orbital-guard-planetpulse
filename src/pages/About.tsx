import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Satellite, Target, Lightbulb, Heart, TrendingUp, ArrowLeft } from 'lucide-react';

const sections = [
  { icon: Target, title: 'Problem Statement', content: 'Illegal mining, deforestation, and river encroachment continue to damage ecosystems worldwide. Traditional monitoring methods are slow, manual, and cannot scale. Environmental agencies lack real-time visibility into rapidly changing land-use patterns, leading to delayed enforcement and irreversible ecological damage.' },
  { icon: Lightbulb, title: 'Our Solution', content: 'Orbital Guard uses AI-powered satellite imagery analysis with NDVI change detection to automatically identify illegal environmental activities. Our system processes Sentinel-2 satellite data, generates risk scores, and dispatches alerts to field officers in real-time through role-based dashboards.' },
  { icon: Heart, title: 'Social Impact', content: 'By enabling faster detection and response, Orbital Guard helps protect biodiversity hotspots, indigenous communities, and water resources. Our transparent public portal empowers citizens with environmental data, fostering accountability and community-driven conservation.' },
  { icon: TrendingUp, title: 'Business Model', content: 'SaaS licensing for government environmental agencies with tiered pricing based on monitored area. Additional revenue from consulting services, custom model training, and API access for research institutions and NGOs.' },
];

const About = () => (
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-foreground mb-2">About Orbital Guard</h1>
        <p className="text-lg text-muted-foreground mb-12">AI Powered Satellite Monitoring for Environmental Protection</p>
      </motion.div>
      <div className="space-y-10">
        {sections.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-primary/10 p-2"><s.icon className="h-5 w-5 text-primary" /></div>
              <h2 className="text-xl font-semibold text-card-foreground">{s.title}</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">{s.content}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

export default About;
