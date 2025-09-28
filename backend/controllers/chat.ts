import { Request, Response } from "express";
import prisma from "../database/connection/prisma";
import { CreateMessageRequest, GetMessagesRequest, MessageResponse } from "../models/Message";
import { CreateGroupRequest, GroupResponse } from "../models/Group";

export const createGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, description }: CreateGroupRequest = req.body;

    if (!name) {
      return res.status(400).json({ error: "Group name is required" });
    }

    // Create group and add creator as member in a transaction
    const group = await prisma.group.create({
      data: {
        name,
        description,
        created_by: userId,
        members: {
          create: {
            user_id: userId
          }
        }
      }
    });

    res.status(201).json({
      message: "Group created successfully",
      group: {
        id: group.id,
        name: group.name,
        description: group.description,
        created_by: group.created_by
      }
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getGroups = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            user_id: userId
          }
        }
      },
      include: {
        _count: {
          select: {
            members: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      created_by: group.created_by,
      created_at: group.created_at,
      member_count: group._count.members
    }));

    res.status(200).json({ groups: formattedGroups });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const joinGroup = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) }
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    // Check if user is already a member
    const existingMember = await prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: parseInt(groupId),
          user_id: userId
        }
      }
    });

    if (existingMember) {
      return res.status(400).json({ error: "User is already a member of this group" });
    }

    // Add user to group
    await prisma.groupMember.create({
      data: {
        group_id: parseInt(groupId),
        user_id: userId
      }
    });

    res.status(200).json({ message: "Successfully joined group" });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { group_id, content, is_anonymous = false }: CreateMessageRequest = req.body;

    if (!group_id || !content) {
      return res.status(400).json({ error: "Group ID and content are required" });
    }

    // Check if user is member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: group_id,
          user_id: userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: "User is not a member of this group" });
    }

    // Create message with user info
    const message = await prisma.message.create({
      data: {
        group_id,
        user_id: userId,
        content,
        is_anonymous
      },
      include: {
        user: {
          select: {
            username: true,
            is_anonymous: true
          }
        }
      }
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: {
        id: message.id,
        group_id: message.group_id,
        user_id: message.user_id,
        content: message.content,
        is_anonymous: message.is_anonymous,
        created_at: message.created_at,
        username: message.is_anonymous ? "Anonymous" : message.user.username,
        user_is_anonymous: message.user.is_anonymous
      }
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const offset = (Number(page) - 1) * Number(limit);
    
    // Check if user is member of the group
    const member = await prisma.groupMember.findUnique({
      where: {
        group_id_user_id: {
          group_id: parseInt(groupId),
          user_id: userId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ error: "User is not a member of this group" });
    }

    // Get messages with pagination
    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: {
          group_id: parseInt(groupId)
        },
        include: {
          user: {
            select: {
              username: true,
              is_anonymous: true
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: Number(limit),
        skip: offset
      }),
      prisma.message.count({
        where: {
          group_id: parseInt(groupId)
        }
      })
    ]);

    // Format messages and reverse to show oldest first
    const formattedMessages = messages.reverse().map(message => ({
      id: message.id,
      group_id: message.group_id,
      user_id: message.user_id,
      content: message.content,
      is_anonymous: message.is_anonymous,
      created_at: message.created_at,
      username: message.is_anonymous ? "Anonymous" : message.user.username,
      user_is_anonymous: message.user.is_anonymous
    }));

    res.status(200).json({
      messages: formattedMessages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const toggleAnonymousMode = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { is_anonymous } = req.body;
    
    await prisma.user.update({
      where: { id: userId },
      data: { is_anonymous }
    });

    res.status(200).json({
      message: "Anonymous mode updated successfully",
      is_anonymous
    });
  } catch (error) {
    console.error("Toggle anonymous mode error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
