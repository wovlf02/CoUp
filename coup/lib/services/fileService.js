import prisma from '@/lib/db/prisma';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export async function createFileRecord(studyGroupId, uploaderId, fileName, fileUrl, fileSize, fileType) {
  return prisma.file.create({
    data: {
      studyGroupId,
      uploaderId,
      fileName,
      fileUrl,
      fileSize,
      fileType,
    },
  });
}

export async function getFilesByStudyGroup(studyGroupId) {
  return prisma.file.findMany({
    where: { studyGroupId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getFileById(fileId) {
  return prisma.file.findUnique({
    where: { id: fileId },
  });
}

export async function deleteFileRecord(fileId) {
  return prisma.file.delete({
    where: { id: fileId },
  });
}

export async function generatePresignedUploadUrl(fileName, fileType, studyGroupId, uploaderId) {
  const key = `study-files/${studyGroupId}/${uploaderId}/${Date.now()}-${fileName}`;
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL expires in 1 hour
  return { url, key };
}

export async function deleteFileFromS3(key) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  await s3Client.send(command);
}
