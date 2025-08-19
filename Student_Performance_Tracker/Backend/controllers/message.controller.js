const { Message, ChatGroup, ChatGroupMembers, User, Student, Teacher } = require('../models');
const { Op } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

// Helper function to get Socket.IO instance
const getIO = (req) => req.app.get('io');

// Send a message (direct or group)
exports.sendMessage = async (req, res) => {
  try {
    const { messageText, receiverId, chatGroupId } = req.body;
    const senderId = req.user.id;

    // Validate that either receiverId OR chatGroupId is provided (not both)
    if (!receiverId && !chatGroupId) {
      return res.status(400).json({ error: 'Either receiverId or chatGroupId is required' });
    }

    if (receiverId && chatGroupId) {
      return res.status(400).json({ error: 'Cannot send to both individual and group simultaneously' });
    }

    const newMessage = await Message.create({
      id: uuidv4(),
      senderId,
      receiverId: receiverId || null,
      chatGroupId: chatGroupId || null,
      messageText,
      sentAt: new Date(),
      isRead: false,
    });

    // Include sender info for real-time updates
    const messageWithSender = await Message.findByPk(newMessage.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'name'] }
      ]
    });

    // Emit via Socket.IO for real-time updates
    const io = getIO(req);
    if (chatGroupId) {
      io.to(`group-${chatGroupId}`).emit('newMessage', messageWithSender);
    }
    if (receiverId) {
      io.to(`user-${receiverId}`).emit('newMessage', messageWithSender);
      io.to(`user-${senderId}`).emit('newMessage', messageWithSender);
    }

    res.status(201).json(messageWithSender);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get messages for a conversation (direct or group)
exports.getMessages = async (req, res) => {
  try {
    const { chatGroupId, userId } = req.query;
    const currentUserId = req.user.id;
    
    let where = {};
    
    if (chatGroupId) {
      // Group messages
      where.chatGroupId = chatGroupId;
    } else if (userId) {
      // Direct messages between current user and specified user
      where[Op.or] = [
        { senderId: currentUserId, receiverId: userId },
        { senderId: userId, receiverId: currentUserId }
      ];
    }
    
    const messages = await Message.findAll({ 
      where, 
      order: [['sentAt', 'ASC']],
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name'] },
        { model: User, as: 'receiver', attributes: ['id', 'name'] }
      ]
    });
    
    res.json(messages);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Create a group (teacher only)
// Create a group (teacher only)
exports.createGroup = async (req, res) => {
  try {
    const { name, studentIds } = req.body;
    const creatorId = req.user.id;
    
    // Check if user is a teacher
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Only teachers can create groups' });
    }
    
    const groupId = uuidv4();
    
    // Create the group
    const newGroup = await ChatGroup.create({
      id: groupId,
      name,
      createdBy: creatorId
    });
    
    // Add creator (teacher) as member - THIS WAS MISSING LIKELY
    await ChatGroupMembers.create({
      id: uuidv4(),
      chatGroupId: groupId,
      memberId: creatorId,
      memberRole: 'teacher',
      joinedAt: new Date()
    });
    
    // Add selected students as members
    if (studentIds && studentIds.length > 0) {
      const memberPromises = studentIds.map(studentId => 
        ChatGroupMembers.create({
          id: uuidv4(),
          chatGroupId: groupId,
          memberId: studentId,
          memberRole: 'student',
          joinedAt: new Date()
        })
      );
      await Promise.all(memberPromises);
    }
    
    res.status(201).json(newGroup);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(400).json({ error: err.message });
  }
};


// Get user's conversations/groups
// Get user's conversations/groups
// Get user's conversations/groups
// Get user's conversations/groups - FIXED VERSION
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Getting conversations for user:', userId);
    
    // Try the association query first
    let userGroups = [];
    try {
      userGroups = await ChatGroup.findAll({
        include: [{
          model: ChatGroupMembers,
          as: 'members',
          where: { memberId: userId },
          required: true
        }]
      });
      console.log('Found groups via association:', userGroups.length);
    } catch (associationError) {
      console.error('Association query failed:', associationError);
      
      // Fallback: Direct query
      console.log('Trying fallback query...');
      const membershipRecords = await ChatGroupMembers.findAll({
        where: { memberId: userId },
        attributes: ['chatGroupId']
      });
      
      const groupIds = membershipRecords.map(record => record.chatGroupId);
      console.log('Found group IDs:', groupIds);
      
      if (groupIds.length > 0) {
        userGroups = await ChatGroup.findAll({
          where: { id: groupIds }
        });
        console.log('Found groups via fallback:', userGroups.length);
      }
    }
    
    console.log(`Returning ${userGroups.length} groups for user ${userId}`);
    res.json(userGroups);
  } catch (err) {
    console.error('Error in getUserConversations:', err);
    res.status(400).json({ error: err.message });
  }
};



