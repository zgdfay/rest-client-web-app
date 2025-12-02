import { useState } from 'react';
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
import { Send, Plus, Trash2 } from 'lucide-react';
import type { HttpMethod, RequestConfig } from '@/types';
import { validateUrl, validateJson, validateHeaders } from '@/utils/validation';

interface RequestFormProps {
  onSubmit: (config: RequestConfig) => void;
  isLoading?: boolean;
}

export function RequestForm({ onSubmit, isLoading }: RequestFormProps) {
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<Array<{ key: string; value: string }>>(
    [{ key: 'Content-Type', value: 'application/json' }]
  );
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate URL
    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      newErrors.url = urlValidation.error || '';
    }

    // Validate JSON body
    if (
      body.trim() &&
      (method === 'POST' || method === 'PUT' || method === 'PATCH')
    ) {
      const jsonValidation = validateJson(body);
      if (!jsonValidation.valid) {
        newErrors.body = jsonValidation.error || '';
      }
    }

    // Validate headers
    const headersObj: Record<string, string> = {};
    headers.forEach(({ key, value }) => {
      if (key.trim()) {
        headersObj[key.trim()] = value.trim();
      }
    });
    const headersValidation = validateHeaders(headersObj);
    if (!headersValidation.valid) {
      newErrors.headers = headersValidation.error || '';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const headersObj: Record<string, string> = {};
    headers.forEach(({ key, value }) => {
      if (key.trim()) {
        headersObj[key.trim()] = value.trim();
      }
    });

    onSubmit({
      url: url.trim(),
      method,
      headers: headersObj,
      body: body.trim() || undefined,
    });
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (
    index: number,
    field: 'key' | 'value',
    value: string
  ) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    setHeaders(newHeaders);
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full flex flex-col w-full">
      <CardHeader className="border-b border-gray-100 pb-4 flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-gray-900">
          Request Configuration
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 mt-1">
          Konfigurasi request untuk REST API
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
          {/* URL & Method */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-3 space-y-2">
              <Label htmlFor="method" className="text-sm font-medium">
                Method
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
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-9 space-y-2">
              <Label htmlFor="url" className="text-sm font-medium">
                URL
              </Label>
              <Input
                id="url"
                type="url"
                placeholder="https://api.example.com/users"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={`h-10 bg-white border-gray-300 text-gray-900 ${
                  errors.url
                    ? 'border-red-500 focus-visible:ring-red-500/20'
                    : 'focus-visible:border-primary focus-visible:ring-primary/20'
                }`}
              />
              {errors.url && (
                <p className="text-xs text-red-600 mt-1.5">{errors.url}</p>
              )}
            </div>
          </div>

          {/* Headers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">
                Headers
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addHeader}
                className="h-8 border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Header
              </Button>
            </div>
            <div className="space-y-2.5">
              {headers.map((header, index) => (
                <div key={index} className="grid grid-cols-12 gap-2.5">
                  <div className="col-span-5">
                    <Input
                      placeholder="Header name"
                      value={header.key}
                      onChange={(e) =>
                        updateHeader(index, 'key', e.target.value)
                      }
                      className="h-9 bg-white border-gray-300 text-gray-900 focus-visible:border-primary focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="col-span-6">
                    <Input
                      placeholder="Header value"
                      value={header.value}
                      onChange={(e) =>
                        updateHeader(index, 'value', e.target.value)
                      }
                      className="h-9 bg-white border-gray-300 text-gray-900 focus-visible:border-primary focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="col-span-1 flex items-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(index)}
                      className="h-9 w-9 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {errors.headers && (
              <p className="text-sm text-destructive mt-1.5">
                {errors.headers}
              </p>
            )}
          </div>

          {/* Body */}
          {(method === 'POST' || method === 'PUT' || method === 'PATCH') && (
            <div className="space-y-2">
              <Label htmlFor="body" className="text-sm font-medium">
                Request Body (JSON)
              </Label>
              <Textarea
                id="body"
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className={`font-mono text-sm min-h-[200px] resize-y bg-white border-gray-300 text-gray-900 ${
                  errors.body
                    ? 'border-red-500 focus-visible:ring-red-500/20'
                    : 'focus-visible:border-primary focus-visible:ring-primary/20'
                }`}
              />
              {errors.body && (
                <p className="text-sm text-destructive mt-1.5">{errors.body}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 mt-auto">
            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 text-white hover:bg-blue-700 shadow-md font-medium transition-colors"
              disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              {isLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
