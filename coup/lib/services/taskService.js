import prisma from '@/lib/db/prisma';
import { createNotification } from './notificationService';

export async function createTask(studyGroupId, creatorId, title, description, dueDate, assigneeId) {
  const task = await prisma.task.create({
    data: {
      studyGroupId,
      creatorId,
      title,
      description,
      dueDate,
      assigneeId,
    },
  });

  // Notify assignee if assigned
  if (assigneeId && assigneeId !== creatorId) {
    await createNotification(
      assigneeId,
      'NEW_TASK_ASSIGNED',
      `새로운 할 일이 할당되었습니다: ${title}`,
      `/studies/${studyGroupId}/tasks`
    );
  }

  return task;
}

export async function getTasksByStudyGroup(studyGroupId) {
  return prisma.task.findMany({
    where: { studyGroupId },
    orderBy: { createdAt: 'desc' },
    include: { creator: true, assignee: true },
  });
}

export async function updateTask(taskId, data) {
  const originalTask = await prisma.task.findUnique({ where: { id: taskId } });
  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data,
  });

  // Notify assignee if changed or completed
  if (updatedTask.assigneeId && updatedTask.assigneeId !== originalTask.assigneeId) {
    await createNotification(
      updatedTask.assigneeId,
      'TASK_ASSIGNMENT_CHANGED',
      `할 일 담당자가 변경되었습니다: ${updatedTask.title}`,
      `/studies/${updatedTask.studyGroupId}/tasks`
    );
  } else if (updatedTask.isCompleted && !originalTask.isCompleted) {
    await createNotification(
      updatedTask.creatorId,
      'TASK_COMPLETED',
      `할 일이 완료되었습니다: ${updatedTask.title}`,
      `/studies/${updatedTask.studyGroupId}/tasks`
    );
  }

  return updatedTask;
}

export async function deleteTask(taskId) {
  const deletedTask = await prisma.task.delete({
    where: { id: taskId },
  });

  // Optionally notify creator/assignee about deletion
  await createNotification(
    deletedTask.creatorId,
    'TASK_DELETED',
    `할 일이 삭제되었습니다: ${deletedTask.title}`,
    `/studies/${deletedTask.studyGroupId}/tasks`
  );
  if (deletedTask.assigneeId && deletedTask.assigneeId !== deletedTask.creatorId) {
    await createNotification(
      deletedTask.assigneeId,
      'TASK_DELETED',
      `할 일이 삭제되었습니다: ${deletedTask.title}`,
      `/studies/${deletedTask.studyGroupId}/tasks`
    );
  }

  return deletedTask;
}
