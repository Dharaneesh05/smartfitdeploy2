import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import FitPrediction from '@/components/fit-prediction';

export default function FitPredict() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  if (!user) {
    setLocation('/login');
    return null;
  }

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiRequest('POST', '/api/favorites', { productId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({
        title: "Added to Favorites",
        description: "Product has been added to your favorites.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add",
        description: error instanceof Error ? error.message : "Could not add to favorites",
        variant: "destructive",
      });
    },
  });

  const handleTryOnAR = (productId: string) => {
    setLocation(`/ar-tryon?product=${productId}`);
  };

  const handleAddToFavorites = async (productId: string) => {
    await addToFavoritesMutation.mutateAsync(productId);
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 mt-10" data-testid="title-fit-predict">
            AI Fit Prediction
          </h1>
          <p className="text-xl text-gray-600">
            Upload product images and get instant fit analysis
          </p>
        </div>

        <FitPrediction
          onTryOnAR={handleTryOnAR}
          onAddToFavorites={handleAddToFavorites}
        />
      </div>
    </div>
  );
}
