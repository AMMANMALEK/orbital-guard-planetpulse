import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, Shield, MapPin } from 'lucide-react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const officerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

interface CreateOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateOfficerModal = ({ isOpen, onClose, onSuccess }: CreateOfficerModalProps) => {
  const [locations, setLocations] = useState<{ state: string; city: string }[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof officerSchema>>({
    resolver: zodResolver(officerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

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

  const onSubmit = async (values: z.infer<typeof officerSchema>) => {
    if (locations.length === 0) {
      toast.error('Please assign at least one location to the officer');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/users', {
        ...values,
        role: 'officer',
        assigned_locations: locations
      });
      toast.success('Officer created successfully');
      form.reset();
      setLocations([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(getErrorMessage(error, 'Failed to create officer'));
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
            <Shield className="h-5 w-5 text-primary" />
            Create Regional Officer
          </DialogTitle>
          <DialogDescription>
            Register a new officer and assign their jurisdictional locations across India.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Officer Name" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="officer@guard.com" {...field} className="bg-muted/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Initial Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••" {...field} className="bg-muted/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/20">
              <FormLabel className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Jurisdiction Assignments
              </FormLabel>
              
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

                <Button type="button" onClick={handleAddLocation} size="icon" variant="secondary">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
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
                  <p className="text-xs text-muted-foreground italic">No locations assigned yet.</p>
                )}
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Register Officer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
