export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: false, error: 'URL tidak boleh kosong' };
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { valid: false, error: 'URL harus menggunakan HTTP atau HTTPS' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'Format URL tidak valid' };
  }
}

export function validateJson(jsonString: string): { valid: boolean; error?: string; parsed?: any } {
  if (!jsonString.trim()) {
    return { valid: true, parsed: null };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { valid: true, parsed };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Format JSON tidak valid' 
    };
  }
}

export function validateHeaders(headers: Record<string, string>): { valid: boolean; error?: string } {
  for (const [key, value] of Object.entries(headers)) {
    if (key.trim() && !value.trim()) {
      return { valid: false, error: `Header "${key}" tidak boleh kosong` };
    }
  }
  return { valid: true };
}

