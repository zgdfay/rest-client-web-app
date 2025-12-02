import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Clock, Database } from 'lucide-react';
import type { ApiResponse } from '@/types';

interface ResponseViewerProps {
  response: ApiResponse | null;
}

export function ResponseViewer({ response }: ResponseViewerProps) {
  if (!response) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Response</CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Response akan muncul di sini setelah request dikirim
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-gray-400">
            <p>Belum ada response</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isError = response.status >= 400 || response.status === 0;

  const formatJson = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Response</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Hasil dari request yang dikirim
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isSuccess ? 'default' : isError ? 'destructive' : 'secondary'}
              className="text-sm"
            >
              {response.status} {response.statusText}
            </Badge>
            {isSuccess ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Response Info */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Clock className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Time</p>
              <p className="text-xs text-gray-500">{response.time} ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <Database className="h-4 w-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-700">Size</p>
              <p className="text-xs text-gray-500">
                {(response.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-sm font-medium text-gray-700">Status</p>
            <p className="text-xs text-gray-500">
              {isSuccess ? 'Success' : isError ? 'Error' : 'Warning'}
            </p>
          </div>
        </div>

        <Separator />

        {/* Headers */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Response Headers</h3>
          <ScrollArea className="h-32 w-full border border-gray-200 rounded-md p-3 bg-gray-50">
            <div className="space-y-1">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="text-xs font-mono">
                  <span className="text-gray-500">{key}:</span>{' '}
                  <span className="text-gray-700">{value}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator className="bg-gray-200" />

        {/* Response Body */}
        <div>
          <h3 className="text-sm font-semibold mb-2 text-gray-700">Response Body</h3>
          <ScrollArea className="h-96 w-full border border-gray-200 rounded-md bg-gray-50">
            <pre className="p-4 text-xs font-mono overflow-auto text-gray-800">
              {formatJson(response.data)}
            </pre>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

