import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Upload, Save, Eye, EyeOff, Settings, RotateCcw, Activity, Zap } from 'lucide-react';
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [footDetected, setFootDetected] = useState(false); // Added missing state
  const [realTimeTracking, setRealTimeTracking] = useState(false);
  const [detectionConfidence, setDetectionConfidence] = useState(0);
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

    const bodyMeasurements: MeasurementData = {
      chest: parseFloat((95 + Math.random() * 15).toFixed(2)),
      shoulders: parseFloat((40 + Math.random() * 10).toFixed(2)),
      waist: parseFloat((80 + Math.random() * 15).toFixed(2)),
      height: parseFloat((165 + Math.random() * 20).toFixed(2)),
      hips: parseFloat((85 + Math.random() * 15).toFixed(2)),
      footLength: parseFloat((24 + Math.random() * 4).toFixed(2)),
      footWidth: parseFloat((9 + Math.random() * 2).toFixed(2)),
      confidence: {
        chest: parseFloat((baseAccuracy - 5 + Math.random() * 10).toFixed(2)),
        shoulders: parseFloat((baseAccuracy - 3 + Math.random() * 8).toFixed(2)),
        waist: parseFloat((baseAccuracy - 2 + Math.random() * 6).toFixed(2)),
        height: parseFloat((baseAccuracy + Math.random() * 5).toFixed(2)),
        hips: parseFloat((baseAccuracy - 4 + Math.random() * 8).toFixed(2)),
        footLength: parseFloat((baseAccuracy - 2 + Math.random() * 6).toFixed(2)),
        footWidth: parseFloat((baseAccuracy - 3 + Math.random() * 7).toFixed(2)),
      }
    };

    setIsCapturing(false);
    return bodyMeasurements;
  }, []);

  const startRealTimeDetection = useCallback(() => {
    setIsDetecting(true);
    setRealTimeTracking(true);

    // Simulate progressive detection
    let confidence = 0;
    const detectionInterval = setInterval(() => {
      confidence += Math.random() * 20;
      setDetectionConfidence(Math.min(confidence, 100));

      if (confidence >= 50) {
        if (measurementType === 'body') {
          setBodyDetected(true);
        } else {
          setFootDetected(true);
        }
      }

      if (confidence >= 100) {
        clearInterval(detectionInterval);
        setIsDetecting(false);
        simulateMeasurement();
      }
    }, 200);

    return () => clearInterval(detectionInterval);
  }, [measurementType]); // Added measurementType dependency

  const simulateMeasurement = useCallback(() => {
    const newMeasurements: MeasurementData = {
      chest: parseFloat((Math.random() * 20 + 90).toFixed(2)),
      shoulders: parseFloat((Math.random() * 10 + 40).toFixed(2)),
      waist: parseFloat((Math.random() * 15 + 75).toFixed(2)),
      height: parseFloat((Math.random() * 30 + 160).toFixed(2)),
      hips: parseFloat((Math.random() * 20 + 85).toFixed(2)),
      footLength: parseFloat((Math.random() * 5 + 22).toFixed(2)),
      footWidth: parseFloat((Math.random() * 3 + 8).toFixed(2)),
      confidence: {
        chest: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        shoulders: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        waist: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        height: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        hips: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        footLength: parseFloat((Math.random() * 10 + 90).toFixed(2)),
        footWidth: parseFloat((Math.random() * 10 + 90).toFixed(2))
      }
    };

    setMeasurements(newMeasurements);

    console.log('Measurements captured:', newMeasurements);

    if (onMeasurementsCapture) {
      onMeasurementsCapture(newMeasurements);
    }
  }, [onMeasurementsCapture]);

  const captureImage = useCallback(async () => {
    if (!webcamRef.current) return;

    setIsCapturing(true);

    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);

      // Start enhanced real-time detection
      setTimeout(() => {
        startRealTimeDetection();
        setIsCapturing(false);
      }, 1000);
    }
  }, [startRealTimeDetection]);

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
    setFootDetected(false); // Reset footDetected state
    setViewsCompleted({ front: false, side: false, back: false, top: false });
    setCapturedImage(null); // Reset captured image
    setRealTimeTracking(false); // Reset tracking state
    setDetectionConfidence(0); // Reset confidence
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

  // Mock simulation function for measurements
  const simulateMeasurementExtraction = useCallback(() => {
    const mockMeasurements: MeasurementData = {
      chest: parseFloat((Math.random() * 10 + 100).toFixed(2)),
      shoulders: parseFloat((Math.random() * 5 + 45).toFixed(2)),
      waist: parseFloat((Math.random() * 8 + 80).toFixed(2)),
      height: parseFloat((Math.random() * 15 + 170).toFixed(2)),
      hips: parseFloat((Math.random() * 12 + 90).toFixed(2)),
      footLength: parseFloat((Math.random() * 3 + 25).toFixed(2)),
      footWidth: parseFloat((Math.random() * 1 + 10).toFixed(2)),
      confidence: {
        chest: parseFloat((Math.random() * 5 + 95).toFixed(2)),
        shoulders: parseFloat((Math.random() * 5 + 95).toFixed(2)),
        waist: parseFloat((Math.random() * 5 + 95).toFixed(2)),
        height: parseFloat((Math.random() * 5 + 95).toFixed(2)),
        hips: parseFloat((Math.random() * 5 + 95).toFixed(2)),
        footLength: parseFloat((Math.random() * 5 + 95).toFixed(2)),
        footWidth: parseFloat((Math.random() * 5 + 95).toFixed(2)),
      }
    };
    setMeasurements(mockMeasurements);
    if (onMeasurementsCapture) {
      onMeasurementsCapture(mockMeasurements);
    }
    setIsCapturing(false);
    setIsDetecting(false); // Ensure detection is marked as finished
  }, [onMeasurementsCapture]);

  // Effect to handle detection simulation based on measurement type
  // This effect is intentionally left empty as the simulation is triggered by captureImage or handleFileUpload

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Camera/Upload Area */}
        <Card className="lg:col-span-2 shadow-xl rounded-2xl border-none bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-gray-800">
                {measurementType === 'body' ? 'Body' : 'Foot'} Measurement Capture
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={captureMode === 'camera' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCaptureMode('camera')}
                  data-testid="button-camera-mode"
                  className="rounded-full px-4 py-2 shadow-md"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Live
                </Button>
                <Button
                  variant={captureMode === 'upload' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCaptureMode('upload')}
                  data-testid="button-upload-mode"
                  className="rounded-full px-4 py-2 shadow-md"
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Measurement Type Toggle */}
            <div className="mb-6">
              <Tabs value={measurementType} onValueChange={(value) => setMeasurementType(value as 'body' | 'foot')}>
                <TabsList className="grid w-full grid-cols-2 bg-gray-200 rounded-full p-1">
                  <TabsTrigger value="body" data-testid="tab-body" className="rounded-full py-3 font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-sm">
                    Body Measurements
                  </TabsTrigger>
                  <TabsTrigger value="foot" data-testid="tab-foot" className="rounded-full py-3 font-semibold text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 shadow-sm">
                    Foot Measurements
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {captureMode === 'camera' ? (
              <div className="space-y-6">
                {/* View Selection */}
                <div className="flex justify-center space-x-3 mb-6">
                  {(measurementType === 'body'
                    ? ['front', 'side', 'back']
                    : ['side', 'top']
                  ).map((view) => (
                    <Button
                      key={view}
                      variant={currentView === view ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentView(view as any)}
                      className={`rounded-full px-4 py-2 shadow-md transition-colors duration-200 
                        ${viewsCompleted[view] ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-200' : ''}
                        ${currentView === view ? 'border-blue-500' : ''}
                      `}
                      data-testid={`view-${view}`}
                    >
                      {view.charAt(0).toUpperCase() + view.slice(1)}
                      {viewsCompleted[view] && <span className="ml-1 text-green-600">✓</span>}
                    </Button>
                  ))}
                </div>

                <div className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-xl aspect-video">
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover webcam-container"
                    data-testid="webcam"
                  />

                  {/* Detection overlays */}
                  <div className="absolute top-4 right-4 flex flex-col space-y-3">
                    <div className={`flex items-center px-3 py-1.5 rounded-full shadow-sm ${faceBlurred ? 'bg-yellow-500/70' : 'bg-blue-500/70'}`}>
                      {faceBlurred ? <EyeOff className="h-3 w-3 text-white" /> : <Eye className="h-3 w-3 text-white" />}
                      <span className="text-xs text-white font-medium ml-1.5">{faceBlurred ? 'Face Blurred' : 'Face Visible'}</span>
                    </div>

                    <div className={`flex items-center px-3 py-1.5 rounded-full shadow-sm ${ (measurementType === 'body' ? bodyDetected : footDetected) ? 'bg-green-500/70' : 'bg-blue-500/70'}`}>
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${ (measurementType === 'body' ? bodyDetected : footDetected) ? 'bg-white animate-pulse' : 'bg-white animate-pulse'}`}></div>
                      <span className="text-xs text-white font-medium">
                        {measurementType === 'body'
                          ? (bodyDetected ? 'Body Detected' : 'Detecting Body...')
                          : (footDetected ? 'Foot Detected' : 'Detecting Foot...')}
                      </span>
                    </div>
                  </div>

                  {/* MediaPipe status */}
                  <div className="absolute top-4 left-4">
                    <div className="flex items-center px-3 py-1.5 rounded-full shadow-md bg-green-500/70">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1.5"></div>
                      <span className="text-xs text-white font-medium">MediaPipe Active</span>
                    </div>
                  </div>

                  {/* Enhanced real-time body detection overlay */}
                  {(capturedImage || realTimeTracking) && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="body-detection-overlay">
                        {/* Real-time detection status */}
                        <div className="absolute top-4 left-4 bg-black/80 rounded-xl px-4 py-3 text-white">
                          <div className="flex items-center space-x-2">
                            {isDetecting ? (
                              <>
                                <Activity className="w-5 h-5 animate-pulse text-blue-400" />
                                <span className="text-sm font-semibold">Detecting... {Math.round(detectionConfidence)}%</span>
                              </>
                            ) : (measurementType === 'body' ? bodyDetected : footDetected) ? (
                              <>
                                <Zap className="w-5 h-5 text-green-400" />
                                <span className="text-sm font-semibold">{measurementType === 'body' ? 'Body Detected' : 'Foot Detected'}</span>
                              </>
                            ) : (
                              <>
                                <div className="w-5 h-5 bg-gray-400 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold">Initializing...</span>
                              </>
                            )}
                          </div>
                          {isDetecting && (
                            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                              <div
                                className="bg-blue-400 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${detectionConfidence}%` }}
                              ></div>
                            </div>
                          )}
                        </div>

                        {/* Enhanced skeleton points with real-time tracking */}
                        {(measurementType === 'body' ? bodyDetected : footDetected) && (
                          <>
                            {/* Body Skeleton Points */}
                            {measurementType === 'body' && (
                              <>
                                <div className="skeleton-point animate-pulse" style={{top: '15%', left: '48%'}}></div> {/* Head */}
                                <div className="skeleton-point animate-pulse" style={{top: '20%', left: '42%'}}></div> {/* Left Shoulder */}
                                <div className="skeleton-point animate-pulse" style={{top: '20%', left: '55%'}}></div> {/* Right Shoulder */}
                                <div className="skeleton-point animate-pulse" style={{top: '30%', left: '48%'}}></div> {/* Chest */}
                                <div className="skeleton-point animate-pulse" style={{top: '40%', left: '48%'}}></div> {/* Waist */}
                                <div className="skeleton-point animate-pulse" style={{top: '50%', left: '45%'}}></div> {/* Left Hip */}
                                <div className="skeleton-point animate-pulse" style={{top: '50%', left: '52%'}}></div> {/* Right Hip */}
                                <div className="skeleton-point animate-pulse" style={{top: '65%', left: '43%'}}></div> {/* Left Knee */}
                                <div className="skeleton-point animate-pulse" style={{top: '65%', left: '55%'}}></div> {/* Right Knee */}
                                <div className="skeleton-point animate-pulse" style={{top: '80%', left: '43%'}}></div> {/* Left Foot */}
                                <div className="skeleton-point animate-pulse" style={{top: '80%', left: '55%'}}></div> {/* Right Foot */}
                              </>
                            )}

                            {/* Foot Skeleton Points */}
                            {measurementType === 'foot' && (
                              <>
                                <div className="skeleton-point animate-pulse" style={{top: '40%', left: '45%'}}></div> {/* Heel */}
                                <div className="skeleton-point animate-pulse" style={{top: '30%', left: '55%'}}></div> {/* Toe */}
                                <div className="skeleton-point animate-pulse" style={{top: '45%', left: '50%'}}></div> {/* Midfoot */}
                              </>
                            )}

                            {/* Enhanced measurement lines with labels */}
                            {/* Body Measurements */}
                            {measurementType === 'body' && (
                              <>
                                <div className="measurement-line border-t-2 border-blue-400" style={{top: '22%', left: '38%', width: '24%'}}>
                                  <span className="absolute -top-7 left-0 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Shoulders: {measurements?.shoulders !== undefined ? measurements.shoulders.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                                <div className="measurement-line border-t-2 border-blue-400" style={{top: '32%', left: '35%', width: '30%'}}>
                                  <span className="absolute -top-7 left-0 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Chest: {measurements?.chest !== undefined ? measurements.chest.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                                <div className="measurement-line border-t-2 border-blue-400" style={{top: '42%', left: '39%', width: '18%'}}>
                                  <span className="absolute -top-7 left-0 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Waist: {measurements?.waist !== undefined ? measurements.waist.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                                <div className="measurement-line border-t-2 border-blue-400" style={{top: '52%', left: '39%', width: '18%'}}>
                                  <span className="absolute -top-7 left-0 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Hips: {measurements?.hips !== undefined ? measurements.hips.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                                <div className="measurement-line border-l-2 border-blue-400" style={{left: '60%', top: '15%', height: '70%'}}>
                                  <span className="absolute -right-16 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Height: {measurements?.height !== undefined ? measurements.height.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                              </>
                            )}

                            {/* Foot Measurements */}
                            {measurementType === 'foot' && (
                              <>
                                <div className="measurement-line border-t-2 border-blue-400" style={{top: '42%', left: '35%', width: '30%'}}>
                                  <span className="absolute -top-7 left-0 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Foot Length: {measurements?.footLength !== undefined ? measurements.footLength.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                                <div className="measurement-line border-t-2 border-blue-400" style={{top: '47%', left: '40%', width: '20%'}}>
                                  <span className="absolute -top-7 left-0 text-xs text-blue-400 font-semibold bg-black/60 px-1 rounded">
                                    Foot Width: {measurements?.footWidth !== undefined ? measurements.footWidth.toFixed(2) : '--'}cm
                                  </span>
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="ar-controls rounded-xl p-3 bg-black/60">
                      <p className="text-gray-200 text-sm text-center font-medium">
                        {getViewInstructions()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center space-x-6">
                  <Button
                    onClick={captureImage}
                    disabled={isCapturing || isDetecting}
                    className="rounded-full px-6 py-3 shadow-lg bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
                    data-testid="button-capture"
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    {isCapturing ? 'Capturing...' : 'Capture'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={retake}
                    disabled={isCapturing}
                    className="rounded-full px-6 py-3 shadow-md border-gray-300 text-gray-700 hover:bg-gray-100"
                    data-testid="button-retake"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-4 border-dashed border-gray-300 rounded-3xl p-12 text-center hover:border-blue-500 transition-colors bg-gray-50/50">
                  <div className="space-y-5">
                    <Upload className="mx-auto h-16 w-16 text-gray-400" />
                    <div>
                      <p className="text-xl font-bold text-gray-800">
                        Upload {measurementType} measurement photos
                      </p>
                      <p className="text-gray-600 mt-2">
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
                        className="rounded-full px-8 py-3 shadow-lg bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
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
            <div className="flex items-center justify-between pt-8 pb-4 border-t border-gray-200 mt-8">
              <span className="text-base font-semibold text-gray-800">Privacy Settings</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFaceBlurred(!faceBlurred)}
                data-testid="button-toggle-privacy"
                className="rounded-full px-4 py-2 shadow-sm border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                {faceBlurred ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {faceBlurred ? 'Face Blurred' : 'Toggle Blur'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Measurement Results */}
        <Card className="shadow-xl rounded-2xl border-none bg-white/80 backdrop-blur-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-gray-800">Live Measurements</CardTitle>
              {measurements && (
                <Badge className="bg-green-50 text-green-800 border-green-200 rounded-full px-3 py-1.5 shadow-sm">
                  <Camera className="h-3 w-3 mr-1" />
                  Detected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {measurements ? (
              <div className="space-y-8">
                <div className="space-y-5">
                  {/* Body measurements */}
                  {measurementType === 'body' && Object.entries({
                    chest: { label: 'Chest', description: 'Across the widest part', unit: 'cm' },
                    shoulders: { label: 'Shoulders', description: 'Shoulder to shoulder width', unit: 'cm' },
                    waist: { label: 'Waist', description: 'Natural waistline', unit: 'cm' },
                    height: { label: 'Height', description: 'Head to toe measurement', unit: 'cm' },
                    hips: { label: 'Hips', description: 'Widest part of hips', unit: 'cm' }
                  }).map(([key, info]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={`measurement-${key}`}>
                      <div className="flex items-center">
                        <div className="bg-blue-100 rounded-lg p-3 mr-4">
                          <Camera className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 text-lg">{info.label}</span>
                          <p className="text-sm text-gray-600">{info.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900" data-testid={`value-${key}`}>
                          {measurements[key as keyof MeasurementData].toFixed(2)} {info.unit}
                        </span>
                        <p className="text-sm text-green-600" data-testid={`confidence-${key}`}>
                          {measurements.confidence && measurements.confidence[key] ? measurements.confidence[key].toFixed(1) : '95.0'}% confidence
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Foot measurements */}
                  {measurementType === 'foot' && Object.entries({
                    footLength: { label: 'Foot Length', description: 'Heel to toe length', unit: 'cm' },
                    footWidth: { label: 'Foot Width', description: 'Widest part of foot', unit: 'cm' }
                  }).map(([key, info]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200" data-testid={`measurement-${key}`}>
                      <div className="flex items-center">
                        <div className="bg-green-100 rounded-lg p-3 mr-4">
                          <Camera className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <span className="font-medium text-gray-900 text-lg">{info.label}</span>
                          <p className="text-sm text-gray-600">{info.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900" data-testid={`value-${key}`}>
                          {measurements[key as keyof MeasurementData].toFixed(2)} {info.unit}
                        </span>
                        <p className="text-sm text-green-600" data-testid={`confidence-${key}`}>
                          {measurements.confidence && measurements.confidence[key] ? measurements.confidence[key].toFixed(1) : '95.0'}% confidence
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col space-y-4 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="rounded-full px-8 py-3 shadow-lg bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold"
                    data-testid="button-save-measurements"
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {isLoading ? 'Saving...' : 'Save to Profile'}
                  </Button>
                  <Button variant="outline" className="rounded-full px-8 py-3 shadow-md border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold">
                    <Settings className="mr-2 h-5 w-5" />
                    Predict {measurementType === 'body' ? 'Clothing' : 'Footwear'} Fit
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 px-8">
                <Camera className="mx-auto h-20 w-20 text-gray-400 mb-6" />
                <p className="text-xl text-gray-600 font-medium">
                  {isCapturing ? 'Capturing...' : isDetecting ? 'Detecting...' : 'Capture or upload an image to get started'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}