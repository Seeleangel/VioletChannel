import imageCompression from 'browser-image-compression';

export const compressImage = async (file, options) => {
    const defaultOptions = {
        maxSizeMB: options.maxSizeMB || 1,
        maxWidthOrHeight: options.maxWidthOrHeight || 1920,
        useWebWorker: true,
        fileType: options.fileType // optional, e.g. 'image/jpeg'
    };

    try {
        const compressedFile = await imageCompression(file, defaultOptions);
        return compressedFile;
    } catch (error) {
        console.error('Compression error:', error);
        throw error;
    }
};

export const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
