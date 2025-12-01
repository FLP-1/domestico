export const sanitizeDetailObject = (input: unknown, depth = 0): unknown => {
  if (!input || typeof input !== 'object') {
    return input;
  }

  if (depth > 3) {
    return '<omitted>';
  }

  if (Array.isArray(input)) {
    if (input.length > 20) {
      const preview = input
        .slice(0, 5)
        .map(item => sanitizeDetailObject(item, depth + 1));
      preview.push(`...(${input.length - 5} more)`);
      return preview;
    }
    return input.map(item => sanitizeDetailObject(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (
      (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) ||
      ((value as any)?.type === 'Buffer' && Array.isArray((value as any)?.data))
    ) {
      sanitized[key] = '<buffer>';
    } else if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
      sanitized[key] = '<binary>';
    } else if (
      lowerKey.includes('certificate') ||
      lowerKey.includes('privatekey') ||
      lowerKey.includes('passphrase') ||
      lowerKey.includes('freesockets')
    ) {
      sanitized[key] = '<redacted>';
    } else {
      sanitized[key] = sanitizeDetailObject(value, depth + 1);
    }
  }
  return sanitized;
};
