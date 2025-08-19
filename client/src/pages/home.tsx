import HeroSection from '@/components/hero-section';
import { Camera, Shirt, Wand2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      
      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI-powered system uses advanced computer vision to provide accurate measurements and fit predictions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center space-y-6" data-testid="step-1">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Camera className="text-2xl text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">1. Capture Measurements</h3>
                <p className="text-gray-600">Use your camera or upload photos to capture body measurements using MediaPipe AI technology with face blurring for privacy.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center space-y-6" data-testid="step-2">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Shirt className="text-2xl text-success" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">2. Upload Product</h3>
                <p className="text-gray-600">Upload clothing images or enter product details. Our YOLO-powered system extracts size information automatically.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center space-y-6" data-testid="step-3">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <Wand2 className="text-2xl text-purple-600" />
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">3. Get AR Preview</h3>
                <p className="text-gray-600">See how clothes fit with real-time AR visualization and get accurate fit predictions with personalized recommendations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
