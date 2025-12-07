import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { makeRequest } from '@/utils/api';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import type { RequestConfig, ApiResponse } from '@/types';

interface Product {
  id: string;
  nama_produk: string;
  kategori: string;
  harga: number | string;
  stok: number | string;
  deskripsi: string;
}

const BASE_URL =
  import.meta.env.VITE_API_PRODUK_URL ||
  'http://localhost/dbrest/api/produk.php';

interface ProductTableProps {
  onAddHistory?: (config: RequestConfig, response: ApiResponse) => void;
}

const KATEGORI_OPTIONS = [
  'Mobile Legends: Bang Bang',
  'Free Fire',
  'PUBG Mobile',
  'Genshin Impact',
  'Roblox',
  'Block Blast!',
  'Stumble Guys',
  'Honkai: Star Rail',
  'Call of Duty Mobile',
  'Free Fire MAX',
  'Higgs Domino Island',
  'Clash of Clans',
  'Lainnya',
];

export function ProductTable({ onAddHistory }: ProductTableProps = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string>('');
  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: '',
    harga: '',
    stok: '',
    deskripsi: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate pagination
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = products.slice(startIndex, endIndex);

  // Reset to page 1 when products change
  useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  // Load data saat komponen mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const requestConfig: RequestConfig = {
        url: BASE_URL,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await makeRequest(requestConfig);

      // Add to history
      if (onAddHistory) {
        onAddHistory(requestConfig, response);
      }

      if (response.status === 200 && response.data) {
        let data = response.data;

        // Handle berbagai struktur response
        if (Array.isArray(data)) {
          setProducts(data);
        } else if (data.data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else if (data.result && Array.isArray(data.result)) {
          setProducts(data.result);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat memuat data produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_produk.trim()) {
      newErrors.nama_produk = 'Nama produk harus diisi';
    } else if (
      !isNaN(Number(formData.nama_produk.trim())) &&
      formData.nama_produk.trim() !== ''
    ) {
      newErrors.nama_produk = 'Nama produk harus berupa teks';
    }

    if (!formData.kategori.trim()) {
      newErrors.kategori = 'Kategori harus diisi';
    } else if (!KATEGORI_OPTIONS.includes(formData.kategori.trim())) {
      newErrors.kategori = 'Kategori harus dipilih dari daftar yang tersedia';
    }

    if (!formData.harga.trim()) {
      newErrors.harga = 'Harga harus diisi';
    } else if (
      isNaN(Number(formData.harga.trim())) ||
      Number(formData.harga.trim()) < 0
    ) {
      newErrors.harga = 'Harga harus berupa angka positif';
    }

    if (!formData.stok.trim()) {
      newErrors.stok = 'Stok harus diisi';
    } else if (
      isNaN(Number(formData.stok.trim())) ||
      Number(formData.stok.trim()) < 0
    ) {
      newErrors.stok = 'Stok harus berupa angka positif';
    }

    if (!formData.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi harus diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const requestConfig: RequestConfig = {
        url: BASE_URL,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_produk: formData.nama_produk.trim(),
          kategori: formData.kategori.trim(),
          harga: Number(formData.harga.trim()),
          stok: Number(formData.stok.trim()),
          deskripsi: formData.deskripsi.trim(),
        }),
      };

      const response = await makeRequest(requestConfig);

      // Add to history
      if (onAddHistory) {
        onAddHistory(requestConfig, response);
      }

      if (response.status === 200 || response.status === 201) {
        setIsDialogOpen(false);
        resetForm();
        loadProducts();
        toast.success('Produk berhasil ditambahkan', {
          description: (
            <pre className="mt-2 w-full rounded-md bg-transparent p-2 text-xs overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          ),
        });
      } else {
        toast.error('Gagal menambahkan produk', {
          description: `Status: ${response.status} - ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat menambahkan produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct || !validateForm()) return;

    setIsLoading(true);
    try {
      const requestConfig = {
        url: `${BASE_URL}?id=${encodeURIComponent(editingProduct.id)}`,
        method: 'PUT' as const,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_produk: formData.nama_produk.trim(),
          kategori: formData.kategori.trim(),
          harga: Number(formData.harga.trim()),
          stok: Number(formData.stok.trim()),
          deskripsi: formData.deskripsi.trim(),
        }),
      };

      const response = await makeRequest(requestConfig);

      // Add to history
      if (onAddHistory) {
        onAddHistory(requestConfig, response);
      }

      if (response.status === 200) {
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        loadProducts();
        toast.success('Produk berhasil diupdate', {
          description: (
            <pre className="mt-2 w-full rounded-md bg-transparent p-2 text-xs overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          ),
        });
      } else {
        toast.error('Gagal mengupdate produk', {
          description: `Status: ${response.status} - ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat mengupdate produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    setIsLoading(true);
    try {
      const requestConfig: RequestConfig = {
        url: `${BASE_URL}?id=${encodeURIComponent(deleteProductId)}`,
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await makeRequest(requestConfig);

      // Add to history
      if (onAddHistory) {
        onAddHistory(requestConfig, response);
      }

      if (response.status === 200) {
        setIsDeleteDialogOpen(false);
        setDeleteProductId('');
        loadProducts();
        toast.success('Produk berhasil dihapus', {
          description: (
            <pre className="mt-2 w-full rounded-md bg-transparent p-2 text-xs overflow-auto max-h-40 whitespace-pre-wrap break-words">
              {JSON.stringify(response.data, null, 2)}
            </pre>
          ),
        });
      } else {
        toast.error('Gagal menghapus produk', {
          description: `Status: ${response.status} - ${response.statusText}`,
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat menghapus produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nama_produk: String(product.nama_produk || ''),
      kategori: String(product.kategori || ''),
      harga: String(product.harga || ''),
      stok: String(product.stok || ''),
      deskripsi: String(product.deskripsi || ''),
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteProductId(id);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      nama_produk: '',
      kategori: '',
      harga: '',
      stok: '',
      deskripsi: '',
    });
    setErrors({});
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Tabel CRUD Produk
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
              Kelola data produk dengan operasi Create, Read, Update, Delete
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadProducts}
              variant="outline"
              size="sm"
              disabled={isLoading}
              className="border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? 'Memuat...' : 'Refresh'}
            </Button>
            <Button
              onClick={openCreateDialog}
              size="sm"
              className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Produk
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        {isLoading && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Memuat data produk...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>
              Tidak ada data produk. Klik "Tambah Produk" untuk menambahkan
              data.
            </p>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-600">Memuat ulang data...</p>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Nama Produk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Stok
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Deskripsi
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.nama_produk}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.kategori}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {typeof product.harga === 'number'
                          ? `Rp ${product.harga.toLocaleString('id-ID')}`
                          : `Rp ${Number(product.harga).toLocaleString(
                              'id-ID'
                            )}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.stok}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate"
                        title={product.deskripsi}>
                        {product.deskripsi}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => openEditDialog(product)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800 cursor-pointer transition-colors">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(String(product.id))}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 cursor-pointer transition-colors">
                            <Trash2 className="h-3 w-3 mr-1" />
                            Hapus
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) {
                            setCurrentPage(currentPage - 1);
                          }
                        }}
                        className={
                          currentPage === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setCurrentPage(page);
                                }}
                                isActive={currentPage === page}
                                className="cursor-pointer">
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === currentPage - 2 ||
                          page === currentPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      }
                    )}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) {
                            setCurrentPage(currentPage + 1);
                          }
                        }}
                        className={
                          currentPage === totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct
                  ? 'Ubah informasi produk di bawah ini'
                  : 'Isi form di bawah ini untuk menambahkan produk baru'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nama_produk">
                  Nama Produk <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama_produk"
                  value={formData.nama_produk}
                  onChange={(e) => {
                    setFormData({ ...formData, nama_produk: e.target.value });
                    if (errors.nama_produk)
                      setErrors({ ...errors, nama_produk: '' });
                  }}
                  className={errors.nama_produk ? 'border-red-500' : ''}
                />
                {errors.nama_produk && (
                  <p className="text-xs text-red-600">{errors.nama_produk}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="kategori">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(value) => {
                    setFormData({ ...formData, kategori: value });
                    if (errors.kategori) setErrors({ ...errors, kategori: '' });
                  }}>
                  <SelectTrigger
                    id="kategori"
                    className={`w-full${
                      errors.kategori ? ' border-red-500' : ''
                    }`}>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_OPTIONS.map((kategori) => (
                      <SelectItem key={kategori} value={kategori}>
                        {kategori}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.kategori && (
                  <p className="text-xs text-red-600">{errors.kategori}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="harga">
                  Harga <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="harga"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.harga}
                  onChange={(e) => {
                    setFormData({ ...formData, harga: e.target.value });
                    if (errors.harga) setErrors({ ...errors, harga: '' });
                  }}
                  className={errors.harga ? 'border-red-500' : ''}
                />
                {errors.harga && (
                  <p className="text-xs text-red-600">{errors.harga}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stok">
                  Stok <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stok"
                  type="number"
                  min="0"
                  value={formData.stok}
                  onChange={(e) => {
                    setFormData({ ...formData, stok: e.target.value });
                    if (errors.stok) setErrors({ ...errors, stok: '' });
                  }}
                  className={errors.stok ? 'border-red-500' : ''}
                />
                {errors.stok && (
                  <p className="text-xs text-red-600">{errors.stok}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskripsi">
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => {
                    setFormData({ ...formData, deskripsi: e.target.value });
                    if (errors.deskripsi)
                      setErrors({ ...errors, deskripsi: '' });
                  }}
                  className={errors.deskripsi ? 'border-red-500' : ''}
                  rows={4}
                />
                {errors.deskripsi && (
                  <p className="text-xs text-red-600">{errors.deskripsi}</p>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                disabled={isLoading}>
                Batal
              </Button>
              <Button
                onClick={editingProduct ? handleUpdate : handleCreate}
                disabled={isLoading}
                className="bg-blue-600 text-white hover:bg-blue-700">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : editingProduct ? (
                  'Update'
                ) : (
                  'Simpan'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
                dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-red-600 text-white hover:bg-red-700">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  'Hapus'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
