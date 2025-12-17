import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, Shirt, Clock, Shield } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            <h1 className="text-blue-600">Sistem Laundry Digital</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/register')}>
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-blue-600 mb-6">
          Layanan Laundry Digital Terpercaya
        </h1>
        <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
          Nikmati kemudahan layanan laundry dengan sistem digital yang modern, cepat, dan terpercaya
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/register')}>
            Mulai Sekarang
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
            Login
          </Button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shirt className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2">Layanan Profesional</h3>
            <p className="text-gray-600">
              Cucian Anda ditangani oleh tenaga profesional dengan peralatan modern
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2">Cepat & Tepat Waktu</h3>
            <p className="text-gray-600">
              Proses cepat dengan estimasi waktu yang jelas dan dapat dipantau
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h3 className="mb-2">Aman & Terpercaya</h3>
            <p className="text-gray-600">
              Sistem pembayaran digital yang aman dengan tracking real-time
            </p>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-gray-600">
          <p>&copy; 2024 Sistem Laundry Digital. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
