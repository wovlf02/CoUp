import { successResponse, errorResponse } from '@/lib/utils/apiResponse';
import { authorize } from '@/lib/utils/auth';
import prisma from '@/lib/db/prisma';

export async function GET(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;

    // Check if the user is an active member of the study group
    const isMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id, status: 'ACTIVE' },
    });

    if (!isMember) {
      return errorResponse('You are not a member of this study group', 403);
    }

    const files = await prisma.file.findMany({
      where: { studyGroupId: studyId },
      include: { uploader: { select: { id: true, name: true, imageUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(files);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/GET]', error);
    return errorResponse('Failed to fetch files', 500);
  }
}

export async function POST(request, { params }) {
  try {
    const { authorized, user, message } = await authorize();
    if (!authorized) {
      return errorResponse(message, 401);
    }

    const { studyId } = params;
    // In a real application, this would involve handling file uploads.
    // For MVP, we'll simulate a file upload or expect a pre-signed URL flow.
    // This example assumes a simple metadata creation after an external upload.
    const body = await request.json();
    const { fileName, fileUrl, fileSize, fileType } = body;

    if (!fileName || !fileUrl || !fileSize || !fileType) {
      return errorResponse('Missing required fields for file upload', 400);
    }

    // Check if the user is a member of the study group
    const studyMember = await prisma.studyMember.findFirst({
      where: { studyGroupId: studyId, userId: user.id },
    });

    if (!studyMember) {
      return errorResponse('You are not a member of this study group', 403);
    }

    const newFile = await prisma.file.create({
      data: {
        studyGroupId: studyId,
        uploaderId: user.id,
        fileName,
        fileUrl,
        fileSize,
        fileType,
      },
    });

    return successResponse(newFile, 'File uploaded successfully', 201);
  } catch (error) {
    console.error('[API/studies/[studyId]/files/POST]', error);
    return errorResponse('Failed to upload file', 500);
  }
}
