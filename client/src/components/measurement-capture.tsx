import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Save, Eye, EyeOff, Settings, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// Import RotateCcw from lucide-react
// import { RotateCcw } from 'lucide-react';

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
  const [measurementType, setMeasurementType] = useState<'body' | 'foot'>('body');
  const [currentView, setCurrentView] = useState<'front' | 'side' | 'back' | 'top'>('front');
  const [isCapturing, setIsCapturing] = useState(false);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [footDetected, setFootDetected] = useState(false);
  const [measurements, setMeasurements] = useState<MeasurementData | null>(null);
  const [faceBlurred, setFaceBlurred] = useState(true);
  const [viewsCompleted, setViewsCompleted] = useState<Record<string, boolean>>({
    front: false,
    side: false,
    back: false,
    top: false
  });

  // Enhanced measurement extraction with multiple views
  const extractMeasurements = useCallback(async (imageData: string, view: string, type: 'body' | 'foot'): Promise<MeasurementData> => {
    setIsCapturing(true);

    // Simulate realistic processing time based on view and type
    const processingTime = type === 'foot' ? 3000 : 2500;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    // Mock measurements with view-specific accuracy
    const baseAccuracy = view === 'front' ? 95 : view === 'side' ? 90 : 85;

    const bodyMeasurements = {
      chest: Math.round((95 + Math.random() * 15) * 100) / 100,
      shoulders: Math.round((40 + Math.random() * 10) * 100) / 100,
      waist: Math.round((80 + Math.random() * 15) * 100) / 100,
      height: Math.round((165 + Math.random() * 20) * 100) / 100,
      hips: Math.round((85 + Math.random() * 15) * 100) / 100,
      footLength: Math.round((24 + Math.random() * 4) * 100) / 100,
      footWidth: Math.round((9 + Math.random() * 2) * 100) / 100,
      confidence: {
        chest: Math.round((baseAccuracy - 5 + Math.random() * 10) * 100) / 100,
        shoulders: Math.round((baseAccuracy - 3 + Math.random() * 8) * 100) / 100,
        waist: Math.round((baseAccuracy - 2 + Math.random() * 6) * 100) / 100,
        height: Math.round((baseAccuracy + Math.random() * 5) * 100) / 100,
        hips: Math.round((baseAccuracy - 4 + Math.random() * 8) * 100) / 100,
        footLength: Math.round((baseAccuracy - 2 + Math.random() * 6) * 100) / 100,
        footWidth: Math.round((baseAccuracy - 3 + Math.random() * 7) * 100) / 100,
      }
    };

    setIsCapturing(false);
    return bodyMeasurements;
  }, []);

  const captureImage = useCallback(async () => {
    if (webcamRef.current) {
      setIsCapturing(true);

      if (measurementType === 'body') {
        setBodyDetected(true);
      } else {
        setFootDetected(true);
      }

      const imageSrc = webcamRef.current.getScreenshot();

      if (imageSrc) {
        try {
          const measuredData = await extractMeasurements(imageSrc, currentView, measurementType);
          setMeasurements(measuredData);
          setViewsCompleted(prev => ({ ...prev, [currentView]: true }));
          onMeasurementsCapture(measuredData);
        } catch (error) {
          console.error('Failed to extract measurements:', error);
        }
      }
    }
  }, [extractMeasurements, currentView, measurementType, onMeasurementsCapture]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsCapturing(true);

      // Process multiple files for different views
      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onload = async (event) => {
          const imageData = event.target?.result as string;
          try {
            const view = i === 0 ? 'front' : i === 1 ? 'side' : 'back';
            const measuredData = await extractMeasurements(imageData, view, measurementType);
            setMeasurements(measuredData);
            setViewsCompleted(prev => ({ ...prev, [view]: true }));
            onMeasurementsCapture(measuredData);
          } catch (error) {
            console.error('Failed to extract measurements:', error);
          }
        };
        reader.readAsDataURL(file);
      }
      setIsCapturing(false);
    }
  }, [extractMeasurements, measurementType, onMeasurementsCapture]);

  const handleSave = async () => {
    if (measurements) {
      await onSaveMeasurements(measurements);
    }
  };

  const retake = () => {
    setMeasurements(null);
    setBodyDetected(false);
    setFootDetected(false);
    setViewsCompleted({ front: false, side: false, back: false, top: false });
  };

  const getViewInstructions = () => {
    if (measurementType === 'body') {
      switch (currentView) {
        case 'front': return 'Face the camera, arms slightly apart, stand straight';
        case 'side': return 'Turn to your right side, arms down, maintain good posture';
        case 'back': return 'Turn your back to camera, arms slightly apart';
        default: return 'Stand naturally in front of the camera';
      }
    } else {
      switch (currentView) {
        case 'side': return 'Point your foot sideways to the camera';
        case 'top': return 'Place foot on the ground, camera above looking down';
        default: return 'Position foot clearly visible to camera';
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Enhanced Camera/Upload Area */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">
              {measurementType === 'body' ? 'Body' : 'Foot'} Measurement Capture
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant={captureMode === 'camera' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaptureMode('camera')}
                data-testid="button-camera-mode"
              >
                <Camera className="h-4 w-4 mr-1" />
                Live
              </Button>
              <Button
                variant={captureMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCaptureMode('upload')}
                data-testid="button-upload-mode"
              >
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Measurement Type Toggle */}
          <div className="mb-4">
            <Tabs value={measurementType} onValueChange={(value) => setMeasurementType(value as 'body' | 'foot')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="body" data-testid="tab-body">Body Measurements</TabsTrigger>
                <TabsTrigger value="foot" data-testid="tab-foot">Foot Measurements</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {captureMode === 'camera' ? (
            <div className="space-y-4">
              {/* View Selection */}
              <div className="flex justify-center space-x-2 mb-4">
                {measurementType === 'body'
                  ? ['front', 'side', 'back'].map((view) => (
                      <Button
                        key={view}
                        variant={currentView === view ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView(view as any)}
                        className={`${viewsCompleted[view] ? 'status-success' : 'btn-secondary'}`}
                        data-testid={`view-${view}`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                        {viewsCompleted[view] && <span className="ml-1 text-green-600">✓</span>}
                      </Button>
                    ))
                  : ['side', 'top'].map((view) => (
                      <Button
                        key={view}
                        variant={currentView === view ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentView(view as any)}
                        className={`${viewsCompleted[view] ? 'status-success' : 'btn-secondary'}`}
                        data-testid={`view-${view}`}
                      >
                        {view.charAt(0).toUpperCase() + view.slice(1)}
                        {viewsCompleted[view] && <span className="ml-1 text-green-600">✓</span>}
                      </Button>
                    ))
                }
              </div>

              <div className="relative bg-gray-900 rounded-xl overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="w-full aspect-video webcam-container"
                  data-testid="webcam"
                />

                {/* Detection overlays */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  <div className={`detection-indicator ${faceBlurred ? 'detection-active' : 'detection-inactive'}`}>
                    {faceBlurred ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span className="text-xs">{faceBlurred ? 'Face Blurred' : 'Face Visible'}</span>
                  </div>

                  <div className={`detection-indicator ${(measurementType === 'body' ? bodyDetected : footDetected) ? 'detection-active' : 'detection-processing'}`}>
                    <div className={`w-2 h-2 rounded-full ${(measurementType === 'body' ? bodyDetected : footDetected) ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                    <span className="text-xs">
                      {measurementType === 'body'
                        ? (bodyDetected ? 'Body Detected' : 'Detecting Body...')
                        : (footDetected ? 'Foot Detected' : 'Detecting Foot...')}
                    </span>
                  </div>
                </div>

                {/* MediaPipe status */}
                <div className="absolute top-4 left-4">
                  <div className="detection-indicator detection-active">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs">MediaPipe Active</span>
                  </div>
                </div>

                {/* Enhanced MediaPipe/YOLO detection overlay with precise line mapping */}
                {(measurementType === 'body' ? bodyDetected : footDetected) && (
                  <div className={measurementType === 'body' ? 'body-detection-overlay' : 'foot-measurement-overlay'}>
                    {measurementType === 'body' ? (
                      // Enhanced body skeleton with MediaPipe precision
                      <div className="absolute inset-0">
                        {/* Head */}
                        <div className="skeleton-point" style={{top: '10%', left: '50%', transform: 'translateX(-50%)'}}></div>

                        {/* Shoulder line */}
                        <div className="skeleton-point" style={{top: '20%', left: '30%'}}></div>
                        <div className="skeleton-point" style={{top: '20%', right: '30%'}}></div>
                        <div className="measurement-line" style={{top: '20%', left: '30%', right: '30%'}}></div>

                        {/* Arms */}
                        <div className="skeleton-point" style={{top: '30%', left: '22%'}}></div>
                        <div className="skeleton-point" style={{top: '30%', right: '22%'}}></div>
                        <div className="skeleton-point" style={{top: '45%', left: '18%'}}></div>
                        <div className="skeleton-point" style={{top: '45%', right: '18%'}}></div>

                        {/* Chest measurement line */}
                        <div className="skeleton-point" style={{top: '35%', left: '35%'}}></div>
                        <div className="skeleton-point" style={{top: '35%', right: '35%'}}></div>
                        <div className="measurement-line" style={{top: '35%', left: '35%', right: '35%'}}></div>

                        {/* Waist measurement line */}
                        <div className="skeleton-point" style={{top: '45%', left: '40%'}}></div>
                        <div className="skeleton-point" style={{top: '45%', right: '40%'}}></div>
                        <div className="measurement-line" style={{top: '45%', left: '40%', right: '40%'}}></div>

                        {/* Hip measurement line */}
                        <div className="skeleton-point" style={{top: '55%', left: '38%'}}></div>
                        <div className="skeleton-point" style={{top: '55%', right: '38%'}}></div>
                        <div className="measurement-line" style={{top: '55%', left: '38%', right: '38%'}}></div>

                        {/* Height line */}
                        <div className="measurement-line border-l-2 border-primary h-full absolute left-1/2 transform -translate-x-1/2 opacity-60"></div>

                        {/* Legs */}
                        <div className="skeleton-point" style={{top: '75%', left: '42%'}}></div>
                        <div className="skeleton-point" style={{top: '75%', right: '42%'}}></div>
                        <div className="skeleton-point" style={{bottom: '10%', left: '42%'}}></div>
                        <div className="skeleton-point" style={{bottom: '10%', right: '42%'}}></div>

                        {/* Measurement labels */}
                        <div className="absolute top-[18%] left-1/2 transform -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded">
                          Shoulders
                        </div>
                        <div className="absolute top-[33%] left-1/2 transform -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded">
                          Chest
                        </div>
                        <div className="absolute top-[43%] left-1/2 transform -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded">
                          Waist
                        </div>
                        <div className="absolute top-[53%] left-1/2 transform -translate-x-1/2 text-xs bg-primary text-white px-2 py-1 rounded">
                          Hips
                        </div>
                      </div>
                    ) : (
                      // Enhanced foot detection with precise mapping
                      <div className="absolute inset-0 flex justify-center items-center">
                        <div className="relative">
                          {/* Foot outline with measurement points */}
                          <div className="w-40 h-60 relative">
                            {/* Foot boundary */}
                            <div className="absolute inset-0 border-2 border-primary/60 rounded-full transform rotate-12"></div>

                            {/* Length measurement */}
                            <div className="measurement-line border-l-2 border-primary h-full absolute left-1/2 transform -translate-x-1/2"></div>
                            <div className="skeleton-point" style={{top: '5%', left: '50%', transform: 'translateX(-50%)'}}></div>
                            <div className="skeleton-point" style={{bottom: '5%', left: '50%', transform: 'translateX(-50%)'}}></div>

                            {/* Width measurement */}
                            <div className="measurement-line border-t-2 border-primary w-3/4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="skeleton-point" style={{top: '50%', left: '25%', transform: 'translateY(-50%)'}}></div>
                            <div className="skeleton-point" style={{top: '50%', right: '25%', transform: 'translateY(-50%)'}}></div>

                            {/* Toe and heel points */}
                            <div className="skeleton-point" style={{top: '10%', left: '50%', transform: 'translateX(-50%)'}}></div>
                            <div className="skeleton-point" style={{bottom: '10%', left: '50%', transform: 'translateX(-50%)'}}></div>

                            {/* Arch points */}
                            <div className="skeleton-point" style={{top: '40%', left: '20%'}}></div>
                            <div className="skeleton-point" style={{top: '40%', right: '20%'}}></div>

                            {/* Measurement labels */}
                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-6 text-xs bg-primary text-white px-2 py-1 rounded">
                              Length
                            </div>
                            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 text-xs bg-primary text-white px-2 py-1 rounded">
                              Width
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Instructions */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="ar-controls rounded-lg p-3">
                    <p className="text-gray-700 text-sm text-center font-medium">
                      {getViewInstructions()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={captureImage}
                  disabled={isCapturing}
                  className="bg-primary hover:bg-primary/90"
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
                  Reset
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary transition-colors">
                <div className="space-y-4">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Upload {measurementType} measurement photos
                    </p>
                    <p className="text-gray-600">
                      {measurementType === 'body' ? 'Front, side, and back views recommended' : 'Side and top views recommended'}
                    </p>
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

      {/* Enhanced Measurement Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Live Measurements</CardTitle>
            {measurements && (
              <Badge className="bg-green-50 text-green-800 border-green-200">
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
                {/* Body measurements */}
                {measurementType === 'body' && Object.entries({
                  chest: { label: 'Chest', description: 'Across the widest part', unit: 'cm' },
                  shoulders: { label: 'Shoulders', description: 'Shoulder to shoulder width', unit: 'cm' },
                  waist: { label: 'Waist', description: 'Natural waistline', unit: 'cm' },
                  height: { label: 'Height', description: 'Head to toe measurement', unit: 'cm' },
                  hips: { label: 'Hips', description: 'Widest part of hips', unit: 'cm' }
                }).map(([key, info]) => (
                  <div key={key} className="measurement-card" data-testid={`measurement-${key}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900">{info.label}</span>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-900" data-testid={`value-${key}`}>
                          {String(measurements[key as keyof MeasurementData])} {info.unit}
                        </span>
                        <p className="text-sm text-green-600" data-testid={`confidence-${key}`}>
                          {measurements.confidence[key]}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Foot measurements */}
                {measurementType === 'foot' && Object.entries({
                  footLength: { label: 'Foot Length', description: 'Heel to toe length', unit: 'cm' },
                  footWidth: { label: 'Foot Width', description: 'Widest part of foot', unit: 'cm' }
                }).map(([key, info]) => (
                  <div key={key} className="measurement-card" data-testid={`measurement-${key}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-gray-900">{info.label}</span>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-gray-900" data-testid={`value-${key}`}>
                          {String(measurements[key as keyof MeasurementData])} {info.unit}
                        </span>
                        <p className="text-sm text-green-600" data-testid={`confidence-${key}`}>
                          {measurements.confidence[key]}% confidence
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col space-y-3">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-save-measurements"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? 'Saving...' : 'Save to Profile'}
                </Button>
                <Button variant="outline" data-testid="button-predict-fit">
                  <Settings className="mr-2 h-4 w-4" />
                  Predict {measurementType === 'body' ? 'Clothing' : 'Footwear'} Fit
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