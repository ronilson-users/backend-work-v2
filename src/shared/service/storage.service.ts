// src/shared/services/storage.service.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';

export class StorageService {
  private static s3 = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });

  /**
   * Upload de foto para o cloud storage
   */
  static async uploadWorkPhoto(
    file: Buffer,
    userId: string,
    contractId: string,
    type: 'check-in' | 'check-out',
    metadata: any
  ): Promise<string> {
    const fileExtension = this.getFileExtension(metadata.mimeType);
    const filename = `${Date.now()}-${uuidv4()}.${fileExtension}`;
    
    const key = `workers/${userId}/contracts/${contractId}/${type}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: metadata.mimeType,
      Metadata: {
        'user-id': userId,
        'contract-id': contractId,
        'photo-type': type,
        'taken-at': metadata.takenAt.toISOString(),
        'original-name': metadata.originalName,
      },
    });

    await this.s3.send(command);

    // Retorna URL pública (ou signed URL se for privado)
    return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;
  }

  /**
   * Gerar URL assinada para acesso temporário (se necessário)
   */
  static async getSignedUrl(fileKey: string, expiresIn: number = 3600): Promise<string> {
    // Implementação com AWS SDK
    return `signed-url-for-${fileKey}`;
  }

  private static getFileExtension(mimeType: string): string {
    const extensions: { [key: string]: string } = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    return extensions[mimeType] || 'jpg';
  }
}