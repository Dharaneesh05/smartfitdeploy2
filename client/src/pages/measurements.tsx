import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest } from '@/lib/queryClient';
import MeasurementCapture from '@/components/measurement-capture';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface MeasurementData {
  chest: number;
  shoulders: number;
  waist: number;
  height: number;
  hips: number;
  confidence: Record<string, number>;
}

export default function Measurements() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  if (!user) {
    setLocation('/login');
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
  };

  const handleSaveMeasurements = async (measurements: MeasurementData) => {
    await saveMeasurementsMutation.mutateAsync(measurements);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="title-measurements">
            Body Measurement Interface
          </h1>
          <p className="text-xl text-gray-600">
            Privacy-first measurement capture with AI-powered landmark detection
          </p>
        </div>

        {existingMeasurements && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Current Measurements</CardTitle>
              <CardDescription>
                Last updated: {new Date(existingMeasurements.updatedAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries({
                  chest: 'Chest',
                  shoulders: 'Shoulders',
                  waist: 'Waist',
                  height: 'Height',
                  hips: 'Hips'
                }).map(([key, label]) => (
                  <div key={key} className="text-center" data-testid={`current-${key}`}>
                    <div className="text-2xl font-bold text-primary">
                      {existingMeasurements[key]} cm
                    </div>
                    <div className="text-sm text-gray-600">{label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-8">
            <MeasurementCapture
              onMeasurementsCapture={handleMeasurementsCapture}
              onSaveMeasurements={handleSaveMeasurements}
              isLoading={saveMeasurementsMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
