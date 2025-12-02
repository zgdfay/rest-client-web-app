import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Clock, Database } from 'lucide-react';
import type { ApiResponse } from '@/types';
import { getStatusColor } from '@/utils/colors';

interface ResponseInfoProps {
  response: ApiResponse | null;
}

export function ResponseInfo({ response }: ResponseInfoProps) {
  if (!response) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col w-full">
        <CardHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
          <CardTitle className="text-lg font-semibold text-gray-900">Response</CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Response akan muncul di sini setelah request dikirim
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 flex-1 flex items-center justify-center">
          <div className="text-gray-400">
            <p>Belum ada response</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isError = response.status >= 400 || response.status === 0;

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col w-full">
      <CardHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Response</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              Hasil dari request yang dikirim
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-sm border font-medium ${getStatusColor(response.status)}`}>
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
      <CardContent className="pt-6 space-y-4 flex-1 flex flex-col min-h-0">
        {/* Response Info */}
        <div className="grid grid-cols-3 gap-4 flex-shrink-0">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-700">Time</p>
              <p className="text-xs text-blue-600">{response.time} ms</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <Database className="h-4 w-4 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-purple-700">Size</p>
              <p className="text-xs text-purple-600">
                {(response.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <div className={`p-3 rounded-lg border ${isSuccess ? 'bg-green-50 border-green-200' : isError ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
            <p className={`text-sm font-medium ${isSuccess ? 'text-green-700' : isError ? 'text-red-700' : 'text-amber-700'}`}>Status</p>
            <p className={`text-xs ${isSuccess ? 'text-green-600' : isError ? 'text-red-600' : 'text-amber-600'}`}>
              {isSuccess ? 'Success' : isError ? 'Error' : 'Warning'}
            </p>
          </div>
        </div>

        <Separator className="bg-gray-200 flex-shrink-0" />

        {/* Headers */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold mb-2 text-gray-700 flex-shrink-0">Response Headers</h3>
          <ScrollArea className="flex-1 w-full border border-gray-200 rounded-md p-3 bg-gray-50 min-h-0">
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
      </CardContent>
    </Card>
  );
}

