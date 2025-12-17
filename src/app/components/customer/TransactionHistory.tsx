import { useState, useEffect } from 'react';
import { CustomerNavigation } from '../shared/CustomerNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { db, Transaction } from '../../services/database';

export function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = () => {
    if (!user) return;
    const userTransactions = db.getTransactionsByCustomerId(user.id);
    setTransactions(userTransactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const filteredTransactions = transactions.filter((trx) => {
    if (!startDate && !endDate) return true;
    const trxDate = new Date(trx.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return trxDate >= start && trxDate <= end;
    } else if (start) {
      return trxDate >= start;
    } else if (end) {
      return trxDate <= end;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getOrderInfo = (orderId: string) => {
    const order = db.getOrderById(orderId);
    return order;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerNavigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
            Riwayat Transaksi
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Lihat semua transaksi laundry yang pernah Anda lakukan
          </p>
        </div>

        <Card className="mb-4 sm:mb-6">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Filter Berdasarkan Tanggal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Daftar Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tanggal</TableHead>
                        <TableHead>ID Transaksi</TableHead>
                        <TableHead>ID Pesanan</TableHead>
                        <TableHead>Paket</TableHead>
                        <TableHead>Total Pembayaran</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((trx) => {
                        const order = getOrderInfo(trx.orderId);
                        return (
                          <TableRow key={trx.id}>
                            <TableCell>{formatDate(trx.date)}</TableCell>
                            <TableCell className="font-medium">{trx.id}</TableCell>
                            <TableCell>{trx.orderId}</TableCell>
                            <TableCell>{order?.packageName || '-'}</TableCell>
                            <TableCell>Rp {trx.amount.toLocaleString()}</TableCell>
                            <TableCell>{trx.paymentMethod || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  trx.paymentStatus === 'Lunas'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }
                              >
                                {trx.paymentStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {filteredTransactions.map((trx) => {
                    const order = getOrderInfo(trx.orderId);
                    return (
                      <div key={trx.id} className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{trx.id}</p>
                            <p className="text-xs text-gray-600">{formatDate(trx.date)}</p>
                          </div>
                          <Badge
                            className={
                              trx.paymentStatus === 'Lunas'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }
                          >
                            {trx.paymentStatus}
                          </Badge>
                        </div>
                        <div className="pt-2 border-t space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Pesanan:</span>
                            <span className="text-gray-900">{trx.orderId}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Paket:</span>
                            <span className="text-gray-900">{order?.packageName || '-'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Metode:</span>
                            <span className="text-gray-900">{trx.paymentMethod || '-'}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium pt-1">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-blue-600">Rp {trx.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500 mb-2">
                  {startDate || endDate ? 'Tidak ada transaksi pada periode ini' : 'Belum ada transaksi'}
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  {startDate || endDate ? 'Coba ubah filter tanggal' : 'Transaksi Anda akan muncul di sini'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
