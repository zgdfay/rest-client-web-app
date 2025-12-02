import type { RequestConfig, ApiResponse } from '@/types';

export async function makeRequest(config: RequestConfig): Promise<ApiResponse> {
  const startTime = performance.now();
  
  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: config.headers,
      body: config.method !== 'GET' && config.method !== 'DELETE' && config.body 
        ? config.body 
        : undefined,
    });

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    let data: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else if (contentType?.includes('text/')) {
      data = await response.text();
    } else {
      const blob = await response.blob();
      data = `[Blob: ${blob.size} bytes, type: ${blob.type}]`;
    }

    const endTime = performance.now();
    const time = Math.round(endTime - startTime);
    const size = JSON.stringify(data).length;

    return {
      status: response.status,
      statusText: response.statusText,
      headers,
      data,
      time,
      size,
    };
  } catch (error) {
    const endTime = performance.now();
    const time = Math.round(endTime - startTime);
    
    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      data: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      time,
      size: 0,
    };
  }
}

