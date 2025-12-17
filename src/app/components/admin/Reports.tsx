import { useState, useEffect } from 'react';
import { AdminLayout } from '../shared/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Download, Calendar, TrendingUp, ShoppingBag, Users } from 'lucide-react';
import { db, Order } from '../../services/database';
import { toast } from 'sonner';

export function Reports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeCustomers: 0,
  });
  const [topPackages, setTopPackages] = useState<any[]>([]);

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate]);

  const loadReportData = () => {
    let orders = db.getOrders();

    // Filter by date if set
    if (startDate || endDate) {
      orders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        if (start && end) {
          return orderDate >= start && orderDate <= end;
        } else if (start) {
          return orderDate >= start;
        } else if (end) {
          return orderDate <= end;
        }
        return true;
      });
    }

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalCost, 0);
    
    // Get unique customers from filtered orders
    const uniqueCustomers = new Set(orders.map(o => o.customerId));
    const activeCustomers = uniqueCustomers.size;

    setStats({
      totalOrders,
      totalRevenue,
      activeCustomers,
    });

    // Calculate top packages
    const packageStats = new Map<string, { name: string; orders: number; revenue: number }>();
    
    orders.forEach((order) => {
      const existing = packageStats.get(order.packageId);
      if (existing) {
        existing.orders += 1;
        existing.revenue += order.totalCost;
      } else {
        packageStats.set(order.packageId, {
          name: order.packageName,
          orders: 1,
          revenue: order.totalCost,
        });
      }
    });

    const topPkgs = Array.from(packageStats.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setTopPackages(topPkgs);
  };

  const handleExport = () => {
    if (!startDate || !endDate) {
      toast.error('Pilih tanggal mulai dan akhir terlebih dahulu');
      return;
    }

    // Create CSV content
    const orders = db.getOrders().filter((order) => {
      const orderDate = new Date(order.createdAt);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return orderDate >= start && orderDate <= end;
    });

    let csvContent = 'ID Pesanan,Tanggal,Pelanggan,Paket,Berat (kg),Total (Rp),Status\n';
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toLocaleDateString('id-ID');
      csvContent += `${order.id},${date},${order.customerName},${order.packageName},${order.weight},${order.totalCost},${order.status}\n`;
    });

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_${startDate}_${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Laporan berhasil diexport');
  };

  const summaryStats = [
    {
      title: 'Total Pesanan',
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${(stats.totalRevenue / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Pelanggan Aktif',
      value: stats.activeCustomers.toString(),
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Laporan Operasional
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Lihat ringkasan dan analisis kinerja laundry
          </p>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm">Tanggal Mulai</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm">Tanggal Akhir</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <Button onClick={handleExport} disabled={!startDate || !endDate} size="sm" className="w-full lg:w-auto">
                <Download className="w-4 h-4 mr-2" />
                Export Laporan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {summaryStats.map((stat, index) => {
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
                      <h3 className="text-lg sm:text-xl lg:text-2xl text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Top Packages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Paket Terpopuler</CardTitle>
          </CardHeader>
          <CardContent>
            {topPackages.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {topPackages.map((pkg, index) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-lg gap-2">
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-medium text-gray-900">{pkg.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{pkg.orders} pesanan</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm sm:text-base font-bold text-blue-600">
                        Rp {pkg.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Tidak ada data untuk periode ini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}