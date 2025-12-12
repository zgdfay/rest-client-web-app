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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw, Plus, Edit, Trash2, Loader2, Eye } from 'lucide-react';
import { TransaksiFormModal } from './TransaksiFormModal';
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

interface Transaksi {
  id: string;
  product_id: string | number;
  qty: string | number;
  total_harga: string | number;
  tanggal?: string;
  nama_produk?: string;
}

const BASE_URL =
  import.meta.env.VITE_API_TRANSAKSI_URL ||
  'http://localhost/dbrest/api/transaksi.php';

const PRODUCT_BASE_URL =
  import.meta.env.VITE_API_PRODUK_URL ||
  'http://localhost/dbrest/api/produk.php';

interface TransaksiTableProps {}

interface Product {
  id: string;
  nama_produk: string;
  kategori: string;
  harga: number | string;
  stok: number | string;
  deskripsi: string;
  gambar?: Blob | string | null;
}

export function TransaksiTable({}: TransaksiTableProps = {}) {
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [editingTransaksi, setEditingTransaksi] = useState<Transaksi | null>(
    null
  );
  const [detailTransaksi, setDetailTransaksi] = useState<Transaksi | null>(
    null
  );
  const [deleteTransaksiId, setDeleteTransaksiId] = useState<string>('');
  const [formData, setFormData] = useState({
    product_id: '',
    qty: '',
    total_harga: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  // Calculate pagination
  const totalPages = Math.ceil(transaksis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransaksis = transaksis.slice(startIndex, endIndex);

  // Reset to page 1 when transaksis change
  useEffect(() => {
    setCurrentPage(1);
  }, [transaksis.length]);

  // Load products
  const loadProducts = async () => {
    try {
      const response = await makeRequest({
        url: PRODUCT_BASE_URL,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

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
    }
  };

  // Load data saat komponen mount
  useEffect(() => {
    loadTransaksis();
    loadProducts();
  }, []);

  const loadProductName = async (productId: string | number) => {
    try {
      const response = await makeRequest({
        url: `${PRODUCT_BASE_URL}?id=${encodeURIComponent(productId)}`,
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200 && response.data) {
        let productData = response.data;

        // Handle berbagai struktur response
        if (Array.isArray(productData) && productData.length > 0) {
          productData = productData[0];
        } else if (productData.data && typeof productData.data === 'object') {
          productData = productData.data;
        } else if (
          productData.result &&
          typeof productData.result === 'object'
        ) {
          productData = productData.result;
        }

        if (
          productData &&
          typeof productData === 'object' &&
          productData.nama_produk
        ) {
          setProductNames((prev) => ({
            ...prev,
            [String(productId)]: productData.nama_produk,
          }));
        }
      }
    } catch (error) {
      console.error('Error loading product name:', error);
    }
  };

  const loadTransaksis = async () => {
    setIsLoading(true);
    try {
      const requestConfig = {
        url: BASE_URL,
        method: 'GET' as const,
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await makeRequest(requestConfig);


      if (response.status === 200 && response.data) {
        let data = response.data;

        // Handle berbagai struktur response
        if (Array.isArray(data)) {
          setTransaksis(data);
          // Load product names for all transactions
          data.forEach((transaksi: Transaksi) => {
            if (transaksi.product_id) {
              loadProductName(transaksi.product_id);
            }
          });
        } else if (data.data && Array.isArray(data.data)) {
          setTransaksis(data.data);
          data.data.forEach((transaksi: Transaksi) => {
            if (transaksi.product_id) {
              loadProductName(transaksi.product_id);
            }
          });
        } else if (data.result && Array.isArray(data.result)) {
          setTransaksis(data.result);
          data.result.forEach((transaksi: Transaksi) => {
            if (transaksi.product_id) {
              loadProductName(transaksi.product_id);
            }
          });
        } else {
          setTransaksis([]);
        }
      } else {
        setTransaksis([]);
      }
    } catch (error) {
      console.error('Error loading transaksis:', error);
      setTransaksis([]);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat memuat data transaksi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_id.trim()) {
      newErrors.product_id = 'Product ID harus diisi';
    } else if (
      isNaN(Number(formData.product_id.trim())) ||
      Number(formData.product_id.trim()) < 0
    ) {
      newErrors.product_id = 'Product ID harus berupa angka positif';
    }

    if (!formData.qty.trim()) {
      newErrors.qty = 'Quantity harus diisi';
    } else if (
      isNaN(Number(formData.qty.trim())) ||
      Number(formData.qty.trim()) < 0
    ) {
      newErrors.qty = 'Quantity harus berupa angka positif';
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
          product_id: Number(formData.product_id.trim()),
          qty: Number(formData.qty.trim()),
        }),
      };

      const response = await makeRequest(requestConfig);


      if (response.status === 200 || response.status === 201) {
        // Kurangi stok produk setelah transaksi berhasil dibuat
        try {
          const productId = Number(formData.product_id.trim());
          const qty = Number(formData.qty.trim());

          // Ambil data produk
          const productResponse = await makeRequest({
            url: PRODUCT_BASE_URL,
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });

          if (productResponse.status === 200 && productResponse.data) {
            let products = productResponse.data;
            if (!Array.isArray(products)) {
              products = products.data || products.products || [];
            }

            // Cari produk berdasarkan ID
            const product = Array.isArray(products)
              ? products.find((p: any) => String(p.id) === String(productId))
              : null;

            if (product) {
              const currentStok = Number(product.stok) || 0;
              const newStok = Math.max(0, currentStok - qty); // Pastikan stok tidak negatif

              // Update stok produk
              const updateProductConfig: RequestConfig = {
                url: `${PRODUCT_BASE_URL}?id=${encodeURIComponent(product.id)}`,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  nama_produk: product.nama_produk,
                  kategori: product.kategori,
                  harga: Number(product.harga),
                  stok: newStok,
                  deskripsi: product.deskripsi,
                  gambar: product.gambar || null,
                }),
              };

              const updateResponse = await makeRequest(updateProductConfig);

              if (updateResponse.status === 200) {
                // Toast stok akan digabung dengan toast transaksi
              }
            }
          }
        } catch (error) {
          console.error('Error updating product stock:', error);
          // Tetap lanjutkan, error akan ditampilkan di toast transaksi jika perlu
        }

        setIsDialogOpen(false);
        resetForm();
        loadTransaksis();
        toast.success('Transaksi berhasil ditambahkan');
      } else {
        toast.error('Gagal menambahkan transaksi');
      }
    } catch (error) {
      console.error('Error creating transaksi:', error);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat menambahkan transaksi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingTransaksi || !validateForm()) return;

    setIsLoading(true);
    try {
      const requestConfig: RequestConfig = {
        url: `${BASE_URL}?id=${encodeURIComponent(editingTransaksi.id)}`,
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: Number(formData.product_id.trim()),
          qty: Number(formData.qty.trim()),
        }),
      };

      const response = await makeRequest(requestConfig);


      if (response.status === 200) {
        // Update stok produk setelah transaksi diupdate
        try {
          if (editingTransaksi) {
            const productId = Number(formData.product_id.trim());
            const newQty = Number(formData.qty.trim());
            const oldQtyValue = Number(editingTransaksi.qty) || 0;
            const qtyDifference = newQty - oldQtyValue; // Selisih qty baru dan lama

            // Ambil data produk
            const productResponse = await makeRequest({
              url: PRODUCT_BASE_URL,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });

            if (productResponse.status === 200 && productResponse.data) {
              let products = productResponse.data;
              if (!Array.isArray(products)) {
                products = products.data || products.products || [];
              }

              // Cari produk berdasarkan ID
              const product = Array.isArray(products)
                ? products.find((p: any) => String(p.id) === String(productId))
                : null;

              if (product) {
                const currentStok = Number(product.stok) || 0;
                const newStok = Math.max(0, currentStok - qtyDifference); // Kurangi/sesuaikan stok berdasarkan selisih

                // Update stok produk
                const updateProductConfig: RequestConfig = {
                  url: `${PRODUCT_BASE_URL}?id=${encodeURIComponent(
                    product.id
                  )}`,
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    nama_produk: product.nama_produk,
                    kategori: product.kategori,
                    harga: Number(product.harga),
                    stok: newStok,
                  deskripsi: product.deskripsi,
                  gambar: product.gambar || null,
                }),
                };

                const updateResponse = await makeRequest(updateProductConfig);


                if (updateResponse.status === 200) {
                  // Toast stok akan digabung dengan toast transaksi
                }
              }
            }
          }
        } catch (error) {
          console.error('Error updating product stock:', error);
          // Tetap lanjutkan, error akan ditampilkan di toast transaksi jika perlu
        }

        setIsDialogOpen(false);
        setEditingTransaksi(null);
        resetForm();
        loadTransaksis();
        toast.success('Transaksi berhasil diupdate');
      } else {
        toast.error('Gagal mengupdate transaksi');
      }
    } catch (error) {
      console.error('Error updating transaksi:', error);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat mengupdate transaksi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTransaksiId) return;

    setIsLoading(true);
    try {
      const requestConfig: RequestConfig = {
        url: `${BASE_URL}?id=${encodeURIComponent(deleteTransaksiId)}`,
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      };

      const response = await makeRequest(requestConfig);


      if (response.status === 200) {
        // Kembalikan stok produk setelah transaksi dihapus
        try {
          const deletedTransaksi = transaksis.find(
            (t) => String(t.id) === String(deleteTransaksiId)
          );

          if (deletedTransaksi) {
            const productId = Number(deletedTransaksi.product_id);
            const qty = Number(deletedTransaksi.qty);

            // Ambil data produk
            const productResponse = await makeRequest({
              url: PRODUCT_BASE_URL,
              method: 'GET',
              headers: { 'Content-Type': 'application/json' },
            });

            if (productResponse.status === 200 && productResponse.data) {
              let products = productResponse.data;
              if (!Array.isArray(products)) {
                products = products.data || products.products || [];
              }

              // Cari produk berdasarkan ID
              const product = Array.isArray(products)
                ? products.find((p: any) => String(p.id) === String(productId))
                : null;

              if (product) {
                const currentStok = Number(product.stok) || 0;
                const newStok = currentStok + qty; // Kembalikan stok

                // Update stok produk
                const updateProductConfig: RequestConfig = {
                  url: `${PRODUCT_BASE_URL}?id=${encodeURIComponent(
                    product.id
                  )}`,
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    nama_produk: product.nama_produk,
                    kategori: product.kategori,
                    harga: Number(product.harga),
                    stok: newStok,
                  deskripsi: product.deskripsi,
                  gambar: product.gambar || null,
                }),
                };

                await makeRequest(updateProductConfig);
              }
            }
          }
        } catch (error) {
          console.error('Error restoring product stock:', error);
          // Tetap lanjutkan, error tidak akan menghentikan proses
        }

        setIsDeleteDialogOpen(false);
        setDeleteTransaksiId('');
        loadTransaksis();
        toast.success('Transaksi berhasil dihapus');
      } else {
        toast.error('Gagal menghapus transaksi');
      }
    } catch (error) {
      console.error('Error deleting transaksi:', error);
      toast.error('Error', {
        description: 'Terjadi kesalahan saat menghapus transaksi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingTransaksi(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (transaksi: Transaksi) => {
    setEditingTransaksi(transaksi);
    setFormData({
      product_id: String(transaksi.product_id || ''),
      qty: String(transaksi.qty || ''),
      total_harga: '',
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeleteTransaksiId(id);
    setIsDeleteDialogOpen(true);
  };

  const openDetailDialog = async (transaksi: Transaksi) => {
    setDetailTransaksi(transaksi);
    setIsDetailDialogOpen(true);

    // Load product name if not already loaded
    if (transaksi.product_id && !productNames[String(transaksi.product_id)]) {
      await loadProductName(transaksi.product_id);
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      qty: '',
      total_harga: '',
    });
    setErrors({});
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
              Tabel CRUD Transaksi
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
              Kelola data transaksi dengan operasi Create, Read, Update, Delete
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadTransaksis}
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
              Tambah Transaksi
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 sm:pt-0">
        {isLoading && transaksis.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p className="text-sm text-gray-500">Memuat data transaksi...</p>
          </div>
        ) : transaksis.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>
              Tidak ada data transaksi. Klik "Tambah Transaksi" untuk
              menambahkan data.
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
                      Product ID
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase">
                      Total Harga
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase min-w-[200px]">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransaksis.map((transaksi) => (
                    <tr
                      key={transaksi.id}
                      className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {transaksi.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {transaksi.product_id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {transaksi.qty}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-center">
                        {typeof transaksi.total_harga === 'number'
                          ? `Rp ${transaksi.total_harga.toLocaleString(
                              'id-ID'
                            )}`
                          : `Rp ${Number(transaksi.total_harga).toLocaleString(
                              'id-ID'
                            )}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <Button
                            onClick={() => openDetailDialog(transaksi)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900 cursor-pointer transition-colors whitespace-nowrap">
                            <Eye className="h-3 w-3 mr-1" />
                            Detail
                          </Button>
                          <Button
                            onClick={() => openEditDialog(transaksi)}
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-blue-300 text-blue-700 hover:bg-blue-100 hover:border-blue-400 hover:text-blue-800 cursor-pointer transition-colors whitespace-nowrap">
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() =>
                              openDeleteDialog(String(transaksi.id))
                            }
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 border-red-300 text-red-700 hover:bg-red-100 hover:border-red-400 hover:text-red-800 cursor-pointer transition-colors whitespace-nowrap">
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
        <TransaksiFormModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          errors={errors}
          isLoading={isLoading}
          editingTransaksi={editingTransaksi}
          products={products}
          onFormDataChange={(field, value) => {
            setFormData({ ...formData, [field]: value });
            if (errors[field]) {
              setErrors({ ...errors, [field]: '' });
            }
          }}
          onSubmit={editingTransaksi ? handleUpdate : handleCreate}
          onCancel={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
        />

        {/* Detail Dialog */}
        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Detail Transaksi
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Informasi lengkap transaksi
              </DialogDescription>
            </DialogHeader>
            {detailTransaksi && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        ID Transaksi
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {detailTransaksi.id}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Product ID
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {detailTransaksi.product_id}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Nama Produk
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {productNames[String(detailTransaksi.product_id)] ||
                        detailTransaksi.nama_produk ||
                        'Memuat...'}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Quantity (Qty)
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {detailTransaksi.qty} item
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Tanggal
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {detailTransaksi.tanggal
                        ? new Date(detailTransaksi.tanggal).toLocaleString(
                            'id-ID',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }
                          )
                        : new Date().toLocaleString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-blue-700">
                        Total Harga
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {typeof detailTransaksi.total_harga === 'number'
                        ? `Rp ${detailTransaksi.total_harga.toLocaleString(
                            'id-ID'
                          )}`
                        : `Rp ${Number(
                            detailTransaksi.total_harga
                          ).toLocaleString('id-ID')}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsDetailDialogOpen(false)}
                className="border-gray-300 bg-white hover:bg-gray-50">
                Tutup
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
              <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini
                tidak dapat dibatalkan.
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
