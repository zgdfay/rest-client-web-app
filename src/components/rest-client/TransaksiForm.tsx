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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Send, RefreshCw } from 'lucide-react';
import type { HttpMethod, RequestConfig, ApiResponse } from '@/types';

interface TransaksiFormProps {
  onSubmit: (config: RequestConfig) => void;
  isLoading?: boolean;
  response?: ApiResponse | null;
}

interface TransaksiData {
  id: string;
  product_id: string;
  qty: string;
  total_harga: string;
}

const BASE_URL = import.meta.env.VITE_API_TRANSAKSI_URL || 'http://localhost/dbrest/api/transaksi.php';

export function TransaksiForm({ onSubmit, isLoading, response }: TransaksiFormProps) {
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [transaksiData, setTransaksiData] = useState<TransaksiData>({
    id: '',
    product_id: '',
    qty: '',
    total_harga: '',
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
      setTransaksiData((prev) => ({
        ...prev,
        product_id: '',
        qty: '',
        total_harga: '',
      }));
      setErrors({});
      setIsDataLoaded(false);
    } else if (method === 'POST') {
      // Reset semua termasuk ID untuk POST
      setTransaksiData({
        id: '',
        product_id: '',
        qty: '',
        total_harga: '',
      });
      setIsDataLoaded(false);
    } else if (method === 'PUT' || method === 'PATCH') {
      // Untuk PUT/PATCH, reset form fields kecuali ID
      setTransaksiData((prev) => ({
        ...prev,
        product_id: '',
        qty: '',
        total_harga: '',
      }));
      setIsDataLoaded(false);
    }
  }, [method]);

  // Auto-fill form dari response ketika GET berhasil atau Load Data
  useEffect(() => {
    // PRIORITAS TINGGI: Untuk Load Data request, selalu proses response terlebih dahulu
    if (isLoadDataRequestRef.current && response) {
      lastResponseRef.current = response;
      lastResponseTimestampRef.current = response.time || Date.now();
      isLoadDataRequestRef.current = false;
      setIsLoadingData(false);

      // Coba extract data dari response - handle berbagai struktur
      let responseData = response.data;
      
      // Handle berbagai struktur response yang mungkin
      if (responseData && typeof responseData === 'object') {
        // Struktur: {data: {...}} atau {result: {...}} atau {transaksi: {...}}
        if (responseData.data && typeof responseData.data === 'object') {
          responseData = responseData.data;
        } else if (responseData.result && typeof responseData.result === 'object') {
          responseData = responseData.result;
        } else if (responseData.transaksi && typeof responseData.transaksi === 'object') {
          responseData = responseData.transaksi;
        }
      }

      // Jika response adalah array, cari item dengan ID yang sesuai
      if (Array.isArray(responseData)) {
        if (responseData.length === 0) {
          setIsLoadingData(false);
          return;
        }
        const searchId = lastRequestIdRef.current.trim() || transaksiData.id.trim();
        if (searchId) {
          const found = responseData.find((item: any) => 
            String(item.id) === searchId || 
            String(item.id_transaksi) === searchId ||
            String(item.ID) === searchId ||
            String(item.Id) === searchId
          );
          if (found) {
            responseData = found;
          } else if (responseData.length === 1) {
            responseData = responseData[0];
          } else {
            setIsLoadingData(false);
            return;
          }
        } else if (responseData.length === 1) {
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
          id: responseData.id || responseData.id_transaksi || responseData.ID || responseData.Id || '',
          product_id: responseData.product_id || responseData.productId || responseData.id_produk || '',
          qty: responseData.qty || responseData.quantity || responseData.kuantitas || '',
          total_harga: responseData.total_harga || responseData.totalHarga || responseData.total || responseData.harga || '',
        };

        // Pastikan setidaknya ada beberapa data yang valid
        if (extractedData.product_id || extractedData.qty || extractedData.total_harga) {
          setTransaksiData((prev) => ({
            id: prev.id || String(extractedData.id),
          product_id: String(extractedData.product_id || ''),
          qty: String(extractedData.qty || ''),
          total_harga: String(extractedData.total_harga || ''),
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
        ((method === 'PUT' || method === 'PATCH') && transaksiData.id.trim());
      
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
          } else if (responseData.transaksi && typeof responseData.transaksi === 'object') {
            responseData = responseData.transaksi;
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
          const searchId = lastRequestIdRef.current.trim() || transaksiData.id.trim();
          if (searchId) {
            const found = responseData.find((item: any) => 
              String(item.id) === searchId || 
              String(item.id_transaksi) === searchId ||
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
          setTransaksiData((prev) => ({
            id: prev.id || String(dataToFill.id || dataToFill.id_transaksi || dataToFill.ID || dataToFill.Id || ''),
          product_id: String(dataToFill.product_id || dataToFill.productId || dataToFill.id_produk || ''),
          qty: String(dataToFill.qty || dataToFill.quantity || dataToFill.kuantitas || ''),
          total_harga: String(dataToFill.total_harga || dataToFill.totalHarga || dataToFill.total || dataToFill.harga || ''),
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
  }, [response, method, transaksiData.id]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validasi untuk DELETE perlu ID
    if (method === 'DELETE') {
      if (!transaksiData.id.trim()) {
        newErrors.id = 'ID transaksi harus diisi';
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
        if (!transaksiData.id.trim()) {
          newErrors.id = 'ID transaksi harus diisi untuk update';
        }
      }

      // Validasi Product ID - harus angka, tidak boleh teks
      if (!transaksiData.product_id.trim()) {
        newErrors.product_id = 'Product ID harus diisi';
      } else {
        const productIdValue = transaksiData.product_id.trim();
        if (isNaN(Number(productIdValue))) {
          newErrors.product_id = 'Product ID harus berupa angka, tidak boleh teks';
        } else if (Number(productIdValue) < 0) {
          newErrors.product_id = 'Product ID harus berupa angka positif';
        } else if (!/^\d+$/.test(productIdValue)) {
          newErrors.product_id = 'Product ID harus berupa bilangan bulat';
        }
      }

      // Validasi Quantity - harus angka, tidak boleh teks
      if (!transaksiData.qty.trim()) {
        newErrors.qty = 'Quantity harus diisi';
      } else {
        const qtyValue = transaksiData.qty.trim();
        if (isNaN(Number(qtyValue))) {
          newErrors.qty = 'Quantity harus berupa angka, tidak boleh teks';
        } else if (Number(qtyValue) < 0) {
          newErrors.qty = 'Quantity harus berupa angka positif';
        } else if (!/^\d+$/.test(qtyValue)) {
          newErrors.qty = 'Quantity harus berupa bilangan bulat';
        }
      }

      // Total harga hanya required untuk PUT/PATCH, untuk POST otomatis dihitung
      if (method === 'PUT' || method === 'PATCH') {
        if (!transaksiData.total_harga.trim()) {
          newErrors.total_harga = 'Total harga harus diisi';
        } else {
          const totalHargaValue = transaksiData.total_harga.trim();
          if (isNaN(Number(totalHargaValue))) {
            newErrors.total_harga = 'Total harga harus berupa angka, tidak boleh teks';
          } else if (Number(totalHargaValue) < 0) {
            newErrors.total_harga = 'Total harga harus berupa angka positif';
          } else if (!/^\d+(\.\d+)?$/.test(totalHargaValue)) {
            newErrors.total_harga = 'Format total harga tidak valid';
          }
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Untuk PUT/PATCH, pastikan data sudah di-load terlebih dahulu
    if ((method === 'PUT' || method === 'PATCH') && !isDataLoaded && transaksiData.id.trim()) {
      setErrors((prev) => ({ 
        ...prev, 
        id: 'Silakan klik "Load Data" terlebih dahulu untuk memuat data transaksi' 
      }));
      return;
    }

    if (!validate()) {
      return;
    }

    let url = BASE_URL;
    let body: string | undefined;

    // Simpan ID yang digunakan untuk request (untuk auto-fill)
    if (method === 'GET' && transaksiData.id.trim()) {
      lastRequestIdRef.current = transaksiData.id.trim();
    }
    
    // Reset loading data flag
    setIsLoadingData(false);

    // Generate URL dan body berdasarkan method
    switch (method) {
      case 'GET':
        // GET dengan ID: http://localhost/dbrest/api/transaksi.php?id=1
        // GET semua: http://localhost/dbrest/api/transaksi.php
        if (transaksiData.id.trim()) {
          url = `${BASE_URL}?id=${encodeURIComponent(transaksiData.id.trim())}`;
        }
        break;

      case 'POST':
        // POST: http://localhost/dbrest/api/transaksi.php
        // Hanya kirim product_id dan qty, total_harga akan otomatis dihitung di backend
        body = JSON.stringify({
          product_id: Number(transaksiData.product_id.trim()),
          qty: Number(transaksiData.qty.trim()),
        });
        break;

      case 'PUT':
      case 'PATCH':
        // PUT/PATCH: http://localhost/dbrest/api/transaksi.php?id=1
        url = `${BASE_URL}?id=${encodeURIComponent(transaksiData.id.trim())}`;
        body = JSON.stringify({
          product_id: Number(transaksiData.product_id.trim()),
          qty: Number(transaksiData.qty.trim()),
          total_harga: Number(transaksiData.total_harga.trim()),
        });
        break;

      case 'DELETE':
        // DELETE: http://localhost/dbrest/api/transaksi.php?id=1
        url = `${BASE_URL}?id=${encodeURIComponent(transaksiData.id.trim())}`;
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

  const handleInputChange = (field: keyof TransaksiData, value: string) => {
    setTransaksiData((prev) => ({
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
    if (!transaksiData.id.trim()) {
      setErrors((prev) => ({ ...prev, id: 'ID transaksi harus diisi untuk load data' }));
      return;
    }

    // Reset response tracking agar response berikutnya dianggap baru
    lastResponseRef.current = null;
    lastResponseTimestampRef.current = 0;
    // Set flag bahwa ini adalah Load Data request - HARUS SET SEBELUM onSubmit
    isLoadDataRequestRef.current = true;
    // Simpan ID untuk auto-fill
    lastRequestIdRef.current = transaksiData.id.trim();
    setIsLoadingData(true);
    setIsDataLoaded(false); // Reset flag data loaded
    // Load data dengan GET request
    const loadUrl = `${BASE_URL}?id=${encodeURIComponent(transaksiData.id.trim())}`;
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
    if (e.key === 'Enter' && (method === 'PUT' || method === 'PATCH') && transaksiData.id.trim()) {
      e.preventDefault();
      handleLoadData();
    }
  };

  const handleReset = () => {
    setTransaksiData({
      id: '',
      product_id: '',
      qty: '',
      total_harga: '',
    });
    setErrors({});
    setIsDataLoaded(false);
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col w-full">
      <CardHeader className="border-b border-gray-100 pb-3 sm:pb-4 flex-shrink-0">
        <CardTitle className="text-base sm:text-lg font-semibold text-gray-900">
          Form CRUD Transaksi
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm text-gray-500 mt-1">
          Kelola data transaksi dengan operasi CRUD (Create, Read, Update, Delete)
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
                ID Transaksi {method === 'DELETE' || method === 'PUT' || method === 'PATCH' ? (
                  <span className="text-red-500">*</span>
                ) : (
                  <span className="text-gray-400">(Opsional - kosongkan untuk GET semua)</span>
                )}
              </Label>
              {(method === 'PUT' || method === 'PATCH') && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md mb-2">
                  <p className="text-xs text-blue-800 font-medium">
                    💡 Untuk Update: Isi ID transaksi, lalu klik "Load Data" untuk mengambil data yang akan diupdate
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  id="id"
                  type="text"
                  placeholder={method === 'GET' ? "Masukkan ID transaksi (kosongkan untuk GET semua)" : "Masukkan ID transaksi"}
                  value={transaksiData.id}
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
                    disabled={isLoading || isLoadingData || !transaksiData.id.trim()}>
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
              {(method === 'PUT' || method === 'PATCH') && !isDataLoaded && transaksiData.id.trim() && (
                <p className="text-xs text-gray-500 mt-1">
                  Tekan Enter di field ID atau klik "Load Data" untuk memuat data transaksi
                </p>
              )}
            </div>
          )}

          {/* Form Fields untuk POST, PUT, PATCH */}
          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <>
              {/* Product ID */}
              <div className="space-y-2">
                <Label htmlFor="product_id" className="text-sm font-medium">
                  Product ID <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="product_id"
                  type="number"
                  min="0"
                  placeholder="Masukkan ID produk"
                  value={transaksiData.product_id}
                  onChange={(e) => handleInputChange('product_id', e.target.value)}
                  className={`h-10 bg-white border-gray-300 text-gray-900 ${
                    errors.product_id
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.product_id && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.product_id}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="qty" className="text-sm font-medium">
                  Quantity (Qty) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="qty"
                  type="number"
                  min="0"
                  placeholder="Masukkan quantity"
                  value={transaksiData.qty}
                  onChange={(e) => handleInputChange('qty', e.target.value)}
                  className={`h-10 bg-white border-gray-300 text-gray-900 ${
                    errors.qty
                      ? 'border-red-500 focus-visible:ring-red-500/20'
                      : 'focus-visible:border-primary focus-visible:ring-primary/20'
                  }`}
                />
                {errors.qty && (
                  <p className="text-xs text-red-600 mt-1.5">{errors.qty}</p>
                )}
              </div>

              {/* Total Harga - Hanya untuk PUT/PATCH, untuk POST otomatis dihitung */}
              {(method === 'PUT' || method === 'PATCH') && (
                <div className="space-y-2">
                  <Label htmlFor="total_harga" className="text-sm font-medium">
                    Total Harga <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="total_harga"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Masukkan total harga"
                    value={transaksiData.total_harga}
                    onChange={(e) => handleInputChange('total_harga', e.target.value)}
                    className={`h-10 bg-white border-gray-300 text-gray-900 ${
                      errors.total_harga
                        ? 'border-red-500 focus-visible:ring-red-500/20'
                        : 'focus-visible:border-primary focus-visible:ring-primary/20'
                    }`}
                  />
                  {errors.total_harga && (
                    <p className="text-xs text-red-600 mt-1.5">{errors.total_harga}</p>
                  )}
                </div>
              )}

              {/* Info untuk POST */}
              {method === 'POST' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-xs text-green-800 font-medium">
                    💡 Total harga akan otomatis dihitung berdasarkan product_id dan qty
                  </p>
                </div>
              )}

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

