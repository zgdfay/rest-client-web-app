import type { HttpMethod } from '@/types';

export function getMethodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'bg-green-100 text-green-700 border-green-300',
    POST: 'bg-blue-100 text-blue-700 border-blue-300',
    PUT: 'bg-amber-100 text-amber-700 border-amber-300',
    PATCH: 'bg-purple-100 text-purple-700 border-purple-300',
    DELETE: 'bg-red-100 text-red-700 border-red-300',
  };
  return colors[method];
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) {
    return 'bg-green-100 text-green-700 border-green-300';
  } else if (status >= 300 && status < 400) {
    return 'bg-blue-100 text-blue-700 border-blue-300';
  } else if (status >= 400 && status < 500) {
    return 'bg-amber-100 text-amber-700 border-amber-300';
  } else if (status >= 500) {
    return 'bg-red-100 text-red-700 border-red-300';
  }
  return 'bg-gray-100 text-gray-700 border-gray-300';
}

