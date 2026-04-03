import { Response } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest, PaginationQuery } from '../types';

export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      page = '1',
      limit = '10',
      status,
      search,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query as PaginationQuery;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.TaskWhereInput = { userId };

    if (status && ['PENDING', 'IN_PROGRESS', 'COMPLETED'].includes(status.toUpperCase())) {
      where.status = status.toUpperCase() as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH'].includes(priority.toUpperCase())) {
      where.priority = priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH';
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['createdAt', 'updatedAt', 'title', 'dueDate', 'priority'];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [orderByField]: sortOrder },
      }),
      prisma.task.count({ where }),
    ]);

    sendSuccess(res, tasks, 'Tasks fetched successfully', 200, {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    sendError(res, 'Failed to fetch tasks', 500);
  }
};

export const getTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    sendSuccess(res, task, 'Task fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch task', 500);
  }
};

export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: req.user!.id,
      },
    });

    sendSuccess(res, task, 'Task created successfully', 201);
  } catch (error) {
    sendError(res, 'Failed to create task', 500);
  }
};

export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const { title, description, status, priority, dueDate } = req.body;

    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    sendSuccess(res, task, 'Task updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update task', 500);
  }
};

export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await prisma.task.delete({ where: { id } });
    sendSuccess(res, null, 'Task deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete task', 500);
  }
};

export const toggleTask = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.task.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const statusCycle: Record<string, 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'COMPLETED',
      COMPLETED: 'PENDING',
    };

    const task = await prisma.task.update({
      where: { id },
      data: { status: statusCycle[existing.status] },
    });

    sendSuccess(res, task, 'Task status toggled successfully');
  } catch (error) {
    sendError(res, 'Failed to toggle task', 500);
  }
};

export const getTaskStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const [total, pending, inProgress, completed] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: 'PENDING' } }),
      prisma.task.count({ where: { userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { userId, status: 'COMPLETED' } }),
    ]);

    sendSuccess(res, { total, pending, inProgress, completed }, 'Stats fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch stats', 500);
  }
};