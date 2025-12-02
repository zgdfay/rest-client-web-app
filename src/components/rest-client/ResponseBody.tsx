import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ApiResponse } from '@/types';

interface ResponseBodyProps {
  response: ApiResponse | null;
}

export function ResponseBody({ response }: ResponseBodyProps) {
  if (!response) {
    return null;
  }

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
        <CardTitle className="text-lg font-semibold text-gray-900">Response Body</CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          JSON response dari server
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-96 w-full border border-gray-200 rounded-md bg-gray-50">
          <pre className="p-4 text-xs font-mono overflow-auto text-gray-800">
            {formatJson(response.data)}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

