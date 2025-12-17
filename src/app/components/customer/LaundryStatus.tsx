import { useEffect, useState } from 'react';
import { CustomerNavigation } from '../shared/CustomerNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Package, Clock, CheckCircle, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, Order } from '../../services/database';

export function LaundryStatus() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const userOrders = db.getOrdersByCustomerId(user.id);
      setOrders(userOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Antrian':
        return 'bg-gray-100 text-gray-700';
      case 'Proses':
        return 'bg-yellow-100 text-yellow-700';
      case 'Selesai':
        return 'bg-green-100 text-green-700';
      case 'Siap Diambil':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Antrian':
        return Clock;
      case 'Proses':
        return Package;
      case 'Selesai':
        return CheckCircle;
      case 'Siap Diambil':
        return Truck;
      default:
        return Package;
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Status Laundry
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Pantau status pesanan laundry Anda secara real-time
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                      <div>
                        <CardTitle className="text-base sm:text-lg">{order.id}</CardTitle>
                        <p className="text-xs sm:text-sm text-gray-600 mt-1">{order.packageName}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} self-start`}>
                        {order.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600">Berat Cucian</p>
                          <p className="text-sm sm:text-base text-gray-900 font-medium">{order.weight} kg</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600">Update Terakhir</p>
                          <p className="text-sm sm:text-base text-gray-900 font-medium">
                            {formatDateTime(order.updatedAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm text-gray-600">Estimasi Selesai</p>
                          <p className="text-sm sm:text-base text-gray-900 font-medium">
                            {formatDate(order.estimatedTime)}
                          </p>
                        </div>
                      </div>
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-gray-600">Total Biaya:</span>
                          <span className="text-sm sm:text-base font-bold text-blue-600">
                            Rp {order.totalCost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm sm:text-base text-gray-500 mb-2">Belum ada pesanan</p>
              <p className="text-xs sm:text-sm text-gray-400">
                Buat pesanan laundry pertama Anda untuk melihat statusnya di sini
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
