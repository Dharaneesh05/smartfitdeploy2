import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Video, Expand, Settings, Palette, SquareArrowOutUpLeft, Share, ShoppingCart, Bookmark } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand?: string;
  size?: string;
  measurements?: Record<string, number>;
}

interface ARTryOnInterfaceProps {
  product: Product;
  onPurchase?: (productId: string) => void;
  onSaveToProfile?: (productId: string) => void;
}

export default function ARTryOnInterface({ 
  product, 
  onPurchase, 
  onSaveToProfile 
}: ARTryOnInterfaceProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isARActive, setIsARActive] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [fitAnalysis, setFitAnalysis] = useState({
    chest: 'perfect',
    shoulders: 'good',
    length: 'tight'
  });

  // Mock AR visualization (in real app, this would use MediaPipe + computer vision)
  const startARSession = useCallback(() => {
    setIsARActive(true);
    setIsTracking(true);
    
    // Mock tracking simulation
    setTimeout(() => {
      setIsTracking(true);
    }, 1000);
  }, []);

  const stopARSession = useCallback(() => {
    setIsARActive(false);
    setIsTracking(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current && canvasRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      // In real app, would save the AR overlay image
      console.log('AR photo captured');
    }
  }, []);

  const startVideoRecording = useCallback(() => {
    // Mock video recording
    console.log('Video recording started');
  }, []);

  useEffect(() => {
    // Auto-start AR when component mounts
    startARSession();
    return () => stopARSession();
  }, [startARSession, stopARSession]);

  const getFitStatusColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return 'bg-success/10 text-success';
      case 'good':
        return 'bg-success/10 text-success';
      case 'tight':
        return 'bg-warning/10 text-warning';
      case 'loose':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getFitStatusLabel = (status: string) => {
    switch (status) {
      case 'perfect':
        return 'Perfect';
      case 'good':
        return 'Good';
      case 'tight':
        return 'Tight';
      case 'loose':
        return 'Loose';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* AR Camera Feed */}
      <div className="lg:col-span-2">
        <Card>
          <CardContent className="p-8 bg-gray-900">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl relative overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  data-testid="ar-webcam"
                />
                
                {/* Canvas for AR overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ mixBlendMode: 'overlay' }}
                />

                {/* AR overlay indicators */}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-purple-600/90 text-white">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                    AR Active
                  </Badge>
                </div>
                
                <div className="absolute top-4 right-4">
                  <Badge className={isTracking ? "bg-success/90 text-white" : "bg-gray-600/90 text-white"}>
                    <div className={`w-2 h-2 bg-white rounded-full mr-2 ${isTracking ? 'animate-pulse' : ''}`}></div>
                    {isTracking ? 'Tracking' : 'Not Tracking'}
                  </Badge>
                </div>

                {/* Mock clothing overlay visualization */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      {/* T-shirt overlay */}
                      <div className="w-40 h-32 bg-gradient-to-b from-blue-500/80 to-blue-600/80 rounded-t-3xl border-2 border-blue-400/50 relative">
                        {/* Fit indicators */}
                        <div className="absolute top-2 right-2 w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <div className="absolute top-8 right-2 w-3 h-3 bg-success rounded-full animate-pulse"></div>
                        <div className="absolute bottom-8 right-2 w-3 h-3 bg-warning rounded-full animate-pulse"></div>
                        
                        {/* Texture pattern */}
                        <div className="absolute inset-4 border border-white/30 rounded-t-2xl"></div>
                      </div>
                      
                      {/* Sleeves */}
                      <div className="absolute top-4 -left-6 w-12 h-24 bg-gradient-to-b from-blue-500/80 to-blue-600/80 rounded-lg transform -rotate-12 border border-blue-400/50"></div>
                      <div className="absolute top-4 -right-6 w-12 h-24 bg-gradient-to-b from-blue-500/80 to-blue-600/80 rounded-lg transform rotate-12 border border-blue-400/50"></div>
                    </div>
                  </div>
                </div>

                {/* AR controls overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={capturePhoto}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                          data-testid="button-ar-photo"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={startVideoRecording}
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                          data-testid="button-ar-video"
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-white text-sm text-center">
                        <div>Move naturally to see the fit</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                          data-testid="button-ar-fullscreen"
                        >
                          <Expand className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg text-white"
                          data-testid="button-ar-settings"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AR Controls & Analysis */}
      <div className="space-y-6">
        {/* Product being tried on */}
        <Card>
          <CardHeader>
            <CardTitle>Trying On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">👕</span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900" data-testid="ar-product-name">{product.name}</h4>
                <p className="text-gray-600">
                  {product.size && `Size ${product.size}`}
                  {product.brand && ` - ${product.brand}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time fit analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(fitAnalysis).map(([key, status]) => (
                <div key={key} className="flex justify-between items-center" data-testid={`ar-fit-${key}`}>
                  <span className="text-gray-700 capitalize">{key} Fit</span>
                  <Badge className={`${getFitStatusColor(status)} border-0`}>
                    {getFitStatusLabel(status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <span className="text-yellow-600 text-lg">💡</span>
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium">Consider Size L</p>
                  <p className="text-yellow-700">For better length and comfort around the torso</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AR Controls */}
        <Card>
          <CardHeader>
            <CardTitle>AR Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" size="sm" data-testid="button-change-color">
                <Palette className="h-4 w-4 mr-2" />
                Color
              </Button>
              <Button variant="outline" size="sm" data-testid="button-change-size">
                <SquareArrowOutUpLeft className="h-4 w-4 mr-2" />
                Size
              </Button>
              <Button variant="outline" size="sm" onClick={capturePhoto} data-testid="button-capture-ar">
                <Camera className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button variant="outline" size="sm" data-testid="button-share-ar">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Final actions */}
        <div className="space-y-3 pt-4 border-t border-gray-200">
          <Button 
            onClick={() => onPurchase?.(product.id)} 
            className="w-full bg-success hover:bg-green-700"
            data-testid="button-purchase"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Purchase This Item
          </Button>
          <Button 
            variant="outline" 
            onClick={() => onSaveToProfile?.(product.id)} 
            className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
            data-testid="button-save-profile"
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save to Profile
          </Button>
        </div>
      </div>
    </div>
  );
}
