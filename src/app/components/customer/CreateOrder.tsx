import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerNavigation } from '../shared/CustomerNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, Order, Package as LaundryPackage } from '../../services/database';

export function CreateOrder() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [packages, setPackages] = useState<LaundryPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [weight, setWeight] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const allPackages = db.getPackages();
    setPackages(allPackages);
  }, []);

  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage);
  const totalCost = selectedPkg && weight ? selectedPkg.price * parseFloat(weight) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedPkg) return;

    const orderId = `ORD-${Date.now()}`;
    const now = new Date().toISOString();
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + 2);

    const newOrder: Order = {
      id: orderId,
      customerId: user.id,
      customerName: user.name,
      packageId: selectedPackage,
      packageName: selectedPkg.name,
      weight: parseFloat(weight),
      totalCost: totalCost,
      status: 'Antrian',
      createdAt: now,
      updatedAt: now,
      estimatedTime: estimatedDate.toISOString(),
    };

    db.addOrder(newOrder);

    // Create transaction
    const transaction = {
      id: `TRX-${Date.now()}`,
      orderId: orderId,
      customerId: user.id,
      customerName: user.name,
      amount: totalCost,
      paymentMethod: '',
      paymentStatus: 'Pending' as 'Pending',
      date: now,
    };
    db.addTransaction(transaction);

    setShowSuccess(true);
    setTimeout(() => {
      navigate('/customer/payment');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavigation />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Buat Pesanan Laundry
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Isi formulir di bawah untuk membuat pesanan baru
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Pesanan berhasil dibuat! Mengarahkan ke halaman pembayaran...
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Form Pesanan</CardTitle>
            <CardDescription className="text-sm">
              Pilih paket laundry dan masukkan berat cucian Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="package">Paket Laundry</Label>
                <Select value={selectedPackage} onValueChange={setSelectedPackage} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih paket laundry" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name} - Rp {pkg.price.toLocaleString()}/kg
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Berat Cucian (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="Masukkan berat cucian"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                />
                <p className="text-xs sm:text-sm text-gray-500">Minimum 1 kg</p>
              </div>

              {selectedPkg && weight && (
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Paket:</span>
                    <span className="text-gray-900 font-medium">{selectedPkg.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Berat:</span>
                    <span className="text-gray-900 font-medium">{weight} kg</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Harga per kg:</span>
                    <span className="text-gray-900 font-medium">Rp {selectedPkg.price.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-blue-200 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">Total Biaya:</span>
                      <span className="text-lg font-bold text-blue-600">
                        Rp {totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={!selectedPackage || !weight || showSuccess}
              >
                {showSuccess ? 'Memproses...' : 'Konfirmasi Pesanan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
