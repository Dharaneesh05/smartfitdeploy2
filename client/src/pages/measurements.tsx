import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import MeasurementCapture from '@/components/measurement-capture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface MeasurementData {
  chest: number;
  shoulders: number;
  waist: number;
  height: number;
  hips: number;
  footLength: number;
  footWidth: number;
  confidence: Record<string, number>;
}

export default function Measurements() {
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Store measurements when they're captured
  useEffect(() => {
    if (measurements && !localStorage.getItem('userMeasurements')) {
      localStorage.setItem('userMeasurements', JSON.stringify(measurements));
    }
  }, [measurements]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  // Fetch existing measurements
  const { data: existingMeasurements } = useQuery({
    queryKey: ['/api/measurements'],
    retry: false,
  });

  // Save measurements mutation
  const saveMeasurementsMutation = useMutation({
    mutationFn: async (measurements: MeasurementData) => {
      const response = await apiRequest('POST', '/api/measurements', measurements);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/measurements'] });
      toast({
        title: "Measurements Saved",
        description: "Your body measurements have been saved to your profile.",
      });
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save measurements",
        variant: "destructive",
      });
    },
  });

  const handleMeasurementsCapture = (measurements: MeasurementData) => {
    // Measurements captured, could trigger real-time updates here
    console.log('Measurements captured:', measurements);
    setMeasurements(measurements);
  };

  const handleSaveMeasurements = async (measurements: MeasurementData) => {
    await saveMeasurementsMutation.mutateAsync(measurements);
  };

  return (
    <div className="min-h-screen page-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Body & Foot Measurements</h1>
          <p className="text-lg text-gray-600">Capture your measurements for perfect fitting recommendations</p>
        </div>

        <Card className="shadow-xl card-smooth animate-slide-up">
          <CardContent className="p-8">
            <MeasurementCapture />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}