import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../shared/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Users, ShoppingBag, TrendingUp, Package, ArrowRight } from 'lucide-react';
import { db, Order, Transaction } from '../../services/database';

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeOrders: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const totalCustomers = db.getTotalCustomers();
    const totalOrders = db.getTotalOrders();
    const totalRevenue = db.getTotalRevenue();
    const activeOrders = db.getOrdersByStatus('Proses').length + db.getOrdersByStatus('Antrian').length;

    setStats({
      totalCustomers,
      totalOrders,
      totalRevenue,
      activeOrders,
    });

    const allTransactions = db.getTransactions();
    const recent = allTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
    setRecentTransactions(recent);
  };

  const statsData = [
    {
      title: 'Total Pelanggan',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Transaksi',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Pesanan Aktif',
      value: stats.activeOrders.toString(),
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">Dashboard Admin</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Selamat datang di panel administrasi Sistem Laundry Digital
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col gap-3">
                    <div className={`${stat.bgColor} p-2 sm:p-3 rounded-full w-fit`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</p>
                      <h3 className="text-base sm:text-lg lg:text-2xl text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-base sm:text-lg lg:text-xl">Transaksi Terbaru</CardTitle>
                <Link to="/admin/orders">
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTransactions.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentTransactions.map((trx) => {
                    const order = db.getOrderById(trx.orderId);
                    return (
                      <div
                        key={trx.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{trx.id}</p>
                          <p className="text-xs sm:text-sm text-gray-600 truncate">{trx.customerName}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <div className="text-left sm:text-right">
                            <p className="text-xs sm:text-sm text-gray-900">{order?.packageName}</p>
                            <p className="text-xs text-gray-600">Rp {trx.amount.toLocaleString()}</p>
                          </div>
                          <span
                            className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs whitespace-nowrap ${
                              trx.paymentStatus === 'Lunas'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {trx.paymentStatus}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Belum ada transaksi</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base sm:text-lg lg:text-xl">Aksi Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Link to="/admin/orders" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium">Kelola Pesanan</p>
                        <p className="text-xs text-gray-600">Lihat dan kelola semua pesanan</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                
                <Link to="/admin/customers" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium">Data Pelanggan</p>
                        <p className="text-xs text-gray-600">Kelola informasi pelanggan</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>

                <Link to="/admin/reports" className="block">
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium">Laporan</p>
                        <p className="text-xs text-gray-600">Lihat laporan dan analisis</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}