import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import FitPrediction from '@/components/fit-prediction';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FootwearFitPrediction from '@/components/footwear-fit-prediction';

export default function FitPredict() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient(); // Ensure queryClient is initialized
  const { toast } = useToast(); // Ensure toast is initialized

  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  if (!user) {
    return null;
  }

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      try {
        const response = await apiRequest('POST', '/api/favorites', { productId });
        return response.json();
      } catch (error) {
        // Handle the error gracefully without throwing to prevent overlay
        console.error('Failed to add favorite:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    },
    onSuccess: (data) => {
      if (data && data.success !== false) {
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
        toast({
          title: "Added to Favorites",
          description: "Product has been added to your favorites.",
        });
      } else if (data && data.success === false) {
        toast({
          title: "Failed to Add",
          description: data.error || "Could not add to favorites",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      // This won't trigger due to the try-catch in mutationFn
      console.error('Mutation error:', error);
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

        <Tabs defaultValue="clothing" className="w-full">
          <TabsList>
            <TabsTrigger value="clothing">Clothing</TabsTrigger>
            <TabsTrigger value="footwear">Footwear</TabsTrigger>
          </TabsList>
          <TabsContent value="clothing">
            <FitPrediction
              onTryOnAR={handleTryOnAR}
              onAddToFavorites={handleAddToFavorites}
            />
          </TabsContent>
          <TabsContent value="footwear">
            <FootwearFitPrediction
              onTryOnAR={(product) => handleTryOnAR(product.id)}
              onAddToFavorites={(product) => handleAddToFavorites(product.id)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}