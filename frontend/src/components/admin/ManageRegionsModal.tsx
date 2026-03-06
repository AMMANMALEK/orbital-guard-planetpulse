import { useState, useEffect } from 'react';
import { Plus, X, MapPin, Globe } from 'lucide-react';
import { toast } from 'sonner';
import api, { getErrorMessage } from '@/lib/api';
import { INDIAN_REGIONS } from '@/data/indianRegions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Location {
  state: string;
  city: string;
}

interface ManageRegionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  officer: {
    id: string;
    name: string;
    assigned_locations?: Location[];
  } | null;
}

export const ManageRegionsModal = ({ isOpen, onClose, onSuccess, officer }: ManageRegionsModalProps) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (officer) {
      setLocations(officer.assigned_locations || []);
    }
  }, [officer, isOpen]);

  const handleAddLocation = () => {
    if (!selectedState || !selectedCity) {
      toast.error('Please select both state and city');
      return;
    }
    
    if (locations.find(l => l.state === selectedState && l.city === selectedCity)) {
      toast.error('This location is already added');
      return;
    }

    setLocations([...locations, { state: selectedState, city: selectedCity }]);
    setSelectedCity('');
  };

  const handleRemoveLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!officer) return;

    setIsSubmitting(true);
    try {
      await api.patch(`/users/${officer.id}/locations`, locations);
      toast.success(`Jurisdiction updated for ${officer.name}`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to update regions'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableCities = selectedState ? (INDIAN_REGIONS as any)[selectedState] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Manage Jurisdictions
          </DialogTitle>
          <DialogDescription>
            Update regions for <span className="font-semibold text-foreground">{officer?.name}</span>. Changes will trigger automatic complaint routing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Add New Coverage Area
            </p>
            
            <div className="flex gap-2">
              <Select value={selectedState} onValueChange={(val) => { setSelectedState(val); setSelectedCity(''); }}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="State" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(INDIAN_REGIONS).map(state => (
                    <SelectItem key={state} value={state}>{state}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {availableCities.map((city: string) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="button" onClick={handleAddLocation} size="icon" variant="secondary" className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              ACTIVE JURISDICTION ({locations.length})
            </p>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 rounded-lg border border-dashed border-border/60">
              {locations.map((loc, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="pl-2 pr-1 py-1 flex items-center gap-1 bg-primary/10 text-primary border-primary/20"
                >
                  {loc.city}, {loc.state}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveLocation(index)}
                    className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {locations.length === 0 && (
                <p className="text-xs text-muted-foreground italic w-full text-center py-2">No locations assigned yet.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
