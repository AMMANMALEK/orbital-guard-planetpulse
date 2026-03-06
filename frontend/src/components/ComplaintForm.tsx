import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRef, useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, MapPin } from 'lucide-react';
import type { ViolationType } from '@/data/mockData';

const schema = z.object({
  location_name: z.string().min(3, 'Location name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  violation_type: z.enum(['illegal_mining', 'deforestation', 'river-encroachment', 'pollution', 'other']),
  latitude: z.number(),
  longitude: z.number(),
  complaint_images: z.array(z.string()).default([]),
});

export type ComplaintFormValues = z.infer<typeof schema> & { submittedBy: string };

interface ComplaintFormProps {
  onSubmit: (data: any) => void;
  submittedBy: string;
}

function LocationPicker({ onSelect }: { onSelect: (coords: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function ComplaintForm({ onSubmit, submittedBy }: ComplaintFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coords, setCoords] = useState<[number, number]>([21.1458, 72.8271]); // Surat/Gujarat default
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      location_name: '',
      description: '',
      violation_type: 'illegal_mining',
      latitude: 21.1458,
      longitude: 72.8271,
      complaint_images: [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          setEvidenceImages(prev => {
            const updated = [...prev, result];
            form.setValue('complaint_images', updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setEvidenceImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      form.setValue('complaint_images', updated);
      return updated;
    });
  };

  const handleSubmit = (values: z.infer<typeof schema>) => {
    onSubmit({
      ...values,
      latitude: coords[0],
      longitude: coords[1],
      submittedBy,
    });
    form.reset();
    setEvidenceImages([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="location_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Bakrol, Anand, Gujarat" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="violation_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Violation Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="illegal_mining">Illegal Mining</SelectItem>
                  <SelectItem value="deforestation">Deforestation</SelectItem>
                  <SelectItem value="river-encroachment">River Encroachment</SelectItem>
                  <SelectItem value="pollution">Pollution</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the violation in detail" rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Mark Location on Map
            </CardTitle>
            <p className="text-sm text-muted-foreground">Click to specify coordinates</p>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] rounded-lg overflow-hidden border">
              <MapContainer
                center={coords}
                zoom={10}
                className="h-full w-full"
                style={{ minHeight: 200 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationPicker onSelect={(c) => { 
                  setCoords(c); 
                  form.setValue('latitude', c[0]); 
                  form.setValue('longitude', c[1]); 
                }} />
              </MapContainer>
            </div>
            <div className="flex gap-4 mt-2">
              <div className="flex-1">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold">Latitude</p>
                 <Input value={coords[0].toFixed(6)} readOnly className="h-8 text-xs font-mono" />
              </div>
              <div className="flex-1">
                 <p className="text-[10px] text-muted-foreground uppercase font-bold">Longitude</p>
                 <Input value={coords[1].toFixed(6)} readOnly className="h-8 text-xs font-mono" />
              </div>
            </div>
          </CardContent>
        </Card>
        <div>
          <FormLabel>Evidence Images (minimum 1 recommended)</FormLabel>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex flex-col gap-4 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-dashed"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Images (Select multiple)
            </Button>
            
            {evidenceImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {evidenceImages.map((img, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden border aspect-square">
                    <img src={img} alt={`Evidence ${i}`} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Button type="submit" className="w-full">Submit Complaint</Button>
      </form>
    </Form>
  );
}
