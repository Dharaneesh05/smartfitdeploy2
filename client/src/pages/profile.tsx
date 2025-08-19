import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/auth-context';
import ProfileDashboard from '@/components/profile-dashboard';

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if not authenticated
  if (!user) {
    setLocation('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4" data-testid="title-profile">
            Your Profile
          </h1>
          <p className="text-xl text-gray-600">
            Manage your measurements, favorites, and fit history
          </p>
        </div>

        <ProfileDashboard />
      </div>
    </div>
  );
}
