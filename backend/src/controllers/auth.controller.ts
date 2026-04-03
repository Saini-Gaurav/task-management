import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      sendError(res, 'Email already registered', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    const tokenPayload = { userId: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    sendSuccess(res, { user, accessToken, refreshToken }, 'Registration successful', 201);
  } catch (error) {
    sendError(res, 'Registration failed', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      sendError(res, 'Invalid email or password', 401);
      return;
    }

    const tokenPayload = { userId: user.id, email: user.email, name: user.name };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    sendSuccess(res, { user: userWithoutPassword, accessToken, refreshToken }, 'Login successful');
  } catch (error) {
    sendError(res, 'Login failed', 500);
  }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 'Refresh token required', 400);
      return;
    }

    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') {
      sendError(res, 'Invalid token type', 401);
      return;
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      sendError(res, 'Invalid or expired refresh token', 401);
      return;
    }

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });

    const tokenPayload = {
      userId: storedToken.user.id,
      email: storedToken.user.email,
      name: storedToken.user.name,
    };
    const newAccessToken = generateAccessToken(tokenPayload);
    const newRefreshToken = generateRefreshToken(tokenPayload);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: storedToken.userId,
        expiresAt: getRefreshTokenExpiry(),
      },
    });

    sendSuccess(
      res,
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Token refreshed successfully'
    );
  } catch (error) {
    sendError(res, 'Token refresh failed', 401);
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    sendSuccess(res, null, 'Logged out successfully');
  } catch (error) {
    sendError(res, 'Logout failed', 500);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!user) {
      sendError(res, 'User not found', 404);
      return;
    }
    sendSuccess(res, user, 'User fetched successfully');
  } catch (error) {
    sendError(res, 'Failed to fetch user', 500);
  }
};