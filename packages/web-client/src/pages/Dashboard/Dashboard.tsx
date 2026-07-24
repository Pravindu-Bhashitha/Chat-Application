import { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.tsx/Header';
import Footer from '../../components/Footer/Footer';
import { authService } from '../../api/authService/authService';
import { useSocket } from '../../context/SocketContext';
import { Message } from '../../types';
import UserList from '../../components/UserList/UserList';
import ChatArea from '../../components/ChatArea/ChatArea';
import { messageService } from '../../api/messageService/messageService';
import { useAuth } from '../../context/AuthContext';

interface User {
  id: string;
  username: string;
  email: string;
}

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
          authService.getUsers(),
          messageService.getRecentConversations()
        ]);

        setUsers(allUsers);

        // Map targetUserId -> latest Message preview
        const lastMsgMap: Record<string, Message> = {};
        recentMsgs.forEach((msg: Message) => {
          const otherUserId = msg.senderId === currentUser.id ? msg.receiverId : msg.senderId;
          lastMsgMap[otherUserId] = msg;
        });

        setLastMessages(lastMsgMap);
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

  // 4. Fetch Selected User Chat History
  useEffect(() => {
    if (!selectedUser) return;

    const fetchChatHistory = async () => {
      try {
        const history = await messageService.getConversation(selectedUser.id);
        if (history) {
          setMessages(history);
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
    };

    fetchChatHistory();
  }, [selectedUser]);

  // 5. Real-Time Incoming Message Listener (Updates Active Chat + Previews Live)
  useEffect(() => {
    if (!socket || !currentUser?.id) return;

    const handleReceiveMessage = (newMessage: Message) => {
      // Append to active chat if sender/receiver matches selected user
      setMessages((prev) => [...prev, newMessage]);

      // Dynamically update the lastMessage preview for sidebar
      const otherUserId = newMessage.senderId === currentUser.id 
        ? newMessage.receiverId 
        : newMessage.senderId;

      setLastMessages((prev) => ({
        ...prev,
        [otherUserId]: newMessage,
      }));
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, currentUser]);

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


  const handleLogout = () => {
    disconnectSocket();
    logoutUser();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (

    <div className="d-flex flex-column vh-100 bg-light">
      <Header username={currentUser?.username} onLogout={handleLogout} />

      <Container fluid className="flex-grow-1 d-flex flex-column pb-3 overflow-hidden">
        <Row className="flex-grow-1 g-0 shadow-sm rounded border bg-white overflow-hidden">
          {/* User Directory Sidebar */}
          <Col
            xs={12}
            md={4}
            lg={3}
            className={`d-flex flex-column h-100 border-end ${selectedUser ? 'd-none d-md-flex' : 'd-flex'
              }`}
          >
            <UserList
              users={users}
              currentUserId={currentUser?.id}
              selectedUserId={selectedUser?.id}
              onlineUserIds={onlineUserIds}
              lastMessages={lastMessages}
              loading={loading}
              error={error}
              onSelectUser={(user) => setSelectedUser(user)}
              presences={presences}
            />
          </Col>

          {/* Active Chat Window */}
          <Col
            xs={12}
            md={8}
            lg={9}
            className={`d-flex flex-column h-100 ${!selectedUser ? 'd-none d-md-flex' : 'd-flex'
              }`}
          >
            <ChatArea
              selectedUser={selectedUser}
              currentUserId={currentUser?.id}
              onlineUserIds={onlineUserIds}
              messages={messages}
              inputMessage={inputMessage}
              onInputChange={setInputMessage}
              onSendMessage={handleSendMessage}
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