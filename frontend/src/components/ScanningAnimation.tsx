import { useState, useEffect } from 'react';
import { TreeDeciduous, Pickaxe, Activity } from 'lucide-react';

const phases = [
  { text: 'Detecting Deforestation', icon: TreeDeciduous },
  { text: 'Detecting Illegal Mining', icon: Pickaxe },
  { text: 'Analyzing Other Environmental Effects', icon: Activity },
];

export const ScanningAnimation = () => {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    // Change phase every 2 seconds, stopping at the last phase
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev < phases.length - 1 ? prev + 1 : prev));
    }, 2000); 
    return () => clearInterval(interval);
  }, []);

  const ActiveIcon = phases[phaseIndex].icon;

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6 w-full h-full">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin" style={{ animationDuration: '1s' }}></div>
        <div className="absolute inset-2 rounded-full border-b-4 border-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        <div className="absolute inset-0 m-auto h-12 w-12 flex items-center justify-center bg-card rounded-full z-10 shadow-sm">
          <ActiveIcon className="h-6 w-6 text-primary animate-pulse" />
        </div>
      </div>
      <div className="space-y-1 gap-y-1 text-center min-h-[3rem] flex flex-col justify-center">
        <p className="text-sm font-bold text-foreground transition-all duration-300">
          {phases[phaseIndex].text}...
        </p>
        <p className="text-xs text-muted-foreground">Cross-referencing satellite and ground data</p>
      </div>
    </div>
  );
};
