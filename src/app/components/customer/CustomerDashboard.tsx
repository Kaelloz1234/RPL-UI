import { useEffect, useState } from 'react';
import { CustomerNavigation } from '../shared/CustomerNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Package, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../services/database';

export function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      const userOrders = db.getOrdersByCustomerId(user.id);
      const userTransactions = db.getTransactionsByCustomerId(user.id);
      setOrders(userOrders);
      setTransactions(userTransactions);
    }
  }, [user]);

  const totalOrders = orders.length;
  const ongoingOrders = orders.filter(o => o.status === 'Antrian' || o.status === 'Proses').length;
  const completedOrders = orders.filter(o => o.status === 'Selesai' || o.status === 'Siap Diambil').length;
  const totalSpent = transactions
    .filter(t => t.paymentStatus === 'Lunas')
    .reduce((sum, t) => sum + t.amount, 0);

  const stats = [
    {
      title: 'Total Pesanan',
      value: totalOrders.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Sedang Proses',
      value: ongoingOrders.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Selesai',
      value: completedOrders.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Transaksi',
      value: `Rp ${totalSpent.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Selamat Datang, {user?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Berikut adalah ringkasan aktivitas laundry Anda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`${stat.bgColor} p-2 sm:p-3 rounded-full`}>
                        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                      <h3 className="text-base sm:text-lg lg:text-xl text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2"
                  >
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900">{order.id}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{order.packageName}</p>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                      <span
                        className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs ${
                          order.status === 'Selesai' || order.status === 'Siap Diambil'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'Proses'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {order.status}
                      </span>
                      <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Belum ada pesanan</p>
                <p className="text-xs text-gray-400 mt-1">Buat pesanan pertama Anda sekarang!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
