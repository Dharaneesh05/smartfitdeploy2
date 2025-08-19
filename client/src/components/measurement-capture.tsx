import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, RotateCcw, Save, Wand2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MeasurementData {
  chest: number;
  shoulders: number;
  waist: number;
  height: number;
  hips: number;
  confidence: Record<string, number>;
}

interface MeasurementCaptureProps {
  onMeasurementsCapture: (measurements: MeasurementData) => void;
  onSaveMeasurements: (measurements: MeasurementData) => Promise<void>;
  isLoading?: boolean;
}

export default function MeasurementCapture({ 
  onMeasurementsCapture, 
  onSaveMeasurements, 
  isLoading 
}: MeasurementCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('camera');
  const [isCapturing, setIsCapturing] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);
  const [faceBlurred, setFaceBlurred] = useState(true);

  // Mock measurement extraction (in real app, this would call MediaPipe service)
  const extractMeasurements = useCallback(async (imageData: string): Promise<MeasurementData> => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock measurements with random confidence values
    return {
      chest: Math.round((95 + Math.random() * 15) * 100) / 100,
      shoulders: Math.round((40 + Math.random() * 10) * 100) / 100,
      waist: Math.round((80 + Math.random() * 15) * 100) / 100,
      height: Math.round((165 + Math.random() * 20) * 100) / 100,
      hips: Math.round((85 + Math.random() * 15) * 100) / 100,
      confidence: {
        chest: Math.round((90 + Math.random() * 10) * 100) / 100,
        shoulders: Math.round((85 + Math.random() * 15) * 100) / 100,
        waist: Math.round((88 + Math.random() * 12) * 100) / 100,
        height: Math.round((95 + Math.random() * 5) * 100) / 100,
        hips: Math.round((87 + Math.random() * 13) * 100) / 100,
      }
    };
  }, []);

  const captureImage = useCallback(async () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        try {
          const measuredData = await extractMeasurements(imageSrc);
          setMeasurements(measuredData);
          onMeasurementsCapture(measuredData);
        } catch (error) {
          console.error('Failed to extract measurements:', error);
        }
      }
      
      setIsCapturing(false);
    }
  }, [extractMeasurements, onMeasurementsCapture]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsCapturing(true);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const imageData = event.target?.result as string;
        try {
          const measuredData = await extractMeasurements(imageData);
          setMeasurements(measuredData);
          onMeasurementsCapture(measuredData);
        } catch (error) {
          console.error('Failed to extract measurements:', error);
        }
        setIsCapturing(false);
      };
      reader.readAsDataURL(file);
    }
  }, [extractMeasurements, onMeasurementsCapture]);

  const handleSave = async () => {
    if (measurements) {
      await onSaveMeasurements(measurements);
    }
  };

  const retake = () => {
    setMeasurements(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Camera/Upload Area */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Body Measurement Capture</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={captureMode === 'camera' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaptureMode('camera')}
                data-testid="button-camera-mode"
              >
                <Camera className="h-4 w-4 mr-2" />
                Camera
              </Button>
              <Button
                variant={captureMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaptureMode('upload')}
                data-testid="button-upload-mode"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {captureMode === 'camera' ? (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full aspect-video"
                  data-testid="webcam"
                />
                
                {/* Privacy indicator */}
                <div className="absolute top-4 right-4">
                  <Badge variant={faceBlurred ? "destructive" : "secondary"} className="flex items-center space-x-1">
                    {faceBlurred ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{faceBlurred ? 'Face Blurred' : 'Face Visible'}</span>
                  </Badge>
                </div>
                
                {/* MediaPipe status */}
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-success/90 text-white">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                    MediaPipe Active
                  </Badge>
                </div>

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-white text-sm text-center">
                      Stand 2 meters away, arms slightly apart
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={captureImage} 
                  disabled={isCapturing}
                  className="bg-error hover:bg-red-700"
                  data-testid="button-capture"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  {isCapturing ? 'Processing...' : 'Capture'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={retake}
                  disabled={isCapturing}
                  data-testid="button-retake"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary transition-colors">
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">Upload body measurement photos</p>
                    <p className="text-gray-600">Front, back, and side views recommended</p>
                  </div>
                  <div>
                    <Label htmlFor="file-upload" className="sr-only">
                      Choose files
                    </Label>
                    <Input
                      id="file-upload"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      data-testid="input-file-upload"
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isCapturing}
                      data-testid="button-choose-file"
                    >
                      {isCapturing ? 'Processing...' : 'Choose Files'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy toggle */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm font-medium">Privacy Settings</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFaceBlurred(!faceBlurred)}
              data-testid="button-toggle-privacy"
            >
              {faceBlurred ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {faceBlurred ? 'Face Blurred' : 'Toggle Blur'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Measurement Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Measurements</CardTitle>
            {measurements && (
              <Badge variant="secondary" className="bg-success/10 text-success">
                <Camera className="h-3 w-3 mr-1" />
                Detected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {measurements ? (
            <div className="space-y-6">
              <div className="space-y-4">
                {Object.entries({
                  chest: { label: 'Chest', description: 'Across the widest part', icon: '↔️' },
                  shoulders: { label: 'Shoulders', description: 'Shoulder to shoulder width', icon: '↔️' },
                  waist: { label: 'Waist', description: 'Natural waistline', icon: '↔️' },
                  height: { label: 'Height', description: 'Head to toe measurement', icon: '↕️' },
                  hips: { label: 'Hips', description: 'Widest part of hips', icon: '↔️' }
                }).map(([key, info]) => (
                  <div key={key} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg" data-testid={`measurement-${key}`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{info.icon}</span>
                      <div>
                        <span className="font-medium text-gray-900">{info.label}</span>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-bold text-gray-900" data-testid={`value-${key}`}>
                        {String(measurements[key as keyof MeasurementData])} cm
                      </span>
                      <p className="text-sm text-success" data-testid={`confidence-${key}`}>
                        {measurements.confidence[key]}% confidence
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-3 pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading}
                  data-testid="button-save-measurements"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save to Profile'}
                </Button>
                <Button variant="outline" data-testid="button-predict-fit">
                  <Wand2 className="mr-2 h-4 w-4" />
                  Predict Clothing Fit
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">
                {isCapturing ? 'Processing measurements...' : 'Capture or upload an image to get started'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
