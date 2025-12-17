import { useState, useEffect } from 'react';
import { CustomerNavigation } from '../shared/CustomerNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, CreditCard, Smartphone, Banknote, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, Transaction, Order } from '../../services/database';

export function Payment() {
  const { user } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      loadPendingOrders();
    }
  }, [user]);

  const loadPendingOrders = () => {
    if (!user) return;
    
    const userOrders = db.getOrdersByCustomerId(user.id);
    const pending = userOrders.filter(order => {
      const transaction = db.getTransactionByOrderId(order.id);
      return transaction?.paymentStatus === 'Pending';
    });
    
    setPendingOrders(pending);
  };

  const paymentMethods = [
    { id: 'bank', name: 'Transfer Bank', icon: CreditCard, desc: 'BCA, Mandiri, BNI, BRI' },
    { id: 'ewallet', name: 'E-Wallet', icon: Smartphone, desc: 'GoPay, OVO, DANA, ShopeePay' },
    { id: 'cash', name: 'Tunai', icon: Banknote, desc: 'Bayar saat pengambilan' },
  ];

  const selectedOrder = pendingOrders.find(order => order.id === selectedOrderId);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOrder) return;

    const transaction = db.getTransactionByOrderId(selectedOrder.id);
    if (transaction) {
      db.updateTransaction(transaction.id, {
        paymentMethod: paymentMethods.find(m => m.id === paymentMethod)?.name || '',
        paymentStatus: 'Lunas',
      });

      db.updateOrder(selectedOrder.id, {
        status: 'Proses',
        updatedAt: new Date().toISOString(),
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedOrderId('');
        setPaymentMethod('');
        loadPendingOrders();
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Pembayaran
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Lakukan pembayaran untuk pesanan laundry Anda
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Pembayaran berhasil! Terima kasih atas transaksi Anda.
            </AlertDescription>
          </Alert>
        )}

        {pendingOrders.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Pilih Pesanan</CardTitle>
                  <CardDescription className="text-sm">Pilih pesanan yang akan dibayar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="order" className="text-sm">Pesanan</Label>
                    <Select value={selectedOrderId} onValueChange={setSelectedOrderId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih pesanan" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingOrders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.id} - {order.packageName} ({order.weight} kg) - Rp {order.totalCost.toLocaleString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Metode Pembayaran</CardTitle>
                  <CardDescription className="text-sm">
                    Pilih metode pembayaran yang Anda inginkan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <div
                            key={method.id}
                            className={`flex items-start space-x-3 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${
                              paymentMethod === method.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                            <Icon className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                            <Label htmlFor={method.id} className="cursor-pointer flex-1">
                              <div>
                                <p className="text-sm font-medium">{method.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                              </div>
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Ringkasan Pembayaran</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedOrder ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Pesanan:</span>
                          <span className="text-gray-900 font-medium">{selectedOrder.id}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Paket:</span>
                          <span className="text-gray-900 font-medium">{selectedOrder.packageName}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Berat:</span>
                          <span className="text-gray-900 font-medium">{selectedOrder.weight} kg</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900 font-medium">
                            Rp {selectedOrder.totalCost.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Biaya Admin:</span>
                          <span className="text-gray-900 font-medium">Rp 0</span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-sm sm:text-base font-medium text-gray-900">Total:</span>
                          <span className="text-lg sm:text-xl font-bold text-blue-600">
                            Rp {selectedOrder.totalCost.toLocaleString()}
                          </span>
                        </div>
                        <Button
                          className="w-full"
                          disabled={!paymentMethod}
                          onClick={handlePayment}
                        >
                          Bayar Sekarang
                        </Button>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500 text-center py-8">
                      Pilih pesanan untuk melihat ringkasan
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base text-gray-500 mb-2">Tidak ada pesanan yang perlu dibayar</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Semua pesanan Anda sudah dibayar atau belum ada pesanan baru
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}