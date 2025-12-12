import { useState, useEffect } from 'react';
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
import { RefreshCw, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { ProductFormModal } from './ProductFormModal';
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
import type { RequestConfig } from '@/types';

interface Product {
  id: string;
  nama_produk: string;
  kategori: string;
  harga: number | string;
  stok: number | string;
  deskripsi: string;
  gambar?: Blob | string | null;
}

const BASE_URL =
  import.meta.env.VITE_API_PRODUK_URL ||
  'http://localhost/dbrest/api/produk.php';

interface ProductTableProps {}

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

export function ProductTable({}: ProductTableProps = {}) {
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
    gambar: null as File | null,
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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const dataUrl = reader.result as string;
          // Ekstrak hanya base64 string tanpa prefix data:image/...
          const base64String = dataUrl.includes(',')
            ? dataUrl.split(',')[1]
            : dataUrl;
          resolve(base64String);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsDataURL(file);
    });
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const bodyData: any = {
        nama_produk: formData.nama_produk.trim(),
        kategori: formData.kategori.trim(),
        harga: Number(formData.harga.trim()),
        stok: Number(formData.stok.trim()),
        deskripsi: formData.deskripsi.trim(),
      };

      // Jika ada gambar, konversi ke base64
      if (formData.gambar) {
        try {
          bodyData.gambar = await fileToBase64(formData.gambar);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          toast.error('Error', {
            description: 'Gagal memproses gambar',
          });
          setIsLoading(false);
          return;
        }
      }

      const requestConfig: RequestConfig = {
        url: BASE_URL,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      };

      console.log('Creating product with data:', {
        ...bodyData,
        gambar: bodyData.gambar
          ? `${bodyData.gambar.substring(0, 50)}...`
          : null,
      });

      const response = await makeRequest(requestConfig);

      console.log('Response:', response);

      // Cek response status dan juga response.data.response untuk error dari backend
      const isSuccess =
        (response.status === 200 || response.status === 201) &&
        response.data?.response !== 500 &&
        response.data?.response !== 400;

      if (isSuccess) {
        setIsDialogOpen(false);
        resetForm();
        loadProducts();
        toast.success('Produk berhasil ditambahkan');
      } else {
        console.error('Failed to create product:', response);
        toast.error('Gagal menambahkan produk', {
          description:
            response.data?.message ||
            response.data?.error ||
            'Terjadi kesalahan saat menambahkan produk',
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
      const bodyData: any = {
        nama_produk: formData.nama_produk.trim(),
        kategori: formData.kategori.trim(),
        harga: Number(formData.harga.trim()),
        stok: Number(formData.stok.trim()),
        deskripsi: formData.deskripsi.trim(),
      };

      // Jika ada gambar baru, konversi ke base64 (tanpa prefix)
      if (formData.gambar) {
        try {
          bodyData.gambar = await fileToBase64(formData.gambar);
        } catch (error) {
          console.error('Error converting image to base64:', error);
          toast.error('Error', {
            description: 'Gagal memproses gambar',
          });
          setIsLoading(false);
          return;
        }
      } else if (editingProduct.gambar) {
        // Jika tidak ada gambar baru, kirim gambar lama untuk mempertahankannya
        // Backend PHP akan set gambar ke null jika field tidak dikirim
        // Backend mengirim gambar sebagai base64 string (sudah di-encode dengan base64_encode)
        // Kita kirim kembali base64 string tersebut, backend akan decode ke blob dengan base64_decode
        if (typeof editingProduct.gambar === 'string') {
          // Pastikan hanya base64 string tanpa prefix data:image/...
          let base64String = editingProduct.gambar.includes(',')
            ? editingProduct.gambar.split(',')[1]
            : editingProduct.gambar;

          // Validasi: pastikan string base64 valid (hanya karakter base64)
          // Base64 hanya mengandung A-Z, a-z, 0-9, +, /, dan = untuk padding
          if (/^[A-Za-z0-9+/]*={0,2}$/.test(base64String)) {
            bodyData.gambar = base64String;
          } else {
            console.warn('Gambar lama tidak valid base64, akan diabaikan');
          }
        }
      }

      const requestConfig = {
        url: `${BASE_URL}?id=${encodeURIComponent(editingProduct.id)}`,
        method: 'PUT' as const,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      };

      console.log('Updating product with data:', {
        ...bodyData,
        gambar: bodyData.gambar
          ? typeof bodyData.gambar === 'string'
            ? `${bodyData.gambar.substring(0, 50)}... (length: ${
                bodyData.gambar.length
              })`
            : '[Blob/Object]'
          : null,
      });

      // Log untuk debugging: cek apakah base64 valid
      if (bodyData.gambar && typeof bodyData.gambar === 'string') {
        console.log('Gambar base64 preview:', {
          first50: bodyData.gambar.substring(0, 50),
          last50: bodyData.gambar.substring(bodyData.gambar.length - 50),
          length: bodyData.gambar.length,
          isValidBase64: /^[A-Za-z0-9+/]*={0,2}$/.test(bodyData.gambar),
        });
      }

      const response = await makeRequest(requestConfig);

      console.log('Update response:', response);

      // Cek response status dan juga response.data.response untuk error dari backend
      const isSuccess =
        response.status === 200 &&
        response.data?.response !== 500 &&
        response.data?.response !== 400;

      if (isSuccess) {
        setIsDialogOpen(false);
        setEditingProduct(null);
        resetForm();
        loadProducts();
        toast.success('Produk berhasil diupdate');
      } else {
        console.error('Failed to update product:', response);
        toast.error('Gagal mengupdate produk', {
          description:
            response.data?.message ||
            response.data?.error ||
            'Terjadi kesalahan saat mengupdate produk',
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

      if (response.status === 200) {
        setIsDeleteDialogOpen(false);
        setDeleteProductId('');
        loadProducts();
        toast.success('Produk berhasil dihapus');
      } else {
        toast.error('Gagal menghapus produk');
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
      gambar: null,
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
      gambar: null,
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
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Gambar
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Nama Produk
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                      Kategori
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Harga
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
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
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {product.id}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.gambar ? (
                          <div className="flex justify-center">
                            <img
                              src={
                                typeof product.gambar === 'string'
                                  ? product.gambar.startsWith('data:')
                                    ? product.gambar
                                    : `data:image/jpeg;base64,${product.gambar}`
                                  : URL.createObjectURL(
                                      new Blob([product.gambar])
                                    )
                              }
                              alt={product.nama_produk}
                              className="h-12 w-12 object-cover rounded border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            Tidak ada gambar
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.nama_produk}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {product.kategori}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {typeof product.harga === 'number'
                          ? `Rp ${product.harga.toLocaleString('id-ID')}`
                          : `Rp ${Number(product.harga).toLocaleString(
                              'id-ID'
                            )}`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
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
        <ProductFormModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          editingProduct={editingProduct}
          onFormDataChange={(field, value) => {
            if (field === 'gambar') {
              setFormData({ ...formData, [field]: value as File | null });
            } else {
              setFormData({ ...formData, [field]: value as string });
            }
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
        />

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
