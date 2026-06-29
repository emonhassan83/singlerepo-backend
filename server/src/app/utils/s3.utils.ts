import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';

import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { lookup } from 'mime-types';

import { env } from '@/app/configs/env.configs';
import s3Client from '@/app/configs/s3Client.configs';
import { unlinkFile } from '@/app/utils/system.utils';

const bucketName = env.S3_BUCKET_NAME;
const regionName = env.S3_REGION;


export async function singleUploadToS3({
  filePath,
  key,
  mimeType,
}: {
  filePath: string;
  mimeType: string;
  key: string;
}): Promise<string> {
  try {
    const contentType = lookup(filePath);
    const stream = createReadStream(filePath);
    const command = new PutObjectCommand({
      Key: key,
      Bucket: bucketName,
      ContentType: contentType || `image/${mimeType.replace(/^\./, '')}`,
      Body: stream,
    });
    await s3Client.send(command);
    await unlink(filePath);
    return `https://${bucketName}.s3.${regionName}.amazonaws.com/${key}`;
  } catch (error) {
    await unlinkFile({ filePath });
    if (error instanceof Error) throw error;
    throw new Error('Unknown Error Occurred In S3 Single File Upload Utility');
  }
}

// Buffer-based upload (multer memoryStorage — no temp file on disk)
export async function uploadToS3({
  file,
  fileName,
}: {
  file: Express.Multer.File;
  fileName: string;
}): Promise<string> {
  const key = `images/${fileName}`;
  const command = new PutObjectCommand({
    Key: key,
    Bucket: bucketName,
    ContentType: file.mimetype,
    Body: file.buffer,
  });
  await s3Client.send(command);
  return `https://${bucketName}.s3.${regionName}.amazonaws.com/${key}`;
}

export async function uploadManyToS3(
  tasks: Array<{ file: Express.Multer.File; folder: string; key: string }>
): Promise<Array<{ url: string }>> {
  const uploads = tasks.map(async ({ file, folder, key }) => {
    const s3Key = `${folder}/${key}`;
    const command = new PutObjectCommand({
      Key: s3Key,
      Bucket: bucketName,
      ContentType: file.mimetype,
      Body: file.buffer,
    });
    await s3Client.send(command);
    return { url: `https://${bucketName}.s3.${regionName}.amazonaws.com/${s3Key}` };
  });
  return Promise.all(uploads);
}

export async function singleDeleteToS3({ key }: { key: string }): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Unknown Error Occurred In S3 Single File Delete Utility');
  }
}
