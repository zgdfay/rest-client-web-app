import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestForm } from '@/components/rest-client/RequestForm';
import { ResponseInfo } from '@/components/rest-client/ResponseInfo';
import { ResponseBody } from '@/components/rest-client/ResponseBody';
import { HistoryPanel } from '@/components/rest-client/HistoryPanel';
import { makeRequest } from '@/utils/api';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { RequestConfig, ApiResponse, RequestHistory } from '@/types';

function App() {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useLocalStorage<RequestHistory[]>(
    'rest-client-history',
    []
  );
  const [activeTab, setActiveTab] = useState('request');

  const handleSubmit = async (config: RequestConfig) => {
    setIsLoading(true);
    setResponse(null);

    try {
      const apiResponse = await makeRequest(config);
      setResponse(apiResponse);

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
    } catch (error) {
      console.error('Request error:', error);
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        data: { error: 'Failed to make request' },
        time: 0,
        size: 0,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (historyItem: RequestHistory) => {
    // Show the response from history
    if (historyItem.response) {
      setResponse(historyItem.response);
    }
    // Switch to request tab to see the response
    setActiveTab('request');
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua history?')) {
      setHistory([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-blue-600">REST Client</h1>
          <p className="text-gray-600">
            Test dan verifikasi REST API dengan mudah. Support semua HTTP
            methods (GET, POST, PUT, PATCH, DELETE)
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6">
          <TabsList className="mb-6 bg-gray-100 p-1">
            <TabsTrigger
              value="request"
              className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              Request
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="request" className="mt-6">
            <div className="space-y-6">
              {/* Request Form dan Response Info Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                <div className="flex">
                  <RequestForm onSubmit={handleSubmit} isLoading={isLoading} />
                </div>
                <div className="flex">
                  <ResponseInfo response={response} />
                </div>
              </div>

              {/* Response Body Full Width */}
              {response && (
                <div>
                  <ResponseBody response={response} />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <HistoryPanel
              history={history}
              onSelect={handleSelectHistory}
              onDelete={handleDeleteHistory}
              onClear={handleClearHistory}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
