import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  initialQuality?: number;
}

export const compressImage = async (
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> => {
  const defaultOptions: CompressionOptions = {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    initialQuality: 0.8,
    ...options,
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log('Compression effectuée:');
    console.log('- Taille originale:', (file.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('- Taille compressée:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('- Réduction:', (((file.size - compressedFile.size) / file.size) * 100).toFixed(1), '%');
    
    return compressedFile;
  } catch (error) {
    console.error('Erreur de compression:', error);
    throw error;
  }
};

export const shouldCompress = (file: File, thresholdMB: number = 2): boolean => {
  return file.size > thresholdMB * 1024 * 1024;
};
