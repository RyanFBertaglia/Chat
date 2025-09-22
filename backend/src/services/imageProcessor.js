import sharp from 'sharp';

export class ImageProcessor {
    static async processProfileImage(buffer, size = 300) {
        try {
            const metadata = await sharp(buffer).metadata();
            
            const processedBuffer = await sharp(buffer)
                .resize(size, size, {
                    fit: 'cover',
                    position: 'center',
                    withoutEnlargement: true
                })
                .jpeg({ 
                    quality: 85,
                    progressive: true 
                })
                .toBuffer();

            return {
                success: true,
                buffer: processedBuffer,
                format: 'jpeg',
                size: processedBuffer.length,
                dimensions: `${size}x${size}`
            };
        } catch (error) {
            return {
                success: false,
                error: `Falha no processamento: ${error.message}`
            };
        }
    }

    static async processImage(buffer, maxWidth = 800) {
        try {
            const image = sharp(buffer);
            const metadata = await image.metadata();

            let width = metadata.width;
            let height = metadata.height;

            if (metadata.width > maxWidth) {
                width = maxWidth;
                height = Math.round((metadata.height * maxWidth) / metadata.width);
            }

            const processedBuffer = await image
                .resize(width, height, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .webp({ quality: 80 })
                .toBuffer();

            return {
                success: true,
                buffer: processedBuffer,
                format: 'webp',
                size: processedBuffer.length,
                dimensions: `${width}x${height}`,
                originalDimensions: `${metadata.width}x${metadata.height}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    static async validateImage(buffer) {
        try {
            const metadata = await sharp(buffer).metadata();
            
            const maxSize = 10 * 1024 * 1024;
            if (buffer.length > maxSize) {
                return { isValid: false, error: 'Imagem muito grande (max 10MB)' };
            }

            if (metadata.width < 50 || metadata.height < 50) {
                return { isValid: false, error: 'Imagem muito pequena (min 50x50)' };
            }

            return { 
                isValid: true, 
                width: metadata.width, 
                height: metadata.height,
                format: metadata.format
            };
        } catch (error) {
            return { isValid: false, error: 'Arquivo não é uma imagem válida' };
        }
    }
}