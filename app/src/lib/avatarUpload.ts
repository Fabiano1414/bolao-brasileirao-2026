const MAX_SIZE = 200; // max width/height in px
const QUALITY = 0.8; // JPEG quality

/**
 * Converte arquivo de imagem em data URL otimizada para avatar.
 * Redimensiona e comprime para caber no localStorage.
 */
export function fileToAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = (height / width) * MAX_SIZE;
          width = MAX_SIZE;
        } else {
          width = (width / height) * MAX_SIZE;
          height = MAX_SIZE;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao carregar imagem'));
    };
    img.src = url;
  });
}
