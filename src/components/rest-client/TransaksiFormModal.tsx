import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo } from 'react';

interface TransaksiFormData {
  product_id: string;
  qty: string;
  total_harga: string;
}

interface TransaksiFormErrors {
  product_id?: string;
  qty?: string;
}

interface Transaksi {
  id: string;
  product_id: string | number;
  qty: string | number;
  total_harga: string | number;
  tanggal?: string;
  nama_produk?: string;
}

interface Product {
  id: string;
  nama_produk: string;
  kategori: string;
  harga: number | string;
  stok: number | string;
  deskripsi: string;
  gambar?: Blob | string | null;
}

interface TransaksiFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: TransaksiFormData;
  errors: TransaksiFormErrors;
  isLoading: boolean;
  editingTransaksi: Transaksi | null;
  products: Product[];
  onFormDataChange: (field: keyof TransaksiFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function TransaksiFormModal({
  open,
  onOpenChange,
  formData,
  errors,
  isLoading,
  editingTransaksi,
  products,
  onFormDataChange,
  onSubmit,
  onCancel,
}: TransaksiFormModalProps) {
  // Get selected product
  const selectedProduct = products.find(
    (p) => String(p.id) === String(formData.product_id)
  );

  // Calculate total harga
  const totalHarga = useMemo(() => {
    if (selectedProduct && formData.qty) {
      const harga = Number(selectedProduct.harga) || 0;
      const qty = Number(formData.qty) || 0;
      return harga * qty;
    }
    return 0;
  }, [selectedProduct, formData.qty]);

  // Auto-update total_harga when product_id or qty changes
  useEffect(() => {
    if (!open) return; // Don't update when modal is closed

    const newTotalHarga =
      formData.product_id && formData.qty ? String(totalHarga) : '0';

    // Only update if value changed to avoid infinite loop
    if (formData.total_harga !== newTotalHarga) {
      onFormDataChange('total_harga', newTotalHarga);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalHarga, open, formData.product_id, formData.qty]);

  // Validasi real-time untuk disable tombol submit
  const isFormValid = (): boolean => {
    const productId = formData.product_id.trim();
    const qty = formData.qty.trim();

    // Validasi product_id: harus dipilih dan valid
    const isProductIdValid =
      productId !== '' &&
      !isNaN(Number(productId)) &&
      Number(productId) >= 0 &&
      products.length > 0 &&
      products.some((p) => String(p.id) === productId);

    // Validasi qty: harus diisi, angka, dan > 0 (quantity harus lebih dari 0)
    const isQtyValid =
      qty !== '' &&
      !isNaN(Number(qty)) &&
      Number(qty) > 0;

    return isProductIdValid && isQtyValid;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-white">
        <DialogHeader>
          <DialogTitle>
            {editingTransaksi ? 'Edit Transaksi' : 'Tambah Transaksi Baru'}
          </DialogTitle>
          <DialogDescription>
            {editingTransaksi
              ? 'Ubah informasi transaksi di bawah ini'
              : 'Isi form di bawah ini untuk menambahkan transaksi baru'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product_id">
              Produk <span className="text-red-500">*</span>
            </Label>
            {products.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  Memuat daftar produk...
                </p>
              </div>
            ) : (
              <Select
                value={formData.product_id}
                onValueChange={(value) =>
                  onFormDataChange('product_id', value)
                }>
                <SelectTrigger
                  id="product_id"
                  className={`w-full${
                    errors.product_id ? ' border-red-500' : ''
                  }`}>
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={String(product.id)}>
                      {product.nama_produk} - Rp{' '}
                      {typeof product.harga === 'number'
                        ? product.harga.toLocaleString('id-ID')
                        : Number(product.harga).toLocaleString('id-ID')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {errors.product_id && (
              <p className="text-xs text-red-600">{errors.product_id}</p>
            )}
            {selectedProduct && (
              <p className="text-xs text-gray-500">
                Harga: Rp{' '}
                {typeof selectedProduct.harga === 'number'
                  ? selectedProduct.harga.toLocaleString('id-ID')
                  : Number(selectedProduct.harga).toLocaleString('id-ID')}
                {' | '}
                Stok: {selectedProduct.stok}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="qty">
              Quantity <span className="text-red-500">*</span>
            </Label>
            <Input
              id="qty"
              type="number"
              min="0"
              value={formData.qty}
              onChange={(e) => onFormDataChange('qty', e.target.value)}
              className={errors.qty ? 'border-red-500' : ''}
            />
            {errors.qty && <p className="text-xs text-red-600">{errors.qty}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_harga">
              Total Harga <span className="text-red-500">*</span>
            </Label>
            <Input
              id="total_harga"
              type="text"
              value={`Rp ${totalHarga.toLocaleString('id-ID')}`}
              disabled
              className="bg-gray-100 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500">
              Total harga dihitung otomatis (Harga × Quantity)
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            Batal
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading || !isFormValid()}
            className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : editingTransaksi ? (
              'Update'
            ) : (
              'Simpan'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
