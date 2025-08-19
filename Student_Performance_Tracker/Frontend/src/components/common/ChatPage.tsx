import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/api';
import { STORAGE_KEYS } from '../../services/config';
import { io, Socket } from 'socket.io-client';

// Keep your existing interfaces
interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  chatGroupId?: string;
  messageText: string;
  sentAt: string;
  sender: {
    id: string;
    name: string;
  };
  receiver?: {
    id: string;
    name: string;
  };
}

interface Contact {
  id: string;
  name: string;
  type: 'teacher' | 'student' | 'group';
}

interface Student {
  id: string;
  name: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatType, setSelectedChatType] = useState<'user' | 'group' | null>(null);
  const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
  const [inputText, setInputText] = useState('');
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<Student[]>([]);
  
  // Loading and Error states
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creatingGroup, setCreatingGroup] = useState(false);
  
  // Socket.IO states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // NEW: Auto-scroll refs and states
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);

  // NEW: Auto-scroll function
  const scrollToBottom = (force = false) => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 100; // 100px threshold
      
      // Only auto-scroll if user is at bottom or force is true
      if (isAtBottom || force || !isUserScrolledUp) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        setIsUserScrolledUp(false);
      }
    }
  };

  // NEW: Scroll listener to detect if user scrolled up
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
      setIsUserScrolledUp(!isAtBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [selectedChatId]);

  // NEW: Auto-scroll when messages change
  useEffect(() => {
    if (selectedChatId && messages[selectedChatId]) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages, selectedChatId]);

  // NEW: Auto-scroll when chat is selected (initial load)
  useEffect(() => {
    if (selectedChatId) {
      // Delay to allow messages to load
      setTimeout(() => scrollToBottom(true), 300);
      setIsUserScrolledUp(false);
    }
  }, [selectedChatId]);

  // Socket.IO initialization
  useEffect(() => {
    if (user) {
      console.log('Initializing socket connection for user:', user.id);
      
      const newSocket = io('http://localhost:3000', {
        auth: {
          token: localStorage.getItem(STORAGE_KEYS.TOKEN)
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
        setIsConnected(true);
        
        // Join user's personal room
        newSocket.emit('join', `user-${user.id}`);
        console.log(`Joined room: user-${user.id}`);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        console.log('Cleaning up socket connection');
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user]);

  // Socket event listeners for real-time messages
  useEffect(() => {
    if (socket && user) {
      console.log('Setting up socket message listeners');

      const handleNewMessage = (newMessage: Message) => {
        console.log('Received new message:', newMessage);
        
        // Determine which chat this message belongs to
        let chatId: string;
        if (newMessage.chatGroupId) {
          // Group message
          chatId = newMessage.chatGroupId;
        } else if (newMessage.senderId === user.id) {
          // Message sent by current user to someone else
          chatId = newMessage.receiverId || '';
        } else {
          // Direct message received from someone else
          chatId = newMessage.senderId;
        }

        if (chatId) {
          setMessages(prev => {
            const existingMessages = prev[chatId] || [];
            // Check if message already exists to avoid duplicates
            const messageExists = existingMessages.some(msg => msg.id === newMessage.id);
            if (!messageExists) {
              return {
                ...prev,
                [chatId]: [...existingMessages, newMessage]
              };
            }
            return prev;
          });
        }
      };

      socket.on('newMessage', handleNewMessage);

      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [socket, user]);

  // Join/leave rooms when changing chats
  useEffect(() => {
    if (socket && selectedChatId && selectedChatType) {
      if (selectedChatType === 'group') {
        console.log(`Joining group room: group-${selectedChatId}`);
        socket.emit('join', `group-${selectedChatId}`);
      }
      
      return () => {
        if (selectedChatType === 'group') {
          console.log(`Leaving group room: group-${selectedChatId}`);
          socket.emit('leave', `group-${selectedChatId}`);
        }
      };
    }
  }, [socket, selectedChatId, selectedChatType]);

  // Load conversations on component mount
  useEffect(() => {
    if (user) {
      if (user.role === 'teacher') {
        loadAssignedStudents();
        loadConversations();
      } else if (user.role === 'student') {
        loadAvailableTeachers();
        loadClassmates();
        loadConversations();
      }
    }
  }, [user]);

  // Load user's conversations/groups - USING APISERVICE
  const loadConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const groups = await apiService.getConversations();
      
      // Convert groups to contacts format
      const groupContacts: Contact[] = groups.map((group: any) => ({
        id: group.id,
        name: group.name,
        type: 'group' as const
      }));
      
      // For teachers, merge groups with assigned students
      // For students: merge groups with existing contacts (teachers + classmates)
      setContacts(prevContacts => {
        if (user?.role === 'student') {
          // For students: keep teacher and student contacts, add groups
          const nonGroupContacts = prevContacts.filter(c => c.type !== 'group');
          return [...nonGroupContacts, ...groupContacts];
        } else if (user?.role === 'teacher') {
          // For teachers: merge assigned students with groups
          const studentContacts = prevContacts.filter(c => c.type === 'student');
          return [...studentContacts, ...groupContacts];
        } else {
          // For other roles: just groups
          return groupContacts;
        }
      });
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load classmates for students
  const loadClassmates = async () => {
    try {
      // First try the new endpoint
      const response = await fetch('http://localhost:3000/api/v1/student/classmates', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`
        }
      });

      if (response.ok) {
        const classmates = await response.json();
        
        const classmateContacts: Contact[] = classmates.map((classmate: any) => ({
          id: classmate.id,
          name: classmate.name,
          type: 'student' as const
        }));
        
        // Add classmates to existing contacts
        setContacts(prevContacts => [...prevContacts, ...classmateContacts]);
      }
    } catch (err) {
      console.error('Error loading classmates:', err);
      // If the endpoint doesn't exist yet, that's fine - just continue without classmates
    }
  };

  // Load available teachers for students using new endpoint
  const loadAvailableTeachers = async () => {
    try {
      // First try the new student endpoint
      const response = await fetch('http://localhost:3000/api/v1/student/teachers', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`
        }
      });

      if (response.ok) {
        const teachers = await response.json();
        
        const teacherContacts: Contact[] = teachers.map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          type: 'teacher' as const
        }));
        
        setContacts(teacherContacts);
        return;
      }
    } catch (err) {
      console.error('Error loading available teachers from student endpoint:', err);
    }

    // Fallback: try admin endpoint
    try {
      const teachersData = await apiService.getAllTeachers(1, 100);
      const teachers = teachersData.data || teachersData;
      
      const teacherContacts: Contact[] = teachers.map((teacher: any) => ({
        id: teacher.userId || teacher.id,
        name: teacher.name || 'Unknown Teacher',
        type: 'teacher' as const
      }));
      
      setContacts(teacherContacts);
    } catch (err) {
      console.error('Error loading available teachers:', err);
      
      // Final fallback: try direct fetch
      try {
        const response = await fetch('http://localhost:3000/api/v1/admin/teachers', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`
          }
        });
        
        if (response.ok) {
          const teachersData = await response.json();
          const teachers = teachersData.data || teachersData;
          
          const teacherContacts: Contact[] = teachers.map((teacher: any) => ({
            id: teacher.userId || teacher.id,
            name: teacher.name || 'Unknown Teacher',
            type: 'teacher' as const
          }));
          
          setContacts(teacherContacts);
        }
      } catch {
        setContacts([]);
      }
    }
  };

  // Load assigned students and add them as contacts
  const loadAssignedStudents = async () => {
    try {
      console.log('Loading assigned students for teacher...');
      const students = await apiService.getAssignedStudents();
      
      console.log('Received students:', students);
      
      if (Array.isArray(students) && students.length > 0) {
        // Set for group creation modal
        setAssignedStudents(students.map((s: any) => ({ 
          id: s.id || s.userId, 
          name: s.name || s.userName || 'Unknown Student'
        })));

        // Also add students as individual contacts for direct messaging
        const studentContacts: Contact[] = students.map((s: any) => ({
          id: s.id || s.userId,
          name: s.name || s.userName || 'Unknown Student',
          type: 'student' as const
        }));
        
        // Add student contacts to the contacts list
        setContacts(prev => {
          // Remove existing student contacts to avoid duplicates
          const nonStudentContacts = prev.filter(c => c.type !== 'student');
          return [...nonStudentContacts, ...studentContacts];
        });
        
        return;
      }
      
      console.log('No assigned students found, trying fallback...');
      throw new Error('No assigned students found');
    } catch (err) {
      console.error('Error loading assigned students:', err);
      
      // Fallback 1: Try to get teacher profile
      try {
        const teacherProfile = await apiService.getTeacherProfile();
        const students = teacherProfile.assignedStudents || [];
        if (students.length > 0) {
          setAssignedStudents(students.map((s: any) => ({ 
            id: s.userId || s.id, 
            name: s.name || 'Unknown Student'
          })));

          // Also add as contacts
          const studentContacts: Contact[] = students.map((s: any) => ({
            id: s.userId || s.id,
            name: s.name || 'Unknown Student',
            type: 'student' as const
          }));
          
          setContacts(prev => {
            const nonStudentContacts = prev.filter(c => c.type !== 'student');
            return [...nonStudentContacts, ...studentContacts];
          });
          return;
        }
        throw new Error('No students in teacher profile');
      } catch {
        // Fallback 2: Try to get all students from admin endpoint
        try {
          console.log('Trying to get all students from admin endpoint...');
          const studentsData = await apiService.getAllStudents(1, 100);
          const allStudents = studentsData.data || studentsData;
          
          if (Array.isArray(allStudents) && allStudents.length > 0) {
            // Set for group creation modal
            setAssignedStudents(allStudents.map((s: any) => ({ 
              id: s.userId || s.id, 
              name: s.name || 'Unknown Student'
            })));

            // Also add as contacts
            const studentContacts: Contact[] = allStudents.map((s: any) => ({
              id: s.userId || s.id,
              name: s.name || 'Unknown Student',
              type: 'student' as const
            }));
            
            setContacts(prev => {
              const nonStudentContacts = prev.filter(c => c.type !== 'student');
              return [...nonStudentContacts, ...studentContacts];
            });
            return;
          }
          throw new Error('No students from admin endpoint');
        } catch {
          // Fallback 3: Try direct fetch
          try {
            console.log('Trying direct fetch for students...');
            const response = await fetch('http://localhost:3000/api/v1/admin/students', {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem(STORAGE_KEYS.TOKEN)}`
              }
            });
            
            if (response.ok) {
              const studentsData = await response.json();
              const allStudents = studentsData.data || studentsData;
              
              if (Array.isArray(allStudents) && allStudents.length > 0) {
                setAssignedStudents(allStudents.map((s: any) => ({ 
                  id: s.userId || s.id, 
                  name: s.name || 'Unknown Student'
                })));

                // Also add as contacts
                const studentContacts: Contact[] = allStudents.map((s: any) => ({
                  id: s.userId || s.id,
                  name: s.name || 'Unknown Student',
                  type: 'student' as const
                }));
                
                setContacts(prev => {
                  const nonStudentContacts = prev.filter(c => c.type !== 'student');
                  return [...nonStudentContacts, ...studentContacts];
                });
                return;
              }
            }
            
            // Ultimate fallback - use admin user as test
            console.log('Using ultimate fallback - admin user');
            setAssignedStudents([
              { id: 'user_admin_002', name: 'Admin User (Test)' }
            ]);

            // Also add as contact
            setContacts(prev => {
              const nonStudentContacts = prev.filter(c => c.type !== 'student');
              return [...nonStudentContacts, {
                id: 'user_admin_002',
                name: 'Admin User (Test)',
                type: 'student' as const
              }];
            });
          } catch (finalErr) {
            console.error('All fallbacks failed:', finalErr);
            setAssignedStudents([
              { id: 'user_admin_002', name: 'Admin User (Test)' }
            ]);

            // Also add as contact
            setContacts(prev => {
              const nonStudentContacts = prev.filter(c => c.type !== 'student');
              return [...nonStudentContacts, {
                id: 'user_admin_002',
                name: 'Admin User (Test)',
                type: 'student' as const
              }];
            });
          }
        }
      }
    }
  };

  // Load messages - USING APISERVICE
  const loadMessages = async (chatId: string, type: 'user' | 'group') => {
    setError(null);
    try {
      const messagesList = await apiService.getMessages(
        type === 'group' ? chatId : undefined,
        type === 'user' ? chatId : undefined
      );
      setMessages(prev => ({ ...prev, [chatId]: messagesList }));
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      // Set empty array so UI doesn't break
      setMessages(prev => ({ ...prev, [chatId]: [] }));
    }
  };

  // Handle chat selection
  const handleChatSelect = (contact: Contact) => {
    setSelectedChatId(contact.id);
    setSelectedChatType(contact.type === 'group' ? 'group' : 'user');
    loadMessages(contact.id, contact.type === 'group' ? 'group' : 'user');
  };

  // Send message - Let socket handle UI updates
  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedChatId || sendingMessage) return;
    
    setSendingMessage(true);
    setError(null);
    
    try {
      const messageData = {
        messageText: inputText.trim(),
        ...(selectedChatType === 'group' 
          ? { chatGroupId: selectedChatId }
          : { receiverId: selectedChatId }
        )
      };
      
      // Send message - socket will handle adding it to UI
      await apiService.sendMessage(messageData);
      setInputText('');
      
      // Don't manually add message to state - socket listener will handle it
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Create group - USING APISERVICE
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedStudents.length === 0 || creatingGroup) return;
    
    setCreatingGroup(true);
    setError(null);
    
    try {
      const newGroup = await apiService.createGroup({
        name: groupName.trim(),
        studentIds: selectedStudents
      });
      
      // Add new group to contacts
      const newGroupContact: Contact = {
        id: newGroup.id,
        name: newGroup.name,
        type: 'group'
      };
      
      setContacts(prev => [...prev, newGroupContact]);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedStudents([]);
      
      // Reload conversations to make sure we're in sync
      setTimeout(() => loadConversations(), 1000);
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setCreatingGroup(false);
    }
  };

  return (
    <div
      className={`flex h-[80vh] border border-gray-300 rounded-lg overflow-hidden ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-white'
      }`}
    >
      {/* Sidebar */}
      <div
        className={`w-64 p-4 overflow-y-auto border-r ${
          isDark ? 'border-gray-700' : 'border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Chats
          </h3>
          {user?.role === 'teacher' && (
            <button
              onClick={() => setShowGroupModal(true)}
              disabled={creatingGroup}
              className="bg-[#0bf70d] text-black px-3 py-1 rounded hover:bg-[#0ae60c] disabled:opacity-50"
            >
              {creatingGroup ? 'Creating...' : 'Create Group'}
            </button>
          )}
        </div>

        {/* Socket connection status indicator */}
        <div className={`text-xs mb-2 px-2 py-1 rounded ${
          isConnected 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? '🟢 Real-time Connected' : '🔴 Disconnected'}
        </div>

        {/* Loading state */}
        {loading && (
          <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Loading chats...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
            <small>{error}</small>
            <button 
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Contacts list with better organization */}
        {contacts.length > 0 && (
          <div className="space-y-1">
            {/* Show contact type sections for students */}
            {user?.role === 'student' && (
              <div className="space-y-2">
                {/* Teachers Section */}
                {contacts.filter(c => c.type === 'teacher').length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      TEACHERS
                    </div>
                    {contacts.filter(c => c.type === 'teacher').map((contact) => (
                      <ContactItem 
                        key={contact.id} 
                        contact={contact} 
                        selectedChatId={selectedChatId}
                        isDark={isDark}
                        onClick={handleChatSelect}
                      />
                    ))}
                  </div>
                )}
                
                {/* Classmates Section */}
                {contacts.filter(c => c.type === 'student').length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      CLASSMATES
                    </div>
                    {contacts.filter(c => c.type === 'student').map((contact) => (
                      <ContactItem 
                        key={contact.id} 
                        contact={contact} 
                        selectedChatId={selectedChatId}
                        isDark={isDark}
                        onClick={handleChatSelect}
                      />
                    ))}
                  </div>
                )}
                
                {/* Groups Section */}
                {contacts.filter(c => c.type === 'group').length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      GROUPS
                    </div>
                    {contacts.filter(c => c.type === 'group').map((contact) => (
                      <ContactItem 
                        key={contact.id} 
                        contact={contact} 
                        selectedChatId={selectedChatId}
                        isDark={isDark}
                        onClick={handleChatSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* For teachers, show students and groups in sections */}
            {user?.role === 'teacher' && (
              <div className="space-y-2">
                {/* Students Section */}
                {contacts.filter(c => c.type === 'student').length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      STUDENTS
                    </div>
                    {contacts.filter(c => c.type === 'student').map((contact) => (
                      <ContactItem 
                        key={contact.id} 
                        contact={contact} 
                        selectedChatId={selectedChatId}
                        isDark={isDark}
                        onClick={handleChatSelect}
                      />
                    ))}
                  </div>
                )}
                
                {/* Groups Section */}
                {contacts.filter(c => c.type === 'group').length > 0 && (
                  <div>
                    <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      GROUPS
                    </div>
                    {contacts.filter(c => c.type === 'group').map((contact) => (
                      <ContactItem 
                        key={contact.id} 
                        contact={contact} 
                        selectedChatId={selectedChatId}
                        isDark={isDark}
                        onClick={handleChatSelect}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!loading && contacts.length === 0 && (
          <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {user?.role === 'teacher' ? (
              <>No chats yet. Create a group to start!</>
            ) : (
              <>No chats available.</>
            )}
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-grow relative">
        {/* Chat Header with real-time indicator */}
        {selectedChatId && (
          <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {contacts.find(c => c.id === selectedChatId)?.name || 'Chat'}
                </h4>
                <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                  selectedChatType === 'group' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {selectedChatType === 'group' ? 'Group' : 'Direct Message'}
                </span>
                {isConnected && (
                  <span className="ml-2 text-xs text-green-600">● Live</span>
                )}
              </div>
              
              {/* Refresh button for manual message reload */}
              <button
                onClick={() => selectedChatId && selectedChatType && loadMessages(selectedChatId, selectedChatType)}
                className={`p-2 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
                title="Refresh messages"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* NEW: "New messages" indicator when user scrolled up */}
        {selectedChatId && isUserScrolledUp && (
          <div 
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-20 right-8 z-10 bg-[#0bf70d] text-black px-3 py-2 rounded-full cursor-pointer shadow-lg hover:bg-[#0ae60c] transition-all"
          >
            New messages ↓
          </div>
        )}

        {/* Message list with auto-scroll */}
        <div
          ref={messagesContainerRef}
          className={`flex-grow p-4 overflow-y-auto ${
            isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-900'
          }`}
        >
          {!selectedChatId && (
            <div className={`text-center mt-20 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <p className="mb-2">Select a chat to start messaging</p>
              <p className="text-sm">
                {user?.role === 'teacher' 
                  ? 'Message students directly or create groups to communicate with multiple students'
                  : 'Message teachers, classmates directly or join group conversations'
                }
              </p>
              {isConnected && (
                <p className="text-xs mt-2 text-green-600">Real-time messaging is active</p>
              )}
            </div>
          )}
          
          {selectedChatId &&
            (messages[selectedChatId] || []).map((msg: Message, index: number) => {
              const isCurrentUser = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id || index}
                  className={`mb-3 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-2 rounded-2xl break-words whitespace-pre-wrap ${
                      isCurrentUser
                        ? isDark
                          ? 'bg-green-600 text-white'
                          : 'bg-green-300 text-black'
                        : isDark
                        ? 'bg-gray-700 text-gray-300'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    {!isCurrentUser && selectedChatType === 'group' && (
                      <div className="text-xs font-semibold mb-1 text-blue-400">
                        {msg.sender?.name || 'Unknown User'}
                      </div>
                    )}
                    {msg.messageText}
                    <div
                      className={`mt-1 text-xs ${
                        isCurrentUser
                          ? isDark ? 'text-green-200' : 'text-green-800'
                          : isDark ? 'text-gray-400' : 'text-gray-600'
                      } text-right`}
                    >
                      {new Date(msg.sentAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          
          {/* Invisible div to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input with enhanced functionality */}
        {selectedChatId && (
          <div
            className={`p-4 border-t flex items-center space-x-3 ${
              isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-300 bg-white'
            }`}
          >
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={sendingMessage}
              className={`flex-grow px-4 py-2 rounded-full focus:outline-none focus:ring-2 disabled:opacity-50 ${
                isDark
                  ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-[#0bf70d]'
                  : 'bg-gray-200 text-gray-900 placeholder-gray-600 focus:ring-green-500'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || sendingMessage}
              className="bg-[#0bf70d] hover:bg-[#0ae60c] text-black px-5 py-2 rounded-full font-semibold transition-colors disabled:opacity-50"
            >
              {sendingMessage ? 'Sending...' : 'Send'}
            </button>
            
            {/* Manual scroll to bottom button */}
            <button
              onClick={() => scrollToBottom(true)}
              className={`p-2 rounded-full hover:bg-gray-200 ${isDark ? 'hover:bg-gray-600' : ''}`}
              title="Scroll to bottom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Group Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className={`p-6 rounded-lg shadow max-w-md w-full mx-4 ${
              isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}
          >
            <h2 className="text-xl font-bold mb-4">Create Group</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
                {error}
              </div>
            )}
            
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Group Name"
              disabled={creatingGroup}
              className={`w-full mb-3 px-3 py-2 text-base rounded border disabled:opacity-50 ${
                isDark
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-100 border-gray-300 placeholder-gray-600'
              }`}
            />
            <div className="mb-4">
              <span className="block font-semibold mb-2">Select Students:</span>
              <div className="max-h-48 overflow-y-auto border rounded">
                {assignedStudents.length === 0 ? (
                  <div className="p-3 text-center text-gray-500">
                    Loading students...
                  </div>
                ) : (
                  assignedStudents.map((student: Student) => (
                    <label
                      key={student.id}
                      className={`flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer ${
                        isDark ? 'hover:bg-gray-600' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        disabled={creatingGroup}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([...selectedStudents, student.id]);
                          } else {
                            setSelectedStudents(selectedStudents.filter((id) => id !== student.id));
                          }
                        }}
                      />
                      <span>{student.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setError(null);
                  setGroupName('');
                  setSelectedStudents([]);
                }}
                disabled={creatingGroup}
                className={`px-4 py-2 rounded disabled:opacity-50 ${
                  isDark ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || selectedStudents.length === 0 || creatingGroup}
                className="px-4 py-2 rounded bg-[#0bf70d] text-black font-bold disabled:opacity-50"
              >
                {creatingGroup ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for contact items
interface ContactItemProps {
  contact: Contact;
  selectedChatId: string | null;
  isDark: boolean;
  onClick: (contact: Contact) => void;
}

function ContactItem({ contact, selectedChatId, isDark, onClick }: ContactItemProps) {
  const { user } = useAuth();
  
  return (
    <div
      onClick={() => onClick(contact)}
      className={`cursor-pointer px-3 py-2 rounded-md mb-1 flex items-center justify-between transition-colors ${
        selectedChatId === contact.id
          ? 'bg-[#0bf70d] text-black font-semibold'
          : isDark
          ? 'hover:bg-gray-700 text-gray-300'
          : 'hover:bg-gray-100 text-gray-900'
      }`}
    >
      <span className="truncate">{contact.name}</span>
      <small
        className={`capitalize text-xs font-medium ml-2 flex-shrink-0 ${
          selectedChatId === contact.id
            ? 'text-black'
            : isDark ? 'text-green-400' : 'text-green-700'
        }`}
      >
        {contact.type === 'student' 
          ? (user?.role === 'student' ? 'classmate' : 'student')
          : contact.type}
      </small>
    </div>
  );
}
