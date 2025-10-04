const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');

class PhotoService {
    constructor() {
        this.uploadDir = path.join(__dirname, '..', 'uploads');
        this.init();
    }

    async init() {
        try {
            await fs.access(this.uploadDir);
        } catch {
            await fs.mkdir(this.uploadDir, { recursive: true });
        }
    }

    async setUserPhoto(userId, imageBuffer, options = {}) {
        try {
            const metadata = await sharp(imageBuffer).metadata().catch(() => null);
            if (!metadata) {
                throw new Error('Arquivo não é uma imagem válida');
            }

            // Processa a imagem 300x300
            const processedBuffer = await sharp(imageBuffer)
                .resize(300, 300, {
                    fit: 'cover',
                    position: 'center',
                    withoutEnlargement: true
                })
                .jpeg({ 
                    quality: 85,
                    progressive: true 
                })
                .toBuffer();

            const filename = `user_${userId}_${Date.now()}.jpg`;
            const filepath = path.join(this.uploadDir, filename);

            await fs.writeFile(filepath, processedBuffer);

            return {
                success: true,
                filename,
                filepath,
                url: `/uploads/${filename}`,
                size: processedBuffer.length,
                dimensions: '300x300',
                uploadedAt: new Date()
            };
        } catch (error) {
            console.error('Erro ao salvar foto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getUserPhoto(userId) {
        try {
            const files = await fs.readdir(this.uploadDir);
            const userFiles = files.filter(file => file.startsWith(`user_${userId}_`));
            
            if (userFiles.length === 0) {
                return { success: false, error: 'Foto não encontrada' };
            }

            // Foto mais recente
            const latestPhoto = userFiles.sort().reverse()[0];
            const filepath = path.join(this.uploadDir, latestPhoto);

            const buffer = await fs.readFile(filepath);
            const stats = await fs.stat(filepath);

            return {
                success: true,
                filename: latestPhoto,
                size: stats.size,
                lastModified: stats.mtime,
                url: `/uploads/${latestPhoto}`
            };
        } catch (error) {
            console.error('Erro ao buscar foto:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async deleteUserPhoto(userId) {
        try {
            const files = await fs.readdir(this.uploadDir);
            const userFiles = files.filter(file => file.startsWith(`user_${userId}_`));

            for (const file of userFiles) {
                const filepath = path.join(this.uploadDir, file);
                await fs.unlink(filepath);
            }

            return {
                success: true,
                deleted: userFiles.length,
                message: `Removidas ${userFiles.length} fotos do usuário ${userId}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    async getUserPhotoURL(userId) {
        try {
            const files = await fs.readdir(this.uploadDir);
            const userFiles = files.filter(file => file.startsWith(`user_${userId}_`));
            
            if (userFiles.length === 0) {
                return null;
            }

            // Foto mais recente
            const latestPhoto = userFiles.sort().reverse()[0];
            return `/uploads/${latestPhoto}`;
        } catch (error) {
            console.error('Erro ao buscar URL da foto:', error);
            return null;
        }
    }

}

module.exports = PhotoService;