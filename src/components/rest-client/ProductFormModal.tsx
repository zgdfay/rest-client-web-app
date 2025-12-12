import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const KATEGORI_OPTIONS = [
  'Mobile Legends: Bang Bang',
  'Free Fire',
  'PUBG Mobile',
  'Genshin Impact',
  'Roblox',
  'Stumble Guys',
  'Honkai: Star Rail',
  'Call of Duty Mobile',
  'Free Fire MAX',
  'Higgs Domino Island',
];

interface ProductFormData {
  nama_produk: string;
  kategori: string;
  harga: string;
  stok: string;
  deskripsi: string;
  gambar?: File | null;
}

interface ProductFormErrors {
  nama_produk?: string;
  kategori?: string;
  harga?: string;
  stok?: string;
  deskripsi?: string;
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

interface ProductFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: ProductFormData;
  errors: ProductFormErrors;
  isLoading: boolean;
  editingProduct: Product | null;
  onFormDataChange: (field: keyof ProductFormData, value: string | File | null) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ProductFormModal({
  open,
  onOpenChange,
  formData,
  errors,
  isLoading,
  editingProduct,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ProductFormModalProps) {
  // Validasi real-time untuk disable tombol submit
  const isFormValid = (): boolean => {
    const namaProduk = formData.nama_produk.trim();
    const kategori = formData.kategori.trim();
    const harga = formData.harga.trim();
    const stok = formData.stok.trim();
    const deskripsi = formData.deskripsi.trim();

    // Validasi nama produk: harus diisi dan bukan hanya angka
    const isNamaProdukValid =
      namaProduk !== '' &&
      (isNaN(Number(namaProduk)) || namaProduk === '' || Number(namaProduk).toString() !== namaProduk);

    // Validasi kategori: harus diisi dan ada di daftar
    const isKategoriValid =
      kategori !== '' && KATEGORI_OPTIONS.includes(kategori);

    // Validasi harga: harus diisi, angka, dan >= 0
    const isHargaValid =
      harga !== '' &&
      !isNaN(Number(harga)) &&
      Number(harga) >= 0;

    // Validasi stok: harus diisi, angka, dan >= 0
    const isStokValid =
      stok !== '' &&
      !isNaN(Number(stok)) &&
      Number(stok) >= 0;

    // Validasi deskripsi: harus diisi
    const isDeskripsiValid = deskripsi !== '';

    return (
      isNamaProdukValid &&
      isKategoriValid &&
      isHargaValid &&
      isStokValid &&
      isDeskripsiValid
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              onChange={(e) => onFormDataChange('nama_produk', e.target.value)}
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
              onValueChange={(value) => onFormDataChange('kategori', value)}>
              <SelectTrigger
                id="kategori"
                className={`w-full${errors.kategori ? ' border-red-500' : ''}`}>
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
              onChange={(e) => onFormDataChange('harga', e.target.value)}
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
              onChange={(e) => onFormDataChange('stok', e.target.value)}
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
              onChange={(e) => onFormDataChange('deskripsi', e.target.value)}
              className={errors.deskripsi ? 'border-red-500' : ''}
              rows={4}
            />
            {errors.deskripsi && (
              <p className="text-xs text-red-600">{errors.deskripsi}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gambar">Gambar</Label>
            <Input
              id="gambar"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                onFormDataChange('gambar', file);
              }}
              className="cursor-pointer"
            />
            {formData.gambar && (
              <p className="text-xs text-gray-500">
                File dipilih: {formData.gambar.name}
              </p>
            )}
            {editingProduct && !formData.gambar && editingProduct.gambar && (
              <p className="text-xs text-gray-500">
                Gambar saat ini tersedia
              </p>
            )}
            {errors.gambar && (
              <p className="text-xs text-red-600">{errors.gambar}</p>
            )}
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
            ) : editingProduct ? (
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
