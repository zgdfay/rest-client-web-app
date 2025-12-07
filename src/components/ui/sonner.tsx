import * as React from 'react';
import { Toaster as Sonner } from 'sonner';
import {
  CheckCircle2,
  Info,
  Loader2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <>
      <style>{`
        [data-sonner-toast] {
          display: flex !important;
          align-items: flex-start !important;
          max-width: 420px !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        [data-sonner-toast] [data-icon] {
          margin-top: 0 !important;
          align-self: flex-start !important;
          flex-shrink: 0 !important;
          margin-right: 12px !important;
        }
        [data-sonner-toast] [data-content] {
          display: flex !important;
          flex-direction: column !important;
          flex: 1 !important;
          align-items: flex-start !important;
          min-width: 0 !important;
          overflow: hidden !important;
        }
        [data-sonner-toast] [data-title] {
          display: flex !important;
          align-items: center !important;
          line-height: 1.5 !important;
          margin: 0 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        [data-sonner-toast] [data-description] {
          display: block !important;
          margin-top: 4px !important;
          width: 100% !important;
          min-width: 0 !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
        }
        [data-sonner-toast] [data-description] pre {
          white-space: pre-wrap !important;
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 100% !important;
          overflow-x: auto !important;
        }
        [data-sonner-toast] [data-description] div {
          max-width: 100% !important;
          overflow: hidden !important;
        }
        [data-sonner-toast] [data-description] p {
          word-wrap: break-word !important;
          overflow-wrap: break-word !important;
          max-width: 100% !important;
        }
      `}</style>
      <Sonner
        className="toaster group"
        toastOptions={{
          classNames: {
            toast:
              'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg flex items-start',
            description: 'group-[.toast]:text-gray-500',
            actionButton:
              'group-[.toast]:bg-gray-900 group-[.toast]:text-gray-50',
            cancelButton:
              'group-[.toast]:bg-white group-[.toast]:text-gray-500 group-[.toast]:border group-[.toast]:border-gray-200',
          },
        }}
        icons={{
          success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
          info: <Info className="h-4 w-4 text-blue-600" />,
          warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
          error: <XCircle className="h-4 w-4 text-red-600" />,
          loading: <Loader2 className="h-4 w-4 animate-spin text-gray-600" />,
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
