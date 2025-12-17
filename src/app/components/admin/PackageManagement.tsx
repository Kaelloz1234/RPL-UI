import { useState, useEffect } from 'react';
import { AdminLayout } from '../shared/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Textarea } from '../ui/textarea';
import { Edit, Trash2, Plus, AlertCircle } from 'lucide-react';
import { db, Package as LaundryPackage } from '../../services/database';
import { toast } from 'sonner';

export function PackageManagement() {
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [packages, setPackages] = useState<LaundryPackage[]>([]);
  const [formData, setFormData] = useState({ name: '', price: '', description: '' });

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = () => {
    const allPackages = db.getPackages();
    setPackages(allPackages);
  };

  const handleAdd = () => {
    setEditMode(false);
    setCurrentId('');
    setFormData({ name: '', price: '', description: '' });
    setOpen(true);
  };

  const handleEdit = (pkg: LaundryPackage) => {
    setEditMode(true);
    setCurrentId(pkg.id);
    setFormData({ 
      name: pkg.name, 
      price: pkg.price.toString(), 
      description: pkg.description 
    });
    setOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      db.deletePackage(deleteId);
      loadPackages();
      toast.success('Paket berhasil dihapus');
      setDeleteId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editMode) {
      db.updatePackage(currentId, {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
      });
      toast.success('Paket berhasil diupdate');
    } else {
      const newPackage: LaundryPackage = {
        id: Date.now().toString(),
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
      };
      db.addPackage(newPackage);
      toast.success('Paket berhasil ditambahkan');
    }
    
    loadPackages();
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl text-gray-900 mb-2">
              Kelola Paket Laundry
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Atur paket layanan dan harga</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAdd} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Tambah Paket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editMode ? 'Edit Paket' : 'Tambah Paket Baru'}</DialogTitle>
                <DialogDescription className="text-sm">
                  {editMode ? 'Ubah informasi paket laundry' : 'Masukkan informasi paket laundry baru'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm">Nama Paket</Label>
                    <Input
                      id="name"
                      placeholder="Contoh: Cuci Kering"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm">Harga per Kg (Rp)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="Contoh: 7000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm">Deskripsi</Label>
                    <Textarea
                      id="description"
                      placeholder="Deskripsi paket..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="w-full sm:w-auto">
                    Batal
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editMode ? 'Simpan' : 'Tambah'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Daftar Paket</CardTitle>
          </CardHeader>
          <CardContent>
            {packages.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Paket</TableHead>
                        <TableHead>Harga per Kg</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg) => (
                        <TableRow key={pkg.id}>
                          <TableCell className="font-medium">{pkg.name}</TableCell>
                          <TableCell>Rp {pkg.price.toLocaleString()}</TableCell>
                          <TableCell className="text-gray-600 max-w-xs truncate">{pkg.description}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(pkg)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteId(pkg.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                  {packages.map((pkg) => (
                    <div key={pkg.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div>
                        <p className="font-medium text-gray-900">{pkg.name}</p>
                        <p className="text-sm text-blue-600 font-medium">
                          Rp {pkg.price.toLocaleString()} / kg
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{pkg.description}</p>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleEdit(pkg)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => setDeleteId(pkg.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base text-gray-500">Belum ada paket laundry</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus paket ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}