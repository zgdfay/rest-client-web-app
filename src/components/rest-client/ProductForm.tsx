import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Send, RefreshCw } from 'lucide-react';
import type { HttpMethod, RequestConfig, ApiResponse } from '@/types';

interface ProductFormProps {
  onSubmit: (config: RequestConfig) => void;
  isLoading?: boolean;
  response?: ApiResponse | null;
}

interface ProductData {
  id: string;
  nama_produk: string;
  kategori: string;
  harga: string;
  stok: string;
  deskripsi: string;
}

const BASE_URL = import.meta.env.VITE_API_PRODUK_URL || 'http://localhost/dbrest/api/produk.php';

export function ProductForm({ onSubmit, isLoading, response }: ProductFormProps) {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [productData, setProductData] = useState<ProductData>({
    id: '',
    nama_produk: '',
    kategori: '',
    harga: '',
    stok: '',
    deskripsi: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const lastResponseRef = useRef<ApiResponse | null>(null);
  const lastResponseTimestampRef = useRef<number>(0);
  const lastRequestIdRef = useRef<string>('');
  const isLoadDataRequestRef = useRef<boolean>(false);

  // Reset form ketika method berubah
  useEffect(() => {
    if (method === 'GET' || method === 'DELETE') {
      setProductData((prev) => ({
        ...prev,
        nama_produk: '',
        kategori: '',
        harga: '',
        stok: '',
        deskripsi: '',
      }));
      setErrors({});
      setIsDataLoaded(false);
    } else if (method === 'POST') {
      // Reset semua termasuk ID untuk POST
      setProductData({
        id: '',
        nama_produk: '',
        kategori: '',
        harga: '',
        stok: '',
        deskripsi: '',
      });
      setIsDataLoaded(false);
    } else if (method === 'PUT' || method === 'PATCH') {
      // Untuk PUT/PATCH, reset form fields kecuali ID
      setProductData((prev) => ({
        ...prev,
        nama_produk: '',
        kategori: '',
        harga: '',
        stok: '',
        deskripsi: '',
      }));
      setIsDataLoaded(false);
    }
  }, [method]);

  // Auto-fill form dari response ketika GET berhasil atau Load Data
  useEffect(() => {
    // PRIORITAS TINGGI: Untuk Load Data request, selalu proses response terlebih dahulu
    // Jangan cek isNewResponse untuk Load Data karena kita ingin memastikan auto-fill terjadi
    if (isLoadDataRequestRef.current && response) {
      lastResponseRef.current = response;
      lastResponseTimestampRef.current = response.time || Date.now();
      isLoadDataRequestRef.current = false;
      setIsLoadingData(false);

      // Coba extract data dari response - handle berbagai struktur
      let responseData = response.data;
      
      // Handle berbagai struktur response yang mungkin
      if (responseData && typeof responseData === 'object') {
        // Struktur: {data: {...}} atau {result: {...}} atau {produk: {...}}
        if (responseData.data && typeof responseData.data === 'object') {
          responseData = responseData.data;
        } else if (responseData.result && typeof responseData.result === 'object') {
          responseData = responseData.result;
        } else if (responseData.produk && typeof responseData.produk === 'object') {
          responseData = responseData.produk;
        }
      }

      // Jika response adalah array, cari item dengan ID yang sesuai
      if (Array.isArray(responseData)) {
        if (responseData.length === 0) {
          setIsLoadingData(false);
          return;
        }
        const searchId = lastRequestIdRef.current.trim() || productData.id.trim();
        if (searchId) {
          const found = responseData.find((item: any) => 
            String(item.id) === searchId || 
            String(item.id_produk) === searchId ||
            String(item.ID) === searchId ||
            String(item.Id) === searchId
          );
          if (found) {
            responseData = found;
          } else if (responseData.length === 1) {
            // Jika hanya 1 item, gunakan item tersebut
            responseData = responseData[0];
          } else {
            setIsLoadingData(false);
            return;
          }
        } else if (responseData.length === 1) {
          // Jika hanya 1 item dan tidak ada ID, gunakan item tersebut
          responseData = responseData[0];
        } else {
          setIsLoadingData(false);
          return;
        }
      }

      // Auto-fill form jika data valid (object)
      if (responseData && typeof responseData === 'object' && responseData !== null && !Array.isArray(responseData)) {
        // Extract semua field yang mungkin dengan berbagai variasi nama
        const extractedData = {
          id: responseData.id || responseData.id_produk || responseData.ID || responseData.Id || '',
          nama_produk: responseData.nama_produk || responseData.nama || responseData.namaProduk || '',
          kategori: responseData.kategori || responseData.category || '',
          harga: responseData.harga || responseData.price || '',
          stok: responseData.stok || responseData.stock || responseData.quantity || '',
          deskripsi: responseData.deskripsi || responseData.description || responseData.desc || '',
        };

        // Pastikan setidaknya ada beberapa data yang valid
        if (extractedData.nama_produk || extractedData.kategori || extractedData.harga) {
          setProductData((prev) => ({
            id: prev.id || String(extractedData.id),
            nama_produk: String(extractedData.nama_produk || ''),
            kategori: String(extractedData.kategori || ''),
            harga: String(extractedData.harga || ''),
            stok: String(extractedData.stok || ''),
            deskripsi: String(extractedData.deskripsi || ''),
          }));
          setIsDataLoaded(true);
        }
      }
      setIsLoadingData(false);
      return;
    }

    // Cek apakah response baru (belum pernah diproses) untuk request biasa
    const isNewResponse = response && (
      response !== lastResponseRef.current || 
      response.time !== lastResponseTimestampRef.current
    );

    if (!isNewResponse) {
      return; // Response sudah diproses sebelumnya
    }

    // Auto-fill untuk response dengan status 200
    if (
      response && 
      response.status === 200 && 
      response.data
    ) {
      // Auto-fill untuk:
      // 1. GET method (selalu auto-fill jika ada ID atau response single item)
      // 2. PUT/PATCH dengan ID yang sudah diisi (untuk auto-fill setelah GET)
      
      const shouldAutoFill = 
        method === 'GET' || 
        ((method === 'PUT' || method === 'PATCH') && productData.id.trim());
      
      if (shouldAutoFill) {
        lastResponseRef.current = response;
        lastResponseTimestampRef.current = response.time || Date.now();
        setIsLoadingData(false);
        
        // Coba extract data dari response
        let responseData = response.data;
        
        // Handle berbagai struktur response
        if (responseData && typeof responseData === 'object') {
          // Jika response memiliki struktur seperti {data: {...}} atau {result: {...}}
          if (responseData.data && typeof responseData.data === 'object') {
            responseData = responseData.data;
          } else if (responseData.result && typeof responseData.result === 'object') {
            responseData = responseData.result;
          }
        }
        
        // Jika response adalah array, ambil item pertama (jika ada ID yang diisi)
        // Jika response adalah object, langsung isi
        let dataToFill = responseData;
        
        if (Array.isArray(responseData)) {
          if (responseData.length === 0) {
            return; // Tidak ada data
          }
          
          // Jika ada ID yang diisi sebelumnya, cari data dengan ID tersebut
          const searchId = lastRequestIdRef.current.trim() || productData.id.trim();
          if (searchId) {
            const found = responseData.find((item: any) => 
              String(item.id) === searchId || 
              String(item.id_produk) === searchId ||
              String(item.ID) === searchId ||
              String(item.Id) === searchId
            );
            if (found) {
              dataToFill = found;
            } else if (responseData.length === 1) {
              // Jika hanya 1 item, gunakan item tersebut
              dataToFill = responseData[0];
            } else {
              // Jika tidak ditemukan, jangan auto-fill
              return;
            }
          } else {
            // Jika tidak ada ID dan array lebih dari 1 item, jangan auto-fill
            if (responseData.length > 1) {
              return;
            }
            // Jika hanya 1 item, gunakan item tersebut
            dataToFill = responseData[0];
          }
        }

        // Auto-fill form dengan data dari response
        if (typeof dataToFill === 'object' && dataToFill !== null) {
          setProductData((prev) => ({
            id: prev.id || String(dataToFill.id || dataToFill.id_produk || dataToFill.ID || dataToFill.Id || ''),
            nama_produk: String(dataToFill.nama_produk || dataToFill.nama || ''),
            kategori: String(dataToFill.kategori || ''),
            harga: String(dataToFill.harga || ''),
            stok: String(dataToFill.stok || ''),
            deskripsi: String(dataToFill.deskripsi || ''),
          }));
          // Set flag bahwa data sudah di-load untuk PUT/PATCH
          if (method === 'PUT' || method === 'PATCH') {
            setIsDataLoaded(true);
          }
        }
      }
    } else if (
      response && 
      response.status !== 200 &&
      isLoadDataRequestRef.current
    ) {
      // Reset loading flag jika error saat Load Data
      setIsLoadingData(false);
      isLoadDataRequestRef.current = false;
      lastResponseRef.current = response;
      lastResponseTimestampRef.current = response.time || Date.now();
    }
  }, [response, method, productData.id]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validasi untuk DELETE perlu ID
    if (method === 'DELETE') {
      if (!productData.id.trim()) {
        newErrors.id = 'ID produk harus diisi';
      }
      return Object.keys(newErrors).length === 0;
    }

    // GET tidak perlu validasi (bisa kosong untuk GET all)
    if (method === 'GET') {
      return true;
    }

    // Validasi untuk POST, PUT, PATCH
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      if (method === 'PUT' || method === 'PATCH') {
        if (!productData.id.trim()) {
          newErrors.id = 'ID produk harus diisi untuk update';
        }
      }

      // Validasi Nama Produk - harus string, tidak boleh angka
      if (!productData.nama_produk.trim()) {
        newErrors.nama_produk = 'Nama produk harus diisi';
      } else {
        // Cek apakah input adalah angka murni
        const trimmedNama = productData.nama_produk.trim();
        if (!isNaN(Number(trimmedNama)) && trimmedNama !== '') {
          newErrors.nama_produk = 'Nama produk harus berupa teks, tidak boleh angka';
        } else if (/^\d+$/.test(trimmedNama)) {
          newErrors.nama_produk = 'Nama produk harus berupa teks, tidak boleh hanya angka';
        }
      }

      // Validasi Kategori - harus string, tidak boleh angka
      if (!productData.kategori.trim()) {
        newErrors.kategori = 'Kategori harus diisi';
      } else {
        const trimmedKategori = productData.kategori.trim();
        if (!isNaN(Number(trimmedKategori)) && trimmedKategori !== '') {
          newErrors.kategori = 'Kategori harus berupa teks, tidak boleh angka';
        } else if (/^\d+$/.test(trimmedKategori)) {
          newErrors.kategori = 'Kategori harus berupa teks, tidak boleh hanya angka';
        }
      }

      // Validasi Harga - harus angka, tidak boleh teks
      if (!productData.harga.trim()) {
        newErrors.harga = 'Harga harus diisi';
      } else {
        const hargaValue = productData.harga.trim();
        if (isNaN(Number(hargaValue))) {
          newErrors.harga = 'Harga harus berupa angka, tidak boleh teks';
        } else if (Number(hargaValue) < 0) {
          newErrors.harga = 'Harga harus berupa angka positif';
        } else if (!/^\d+(\.\d+)?$/.test(hargaValue)) {
          newErrors.harga = 'Format harga tidak valid';
        }
      }

      // Validasi Stok - harus angka, tidak boleh teks
      if (!productData.stok.trim()) {
        newErrors.stok = 'Stok harus diisi';
      } else {
        const stokValue = productData.stok.trim();
        if (isNaN(Number(stokValue))) {
          newErrors.stok = 'Stok harus berupa angka, tidak boleh teks';
        } else if (Number(stokValue) < 0) {
          newErrors.stok = 'Stok harus berupa angka positif';
        } else if (!/^\d+$/.test(stokValue)) {
          newErrors.stok = 'Stok harus berupa bilangan bulat';
        }
      }

      // Validasi Deskripsi - harus string, tidak boleh angka
      if (!productData.deskripsi.trim()) {
        newErrors.deskripsi = 'Deskripsi harus diisi';
      } else {
        const trimmedDeskripsi = productData.deskripsi.trim();
        if (!isNaN(Number(trimmedDeskripsi)) && trimmedDeskripsi !== '') {
          newErrors.deskripsi = 'Deskripsi harus berupa teks, tidak boleh angka';
        } else if (/^\d+$/.test(trimmedDeskripsi)) {
          newErrors.deskripsi = 'Deskripsi harus berupa teks, tidak boleh hanya angka';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Untuk PUT/PATCH, pastikan data sudah di-load terlebih dahulu
    if ((method === 'PUT' || method === 'PATCH') && !isDataLoaded && productData.id.trim()) {
      setErrors((prev) => ({ 
        ...prev, 
        id: 'Silakan klik "Load Data" terlebih dahulu untuk memuat data produk' 
      }));
      return;
    }

    if (!validate()) {
      return;
    }

    // Verifikasi duplikasi nama produk untuk POST dan PUT/PATCH
    if ((method === 'POST' || method === 'PUT' || method === 'PATCH') && productData.nama_produk.trim()) {
      try {
        // Cek apakah ada produk dengan nama yang sama
        const checkUrl = `${BASE_URL}`;
        const checkResponse = await fetch(checkUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          let products = checkData;
          
          // Handle berbagai struktur response
          if (Array.isArray(checkData)) {
            products = checkData;
          } else if (checkData.data && Array.isArray(checkData.data)) {
            products = checkData.data;
          } else if (checkData.result && Array.isArray(checkData.result)) {
            products = checkData.result;
          }

          // Cek duplikasi nama produk
          if (Array.isArray(products)) {
            const duplicate = products.find((item: any) => {
              const itemNama = String(item.nama_produk || item.nama || '').toLowerCase().trim();
              const inputNama = productData.nama_produk.toLowerCase().trim();
              const itemId = String(item.id || item.id_produk || '');
              const currentId = productData.id.trim();
              
              // Untuk PUT/PATCH, skip cek jika ID sama (update produk yang sama)
              if (method === 'PUT' || method === 'PATCH') {
                if (itemId === currentId) {
                  return false; // Skip produk yang sedang di-update
                }
              }
              
              return itemNama === inputNama;
            });

            if (duplicate) {
              setErrors((prev) => ({
                ...prev,
                nama_produk: 'Nama produk sudah ada, gunakan nama yang berbeda',
              }));
              return;
            }
          }
        }
      } catch (error) {
        // Jika error saat cek duplikasi, lanjutkan submit (mungkin API tidak support)
        console.warn('Tidak dapat memverifikasi duplikasi:', error);
      }
    }

    let url = BASE_URL;
    let body: string | undefined;

    // Simpan ID yang digunakan untuk request (untuk auto-fill)
    if (method === 'GET' && productData.id.trim()) {
      lastRequestIdRef.current = productData.id.trim();
    }
    
    // Reset loading data flag
    setIsLoadingData(false);

    // Generate URL dan body berdasarkan method
    switch (method) {
      case 'GET':
        // GET dengan ID: http://localhost/dbrest/api/produk.php?id=1
        // GET semua: http://localhost/dbrest/api/produk.php
        if (productData.id.trim()) {
          url = `${BASE_URL}?id=${encodeURIComponent(productData.id.trim())}`;
        }
        break;

      case 'POST':
        // POST: http://localhost/dbrest/api/produk.php
        body = JSON.stringify({
          nama_produk: productData.nama_produk.trim(),
          kategori: productData.kategori.trim(),
          harga: Number(productData.harga.trim()),
          stok: Number(productData.stok.trim()),
          deskripsi: productData.deskripsi.trim(),
        });
        break;

      case 'PUT':
      case 'PATCH':
        // PUT/PATCH: http://localhost/dbrest/api/produk.php?id=1
        url = `${BASE_URL}?id=${encodeURIComponent(productData.id.trim())}`;
        body = JSON.stringify({
          nama_produk: productData.nama_produk.trim(),
          kategori: productData.kategori.trim(),
          harga: Number(productData.harga.trim()),
          stok: Number(productData.stok.trim()),
          deskripsi: productData.deskripsi.trim(),
        });
        break;

      case 'DELETE':
        // DELETE: http://localhost/dbrest/api/produk.php?id=1
        url = `${BASE_URL}?id=${encodeURIComponent(productData.id.trim())}`;
        break;
    }

    onSubmit({
      url,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
  };

  const handleInputChange = (field: keyof ProductData, value: string) => {
    setProductData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error untuk field yang sedang diubah
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    // Reset data loaded flag jika ID diubah untuk PUT/PATCH
    if ((field === 'id') && (method === 'PUT' || method === 'PATCH')) {
      setIsDataLoaded(false);
    }
  };

  const handleLoadData = () => {
    if (!productData.id.trim()) {
      setErrors((prev) => ({ ...prev, id: 'ID produk harus diisi untuk load data' }));
      return;
    }

    // Reset response tracking agar response berikutnya dianggap baru
    lastResponseRef.current = null;
    lastResponseTimestampRef.current = 0;
    // Set flag bahwa ini adalah Load Data request - HARUS SET SEBELUM onSubmit
    isLoadDataRequestRef.current = true;
    // Simpan ID untuk auto-fill
    lastRequestIdRef.current = productData.id.trim();
    setIsLoadingData(true);
    setIsDataLoaded(false); // Reset flag data loaded
    // Load data dengan GET request
    const loadUrl = `${BASE_URL}?id=${encodeURIComponent(productData.id.trim())}`;
    onSubmit({
      url: loadUrl,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const handleIdKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto load ketika Enter ditekan di field ID untuk PUT/PATCH
    if (e.key === 'Enter' && (method === 'PUT' || method === 'PATCH') && productData.id.trim()) {
      e.preventDefault();
      handleLoadData();
    }
  };

  const handleReset = () => {
    setProductData({
      id: '',
      nama_produk: '',
      kategori: '',
      harga: '',
      stok: '',
      deskripsi: '',
    });
    setErrors({});
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col w-full">
      <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4 flex-shrink-0">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Form CRUD Produk
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola data produk dengan operasi CRUD (Create, Read, Update, Delete)
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 sm:pt-6 flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 flex-1 flex flex-col">
          {/* HTTP Method Dropdown */}
          <div className="space-y-2">
            <Label htmlFor="method" className="text-sm font-medium">
              HTTP Method
            </Label>
            <Select
              value={method}
              onValueChange={(value) => setMethod(value as HttpMethod)}>
              <SelectTrigger
                id="method"
                className="h-10 w-full bg-white border-gray-300 text-gray-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[100] bg-white border-gray-200">
                <SelectItem value="GET">GET - Read (Baca Data)</SelectItem>
                <SelectItem value="POST">POST - Create (Tambah Data)</SelectItem>
                <SelectItem value="PUT">PUT - Update (Ubah Data Lengkap)</SelectItem>
                <SelectItem value="PATCH">PATCH - Update (Ubah Data Sebagian)</SelectItem>
                <SelectItem value="DELETE">DELETE - Delete (Hapus Data)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* ID Field - Required for PUT, PATCH, DELETE, Optional for GET */}
          {(method === 'GET' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') && (
            <div className="space-y-2">
              <Label htmlFor="id" className="text-sm font-medium">
                ID Produk {method === 'DELETE' || method === 'PUT' || method === 'PATCH' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400">(Opsional - kosongkan untuk GET semua)</span>
                )}
              </Label>
              {(method === 'PUT' || method === 'PATCH') && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                  <p className="text-xs text-blue-800 font-medium">
                    💡 Untuk Update: Isi ID produk, lalu klik "Load Data" untuk mengambil data yang akan diupdate
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="id"
                  type="text"
                  placeholder={method === 'GET' ? "Masukkan ID produk (kosongkan untuk GET semua)" : "Masukkan ID produk"}
                  value={productData.id}
                  onChange={(e) => handleInputChange('id', e.target.value)}
                  onKeyDown={handleIdKeyDown}
                  className={`h-10 bg-white border-gray-300 text-gray-900 flex-1 ${
                    errors.id
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {(method === 'PUT' || method === 'PATCH') && (
                  <Button
                    type="button"
                    onClick={handleLoadData}
                    className="h-10 bg-blue-600 text-white hover:bg-blue-700 whitespace-nowrap px-4 font-medium"
                    disabled={isLoading || isLoadingData || !productData.id.trim()}>
                    {isLoadingData ? 'Loading...' : 'Load Data'}
                  </Button>
                )}
              </div>
              {errors.id && (
                <p className="text-xs text-red-600 mt-1.5">{errors.id}</p>
              )}
              {(method === 'PUT' || method === 'PATCH') && isDataLoaded && (
                <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-800 font-medium">
                    ✓ Data berhasil dimuat! Silakan edit data di bawah ini.
                  </p>
                </div>
              )}
              {(method === 'PUT' || method === 'PATCH') && !isDataLoaded && productData.id.trim() && (
                <p className="text-xs text-gray-500 mt-1">
                  Tekan Enter di field ID atau klik "Load Data" untuk memuat data produk
                </p>
              )}
            </div>
          )}

          {/* Form Fields untuk POST, PUT, PATCH */}
          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <>
              {/* Nama Produk */}
              <div className="space-y-2">
                <Label htmlFor="nama_produk" className="text-sm font-medium">
                  Nama Produk <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nama_produk"
                  type="text"
                  placeholder="Masukkan nama produk"
                  value={productData.nama_produk}
                  onChange={(e) => handleInputChange('nama_produk', e.target.value)}
                  className={`h-10 bg-white border-gray-300 text-gray-900 ${
                    errors.nama_produk
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.nama_produk && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.nama_produk}</p>
                )}
              </div>

              {/* Kategori */}
              <div className="space-y-2">
                <Label htmlFor="kategori" className="text-sm font-medium">
                  Kategori <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="kategori"
                  type="text"
                  placeholder="Masukkan kategori produk"
                  value={productData.kategori}
                  onChange={(e) => handleInputChange('kategori', e.target.value)}
                  className={`h-10 bg-white border-gray-300 text-gray-900 ${
                    errors.kategori
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.kategori && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.kategori}</p>
                )}
              </div>

              {/* Harga */}
              <div className="space-y-2">
                <Label htmlFor="harga" className="text-sm font-medium">
                  Harga <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="harga"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Masukkan harga produk"
                  value={productData.harga}
                  onChange={(e) => handleInputChange('harga', e.target.value)}
                  className={`h-10 bg-white border-gray-300 text-gray-900 ${
                    errors.harga
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.harga && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.harga}</p>
                )}
              </div>

              {/* Stok */}
              <div className="space-y-2">
                <Label htmlFor="stok" className="text-sm font-medium">
                  Stok <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stok"
                  type="number"
                  min="0"
                  placeholder="Masukkan stok produk"
                  value={productData.stok}
                  onChange={(e) => handleInputChange('stok', e.target.value)}
                  className={`h-10 bg-white border-gray-300 text-gray-900 ${
                    errors.stok
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.stok && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.stok}</p>
                )}
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <Label htmlFor="deskripsi" className="text-sm font-medium">
                  Deskripsi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="deskripsi"
                  placeholder="Masukkan deskripsi produk"
                  value={productData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  className={`font-mono text-sm min-h-[100px] resize-y bg-white border-gray-300 text-gray-900 ${
                    errors.deskripsi
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.deskripsi && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.deskripsi}</p>
                )}
              </div>
            </>
          )}

          {/* Info URL */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs font-medium text-blue-900 mb-1">API Endpoint:</p>
            <p className="text-xs text-blue-700 font-mono break-all">{BASE_URL}</p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 mt-auto flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              className="flex-1 h-11 border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
              disabled={isLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 bg-blue-600 text-white hover:bg-blue-700 shadow-md font-medium transition-colors"
              disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Mengirim...' : 'Kirim Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

