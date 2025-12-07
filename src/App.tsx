import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductTable } from '@/components/rest-client/ProductTable';
import { TransaksiTable } from '@/components/rest-client/TransaksiTable';
import { HistoryPanel } from '@/components/rest-client/HistoryPanel';
import { Toaster } from '@/components/ui/sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { RequestConfig, ApiResponse, RequestHistory } from '@/types';

function App() {
  const [history, setHistory] = useLocalStorage<RequestHistory[]>(
    'rest-client-history',
    []
  );
  const [activeTab, setActiveTab] = useState('tabel-produk');

  const handleSelectHistory = (_historyItem: RequestHistory) => {
    // Switch to history tab
    setActiveTab('history');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const handleAddHistory = (
    config: RequestConfig,
    apiResponse: ApiResponse
  ) => {
    // Save to history
    let historyName = `${config.method} ${config.url}`;
    try {
      const urlObj = new URL(config.url);
      historyName = `${config.method} ${urlObj.pathname}`;
    } catch {
      // Keep original name if URL parsing fails
    }

    const historyItem: RequestHistory = {
      id: Date.now().toString(),
      name: historyName,
      config,
      response: apiResponse,
      timestamp: Date.now(),
    };

    setHistory([historyItem, ...history.slice(0, 49)]); // Keep last 50 items
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        [data-state="active"][data-slot="tabs-trigger"] {
          background-color: rgb(219 234 254) !important;
          color: rgb(29 78 216) !important;
        }
      `}</style>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl">
        <header className="pt-6 sm:pt-8 lg:pt-10 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 text-blue-600">
            REST Client
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Test dan verifikasi REST API dengan mudah. Support semua HTTP
            methods (GET, POST, PUT, PATCH, DELETE)
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4 sm:space-y-6">
          <div className="mb-4 sm:mb-6 w-full overflow-x-auto">
            <TabsList className="bg-transparent p-0 gap-2 w-max min-w-full sm:min-w-0 border-0 shadow-none inline-flex">
              <TabsTrigger
                value="tabel-produk"
                className="flex-shrink-0 px-4 sm:px-8 py-2 rounded-md transition-colors data-[state=active]:!bg-blue-100 data-[state=active]:!text-blue-700 data-[state=active]:shadow-sm hover:bg-gray-50 whitespace-nowrap">
                Tabel Produk
              </TabsTrigger>
              <TabsTrigger
                value="tabel-transaksi"
                className="shrink-0 px-4 sm:px-8 py-2 rounded-md transition-colors data-[state=active]:!bg-blue-100 data-[state=active]:!text-blue-700 data-[state=active]:shadow-sm hover:bg-gray-50 whitespace-nowrap">
                Tabel Transaksi
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex-shrink-0 px-4 sm:px-8 py-2 rounded-md transition-colors data-[state=active]:!bg-blue-100 data-[state=active]:!text-blue-700 data-[state=active]:shadow-sm hover:bg-gray-50 whitespace-nowrap">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tabel-produk" className="mt-4 sm:mt-6">
            <ProductTable onAddHistory={handleAddHistory} />
          </TabsContent>

          <TabsContent value="tabel-transaksi" className="mt-4 sm:mt-6">
            <TransaksiTable onAddHistory={handleAddHistory} />
          </TabsContent>

          <TabsContent value="history" className="mt-4 sm:mt-6">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
            />
          </TabsContent>
        </Tabs>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
