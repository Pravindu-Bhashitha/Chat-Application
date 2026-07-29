import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.tsx/Header';
import Footer from '../../components/Footer/Footer';
import { userService } from '../../api/userService/userService';
import { useSocket } from '../../context/SocketContext';
import { Message, User } from '../../types';
import UserList from '../../components/UserList/UserList';
import ChatArea from '../../components/ChatArea/ChatArea';
import { messageService } from '../../api/messageService/messageService';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { socket, onlineUserIds, presences, fetchOnlineUsers, disconnectSocket } = useSocket();
  const { logoutUser } = useAuth();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  console.log('Last messages state:', lastMessages);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  console.log('Unread counts state:', unreadCounts);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 1. Initial Authentication & User Hydration
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setCurrentUser(JSON.parse(savedUser));
  }, [navigate]);

  // 2. Load User Directory & Recent Conversations in Parallel (Single Batch Load)
  useEffect(() => {
    if (!currentUser?.id) return;

    const loadInitialDashboardData = async () => {
      try {
        setLoading(true);

        const [allUsers, recentMsgs] = await Promise.all([
          userService.getUsers(),
          messageService.getRecentConversations()
        ]);

        setUsers(allUsers);

        const lastMsgMap: Record<string, Message> = {};
        const unreadMap: Record<string, number> = {};

        recentMsgs.forEach((msg: Message & { unreadCount?: number }) => {
          const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
          lastMsgMap[otherUserId] = msg;

          if (!msg.isRead && msg.senderId !== currentUser.id) {
            unreadMap[otherUserId] = (unreadMap[otherUserId] || 0) + 1;
          }
        });

        setLastMessages(lastMsgMap);
        setUnreadCounts(unreadMap);
      } catch (err) {
        setError('Failed to load user directory or message previews.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialDashboardData();
  }, [currentUser]);

  // 3. Sync Online User Status
  useEffect(() => {
    if (socket) {
      fetchOnlineUsers();
    }
  }, [socket, fetchOnlineUsers]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchChatHistory = async () => {
      try {
        const history = await messageService.getConversation(selectedUser.id);
        console.log('Fetched chat history:', history);
        if (history) {
          setMessages(history);
        }

        await messageService.markAsRead(selectedUser.id);

        if (socket) {
          socket.emit('mark_as_read', { senderId: selectedUser.id });
        }

        setUnreadCounts((prev) => ({
          ...prev,
          [selectedUser.id]: 0,
        }));
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
    };

    fetchChatHistory();
  }, [selectedUser, socket]);

  // 5. Real-Time Incoming Message Listener
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    const handleReceiveMessage = (newMessage: Message) => {
      const isIncomingFromSelectedUser =
        selectedUser && newMessage.senderId === selectedUser.id;

      if (isIncomingFromSelectedUser) {
        setMessages((prev) => [...prev, { ...newMessage, isRead: true }]);

        messageService.markAsRead(selectedUser.id).catch(console.error);
        socket.emit('mark_as_read', { senderId: selectedUser.id });
      } else if (
        selectedUser &&
        newMessage.senderId === currentUser.id &&
        newMessage.receiverId === selectedUser.id
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }

      const otherUserId =
        newMessage.senderId === currentUser.id
          ? newMessage.receiverId
          : newMessage.senderId;

      setLastMessages((prev) => ({
        ...prev,
        [otherUserId]: newMessage,
      }));

      if (
        newMessage.senderId !== currentUser.id &&
        selectedUser?.id !== newMessage.senderId
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    };

    const handleMessagesRead = ({ readByUserId }: { readByUserId: string }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.receiverId === readByUserId ? { ...msg, isRead: true } : msg
        )
      );
    };

    const handleUserCreated = (newUser: User) => {
      if (newUser.id === currentUser.id) return;

      setUsers((prevUsers) => {
        const exists = prevUsers.some((u) => u.id === newUser.id);
        if (exists) return prevUsers;
        return [...prevUsers, newUser];
      });
    };

    const handleUserUpdated = (updatedUser: Partial<User> & { id: string }) => {
      if (updatedUser.id === currentUser.id) return;

      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u))
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user:created', handleUserCreated);
    socket.on('user:updated', handleUserUpdated);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user:created', handleUserCreated);
      socket.off('user:updated', handleUserUpdated);
    };
  }, [socket, currentUser, selectedUser]);

  // Send Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedUser || !socket) return;

    socket.emit('send_message', {
      receiverId: selectedUser.id,
      content: inputMessage.trim(),
    });

    setInputMessage('');
  };

  const handleSendMedia = async (file: File) => {
    if (!selectedUser || !socket) return;

    try {
      // 1. Upload to backend storage
      const uploadRes = await messageService.uploadMedia(file);

      // 2. Emit over Socket.io
      socket.emit('send_message', {
        receiverId: selectedUser.id,
        content: file.name, // Display filename as content
        type: uploadRes.type,
        mediaUrl: uploadRes.mediaUrl,
      });
    } catch (err) {
      console.error('Failed to upload file:', err);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setUnreadCounts((prev) => ({
      ...prev,
      [user.id]: 0,
    }));
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (!currentUser) throw new Error("No current user");

    const updatedUser = await userService.updateUser(userData);

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);

    return updatedUser;
  };

  const handleLogout = () => {
    disconnectSocket();
    logoutUser();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div
      className="d-flex flex-column vh-100"
      style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <Header
        username={currentUser?.username}
        email={currentUser?.email}
        onLogout={handleLogout}
        onUpdateUser={handleUpdateUser}
      />

      <Container fluid className="flex-grow-1 d-flex flex-column p-2 p-md-3 overflow-hidden">
        <Row className="flex-grow-1 g-0 rounded-4 border-0 shadow-lg overflow-hidden bg-white bg-opacity-75 backdrop-blur">
          {/* User Directory Sidebar */}
          <Col
            xs={12}
            md={4}
            lg={3.5}
            className={`d-flex flex-column h-100 border-end border-light-subtle ${selectedUser ? 'd-none d-md-flex' : 'd-flex'
              }`}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.85)' }}
          >
            <UserList
              users={users}
              currentUserId={currentUser?.id}
              selectedUserId={selectedUser?.id}
              onlineUserIds={onlineUserIds}
              lastMessages={lastMessages}
              loading={loading}
              error={error}
              onSelectUser={handleSelectUser}
              presences={presences}
              unreadCounts={unreadCounts}
            />
          </Col>

          {/* Active Chat Window */}
          <Col
            xs={12}
            md={8}
            lg={8.5}
            className={`d-flex flex-column h-100 ${!selectedUser ? 'd-none d-md-flex' : 'd-flex'
              }`}
            style={{ backgroundColor: '#ffffff' }}
          >
            <ChatArea
              selectedUser={selectedUser}
              currentUserId={currentUser?.id}
              onlineUserIds={onlineUserIds}
              messages={messages}
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSendMessage={handleSendMessage}
              onSendMedia={handleSendMedia}
              presences={presences}
              onBack={() => setSelectedUser(null)}
            />
          </Col>
        </Row>
      </Container>

      <Footer />
    </div>
  );
};

export default Dashboard;