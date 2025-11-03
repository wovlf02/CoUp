import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from '@/lib/db/prisma';

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

export async function POST(request, { params }) {
  try {
    const { studyId } = params;
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    // Check if the user is a member of the study group
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
    });

    if (!isMember) {
      return errorResponse('You are not a member of this study group', 403);
    }

    const { fileName, fileType } = await request.json();

    if (!fileName || !fileType) {
      return errorResponse('Missing fileName or fileType', 400);
    }

    const Key = `studies/${studyId}/${user.id}/${Date.now()}-${fileName}`;

    const putObjectCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 3600 }); // URL valid for 1 hour

    return successResponse({ signedUrl, Key }, 'Presigned URL generated successfully');
  } catch (error) {
    console.error('[API/studies/[studyId]/files/upload-url/POST]', error);
    return errorResponse('Failed to generate presigned URL', 500);
  }
}
