// Pure utility functions for file processing — no side effects, no I/O

export const getExtension = (file: Express.Multer.File): string => {
  if (!file.originalname) return '';
  const parts = file.originalname.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : '';
};

export const sanitizeFileName = (name: string): string => {
  if (!name) return 'file';
  return (
    name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .trim() || 'file'
  );
};

export const generateS3Key = (file: Express.Multer.File): string => {
  const ext = getExtension(file);
  const baseName = file.originalname
    ? sanitizeFileName(file.originalname.replace(new RegExp(`\\.${ext}$`, 'i'), ''))
    : 'file';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${baseName}-${timestamp}-${random}${ext ? `.${ext}` : ''}`;
};

export type TFileCategory = {
  folder: string;
  type: string;
};

// DRY: single source of truth for mime → category mapping
export const categorizeFile = (file: Express.Multer.File): TFileCategory => {
  const mimetype = file.mimetype?.toLowerCase() || '';
  const ext = getExtension(file);

  if (mimetype.startsWith('image/')) return { folder: 'images', type: 'image' };
  if (mimetype.startsWith('video/')) return { folder: 'videos', type: 'video' };
  if (mimetype.startsWith('audio/')) return { folder: 'audios', type: 'audio' };
  if (mimetype === 'application/pdf' || ext === 'pdf') return { folder: 'documents', type: 'document_pdf' };
  if (
    mimetype.startsWith('application/vnd.') ||
    ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(ext)
  ) return { folder: 'documents', type: 'document_office' };
  if (
    mimetype === 'text/plain' || mimetype === 'text/csv' ||
    ['txt', 'csv', 'md', 'log', 'json', 'xml', 'yaml', 'yml'].includes(ext)
  ) return { folder: 'documents', type: 'document_text' };
  if (
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext) ||
    mimetype.includes('zip') || mimetype.includes('rar')
  ) return { folder: 'archives', type: 'archive' };

  return { folder: 'others', type: 'unknown' };
};

export const toMB = (bytes: number): number =>
  Number((bytes / (1024 * 1024)).toFixed(4));

export const normalizeMulterFiles = (files: any): Express.Multer.File[] => {
  if (Array.isArray(files)) return files;
  if (files?.files && Array.isArray(files.files)) return files.files;
  if (typeof files === 'object') {
    const all: Express.Multer.File[] = [];
    Object.values(files).forEach((arr: any) => {
      if (Array.isArray(arr)) all.push(...arr);
    });
    return all;
  }
  return [];
};
