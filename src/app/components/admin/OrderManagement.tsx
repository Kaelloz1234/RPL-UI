import { useState, useEffect } from 'react';
import { AdminLayout } from '../shared/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Search, Eye, AlertCircle, Package, User, Calendar, Weight, DollarSign } from 'lucide-react';
import { db, Order } from '../../services/database';
import { toast } from 'sonner';

export function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = () => {
    const allOrders = db.getOrders();
    // Sort by newest first
    const sortedOrders = allOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setOrders(sortedOrders);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'Semua' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailDialogOpen(true);
  };

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    db.updateOrder(orderId, { 
      status: newStatus,
      updatedAt: new Date().toISOString()
    });
    loadOrders();
    
    // Update selected order if it's the one being changed
    if (selectedOrder?.id === orderId) {
      const updatedOrder = db.getOrderById(orderId);
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
    
    toast.success('Status pesanan berhasil diperbarui');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Antrian':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Proses':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Selesai':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Siap Diambil':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const statusOptions: Order['status'][] = ['Antrian', 'Proses', 'Selesai', 'Siap Diambil'];

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Kelola Pesanan
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Lihat dan kelola semua pesanan laundry dari pelanggan
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <CardTitle className="text-base sm:text-lg">Daftar Pesanan</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Cari pesanan atau pelanggan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40 text-sm">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Semua">Semua Status</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID Pesanan</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Paket</TableHead>
                        <TableHead>Berat</TableHead>
                        <TableHead>Total Biaya</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tanggal</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.packageName}</TableCell>
                          <TableCell>{order.weight} kg</TableCell>
                          <TableCell>Rp {order.totalCost.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(order.status)}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetail(order)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile & Tablet Cards */}
                <div className="lg:hidden space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{order.id}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Paket:</p>
                          <p className="text-gray-900">{order.packageName}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Berat:</p>
                          <p className="text-gray-900">{order.weight} kg</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total:</p>
                          <p className="text-gray-900">Rp {order.totalCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Tanggal:</p>
                          <p className="text-gray-900 text-xs">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleViewDetail(order)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Lihat Detail
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500">
                  {searchTerm || statusFilter !== 'Semua'
                    ? 'Tidak ada pesanan ditemukan'
                    : 'Belum ada pesanan'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Pesanan</DialogTitle>
              <DialogDescription>
                Informasi lengkap dan kelola status pesanan
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      ID Pesanan
                    </Label>
                    <p className="text-sm font-medium">{selectedOrder.id}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Pelanggan
                    </Label>
                    <p className="text-sm font-medium">{selectedOrder.customerName}</p>
                    <p className="text-xs text-gray-500">ID: {selectedOrder.customerId}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Paket Laundry</Label>
                    <p className="text-sm font-medium">{selectedOrder.packageName}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-2">
                      <Weight className="w-4 h-4" />
                      Berat Cucian
                    </Label>
                    <p className="text-sm font-medium">{selectedOrder.weight} kg</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Total Biaya
                    </Label>
                    <p className="text-lg font-bold text-blue-600">
                      Rp {selectedOrder.totalCost.toLocaleString()}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal Pesanan
                    </Label>
                    <p className="text-sm">{formatDate(selectedOrder.createdAt)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Estimasi Selesai</Label>
                    <p className="text-sm">{formatDate(selectedOrder.estimatedTime)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Terakhir Diperbarui</Label>
                    <p className="text-sm">{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>

                {/* Status Management */}
                <div className="space-y-3 pt-4 border-t">
                  <Label className="text-sm font-medium">Ubah Status Pesanan</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {statusOptions.map((status) => (
                      <Button
                        key={status}
                        variant={selectedOrder.status === status ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleStatusChange(selectedOrder.id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    Status saat ini: <span className="font-medium">{selectedOrder.status}</span>
                  </p>
                </div>

                {/* Payment Status */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 mb-2">Status Pembayaran</p>
                  {(() => {
                    const transaction = db.getTransactionByOrderId(selectedOrder.id);
                    return (
                      <Badge className={
                        transaction?.paymentStatus === 'Lunas'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }>
                        {transaction?.paymentStatus || 'Pending'}
                      </Badge>
                    );
                  })()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
