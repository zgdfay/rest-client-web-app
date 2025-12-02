import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Trash2 } from 'lucide-react';
import type { RequestHistory } from '@/types';
import { format } from 'date-fns';
import { getMethodColor, getStatusColor } from '@/utils/colors';

interface HistoryPanelProps {
  history: RequestHistory[];
  onSelect: (history: RequestHistory) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
}

export function HistoryPanel({ history, onSelect, onDelete, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <History className="h-5 w-5" />
            History
          </CardTitle>
          <CardDescription className="text-sm text-gray-500 mt-1">
            Riwayat request yang pernah dikirim
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-32 text-gray-400">
            <p>Belum ada history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <History className="h-5 w-5" />
              History
            </CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1">
              {history.length} request tersimpan
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClear}
            className="border-gray-300 bg-white hover:bg-gray-50 text-gray-700">
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer bg-white"
                onClick={() => onSelect(item)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={`border ${getMethodColor(item.config.method)} font-medium`}>
                      {item.config.method}
                    </Badge>
                    <span className="text-sm font-medium truncate flex-1 text-gray-900">
                      {item.name || item.config.url}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 truncate mb-1">
                  {item.config.url}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {format(new Date(item.timestamp), 'PPp')}
                  </p>
                  {item.response && (
                    <Badge
                      variant="outline"
                      className={`text-xs border font-medium ${getStatusColor(item.response.status)}`}
                    >
                      {item.response.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

