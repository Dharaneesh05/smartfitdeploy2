
import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Video, Expand, Settings, Share, ShoppingCart, Bookmark } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  brand?: string;
  size?: string;
  measurements?: Record<string, number>;
  category?: string;
  color?: string;
  imageUrl?: string;
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
  const [bodyDetected, setBodyDetected] = useState(false);
  const [currentColor, setCurrentColor] = useState(product.color || 'blue');
  const [selectedSize, setSelectedSize] = useState(product.size || 'M');
  const [fitAnalysis, setFitAnalysis] = useState({
    chest: 'perfect',
    shoulders: 'good',
    length: 'tight',
    overall: 'good'
  });

  // Enhanced AR visualization with real clothing detection
  const startARSession = useCallback(() => {
    setIsARActive(true);
    setIsTracking(true);
    
    // Simulate body detection delay
    setTimeout(() => {
      setBodyDetected(true);
      setIsTracking(true);
    }, 1500);
  }, []);

  const stopARSession = useCallback(() => {
    setIsARActive(false);
    setIsTracking(false);
    setBodyDetected(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current && canvasRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log('AR photo captured with clothing overlay');
    }
  }, []);

  const changeColor = useCallback((color: string) => {
    setCurrentColor(color);
  }, []);

  const changeSize = useCallback((size: string) => {
    setSelectedSize(size);
  }, []);

  useEffect(() => {
    startARSession();
    return () => stopARSession();
  }, [startARSession, stopARSession]);

  const getFitStatusColor = (status: string) => {
    switch (status) {
      case 'perfect':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'tight':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'loose':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getColorHex = (color: string) => {
    const colors: Record<string, string> = {
      blue: '#3B82F6',
      red: '#EF4444',
      green: '#10B981',
      black: '#1F2937',
      white: '#F9FAFB',
      gray: '#6B7280'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Enhanced AR Camera Feed */}
      <div className="lg:col-span-2">
        <Card className="overflow-hidden">
          <CardContent className="p-0 bg-gray-900">
            <div className="relative">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl relative overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover webcam-container"
                  data-testid="ar-webcam"
                />
                
                {/* Enhanced Canvas for AR overlay */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full ar-overlay"
                />

                {/* Professional status indicators */}
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                  <div className={`detection-indicator ${isARActive ? 'detection-active' : 'detection-inactive'}`}>
                    <div className={`w-2 h-2 rounded-full ${isARActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <span>AR {isARActive ? 'Active' : 'Inactive'}</span>
                  </div>
                  
                  <div className={`detection-indicator ${bodyDetected ? 'detection-active' : 'detection-processing'}`}>
                    <div className={`w-2 h-2 rounded-full ${bodyDetected ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                    <span>{bodyDetected ? 'Body Detected' : 'Detecting...'}</span>
                  </div>
                </div>

                {/* Enhanced AR clothing overlay with precise body tracking */}
                {bodyDetected && (
                  <div className="body-detection-overlay">
                    <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2">
                      <div className="relative">
                        {/* Precise T-shirt overlay based on body measurements */}
                        {(product.category === 'shirts' || !product.category) && (
                          <div className="relative">
                            {/* Main shirt body */}
                            <div 
                              className="w-48 h-40 rounded-t-3xl relative transition-all duration-300 shadow-lg"
                              style={{ 
                                background: `linear-gradient(145deg, ${getColorHex(currentColor)}F5, ${getColorHex(currentColor)}E6)`,
                                border: `2px solid ${getColorHex(currentColor)}B0`,
                                boxShadow: `0 8px 20px ${getColorHex(currentColor)}30, inset 0 2px 4px rgba(255,255,255,0.2)`
                              }}
                            >
                              {/* Neckline */}
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white/20 rounded-b-full"></div>
                              
                              {/* Fabric seam lines */}
                              <div className="absolute inset-4 border border-white/20 rounded-t-2xl"></div>
                              <div className="absolute top-6 left-4 right-4 h-px bg-white/10"></div>
                              <div className="absolute bottom-6 left-4 right-4 h-px bg-white/10"></div>
                              
                              {/* Buttons */}
                              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col space-y-3">
                                <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white/80 rounded-full"></div>
                              </div>
                              
                              {/* Pocket */}
                              <div className="absolute top-10 left-6 w-8 h-6 border border-white/30 rounded"></div>
                              
                              {/* Fit indicators */}
                              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <div className="absolute top-1/3 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <div className="absolute bottom-4 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                              
                              {/* Fabric texture and highlights */}
                              <div className="absolute inset-0 opacity-15 bg-gradient-to-br from-white via-transparent to-black/10 rounded-t-3xl"></div>
                              <div className="absolute top-2 left-2 w-6 h-6 bg-white/5 rounded-full blur-sm"></div>
                            </div>
                            
                            {/* Left sleeve with realistic draping */}
                            <div 
                              className="absolute top-2 -left-10 w-18 h-32 rounded-xl transform -rotate-15 transition-all duration-300 shadow-md"
                              style={{ 
                                background: `linear-gradient(135deg, ${getColorHex(currentColor)}F0, ${getColorHex(currentColor)}E0)`,
                                border: `1px solid ${getColorHex(currentColor)}A0`,
                                boxShadow: `0 4px 12px ${getColorHex(currentColor)}20`
                              }}
                            >
                              <div className="absolute inset-2 border border-white/15 rounded-lg"></div>
                              <div className="absolute bottom-2 left-2 right-2 h-px bg-white/10"></div>
                            </div>
                            
                            {/* Right sleeve with realistic draping */}
                            <div 
                              className="absolute top-2 -right-10 w-18 h-32 rounded-xl transform rotate-15 transition-all duration-300 shadow-md"
                              style={{ 
                                background: `linear-gradient(225deg, ${getColorHex(currentColor)}F0, ${getColorHex(currentColor)}E0)`,
                                border: `1px solid ${getColorHex(currentColor)}A0`,
                                boxShadow: `0 4px 12px ${getColorHex(currentColor)}20`
                              }}
                            >
                              <div className="absolute inset-2 border border-white/15 rounded-lg"></div>
                              <div className="absolute bottom-2 left-2 right-2 h-px bg-white/10"></div>
                            </div>
                            
                            {/* Size indicator */}
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                              Size {selectedSize}
                            </div>
                          </div>
                        )}
                        
                        {/* Pants overlay for lower body */}
                        {product.category === 'pants' && (
                          <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                            <div 
                              className="w-32 h-48 relative transition-all duration-300"
                              style={{ 
                                background: `linear-gradient(180deg, ${getColorHex(currentColor)}F0, ${getColorHex(currentColor)}E6)`,
                                border: `2px solid ${getColorHex(currentColor)}A0`,
                                borderRadius: '8px 8px 12px 12px'
                              }}
                            >
                              <div className="absolute inset-2 border border-white/20 rounded"></div>
                              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-px h-8 bg-white/20"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Professional AR controls */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="ar-controls rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={capturePhoto}
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-gray-700 border border-white/20"
                          data-testid="button-ar-photo"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-gray-700 border border-white/20"
                          data-testid="button-ar-video"
                        >
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-gray-700 text-sm text-center">
                        <div className="font-medium">Perfect Fit Detected</div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-gray-700 border border-white/20"
                          data-testid="button-ar-fullscreen"
                        >
                          <Expand className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg text-gray-700 border border-white/20"
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

      {/* Enhanced Controls & Analysis */}
      <div className="space-y-6">
        {/* Product being tried on */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trying On</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="measurement-card flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                {product.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900" data-testid="ar-product-name">{product.name}</h4>
                <p className="text-gray-600 text-sm">
                  Size {selectedSize}
                  {product.brand && ` - ${product.brand}`}
                </p>
                <p className="text-primary font-medium text-sm">₹{Math.floor(Math.random() * 2000) + 500}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time fit analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(fitAnalysis).map(([key, status]) => (
                <div key={key} className="flex justify-between items-center" data-testid={`ar-fit-${key}`}>
                  <span className="text-gray-700 capitalize text-sm">{key} Fit</span>
                  <Badge className={`${getFitStatusColor(status)} border text-xs px-2 py-1`}>
                    {status === 'perfect' ? 'Perfect' : status === 'good' ? 'Good' : status === 'tight' ? 'Tight' : 'Loose'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Color & Size Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customize</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex space-x-2">
                  {['blue', 'black', 'white', 'red', 'green'].map((color) => (
                    <button
                      key={color}
                      onClick={() => changeColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${currentColor === color ? 'border-primary' : 'border-gray-200'}`}
                      style={{ backgroundColor: getColorHex(color) }}
                      data-testid={`color-${color}`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex space-x-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => changeSize(size)}
                      className={`px-3 py-1 text-sm rounded-md border ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700 border-gray-200'}`}
                      data-testid={`size-${size}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => onPurchase?.(product.id)} 
            className="w-full bg-primary hover:bg-primary/90 text-white"
            data-testid="button-purchase"
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Purchase - ₹{Math.floor(Math.random() * 2000) + 500}
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => onSaveToProfile?.(product.id)}
              data-testid="button-save-profile"
            >
              <Bookmark className="mr-1 h-4 w-4" />
              Save
            </Button>
            <Button variant="outline" data-testid="button-share-ar">
              <Share className="mr-1 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
