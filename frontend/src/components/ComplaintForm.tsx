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
import { Upload } from 'lucide-react';
import type { ViolationType } from '@/data/mockData';
import { INDIAN_REGIONS } from '@/data/indianRegions';

const schema = z.object({
  state: z.string().min(1, 'Please select a state'),
  city: z.string().min(1, 'Please select a city'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  violation_type: z.enum(['illegal_mining', 'deforestation', 'river-encroachment', 'pollution', 'other']),
  complaint_images: z.array(z.string()).default([]),
});

export type ComplaintFormValues = z.infer<typeof schema> & { submittedBy: string };

interface ComplaintFormProps {
  onSubmit: (data: any) => void;
  submittedBy: string;
}

export default function ComplaintForm({ onSubmit, submittedBy }: ComplaintFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [evidenceImages, setEvidenceImages] = useState<string[]>([]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      state: '',
      city: '',
      description: '',
      violation_type: 'illegal_mining',
      complaint_images: [],
    },
  });

  const selectedState = form.watch('state');
  const availableCities = selectedState ? (INDIAN_REGIONS as any)[selectedState] || [] : [];

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
      submittedBy,
    });
    form.reset();
    setEvidenceImages([]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State (India)</FormLabel>
                <Select onValueChange={(val) => {
                  field.onChange(val);
                  form.setValue('city', ''); // Reset city on state change
                }} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.keys(INDIAN_REGIONS).map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={!selectedState}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={selectedState ? "Select city" : "Select state first"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCities.map((city: string) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
