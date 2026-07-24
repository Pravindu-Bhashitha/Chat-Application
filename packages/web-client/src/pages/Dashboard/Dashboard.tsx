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
  // const { socket, onlineUserIds, fetchOnlineUsers } = useSocket();
  const { socket, onlineUserIds, presences, fetchOnlineUsers, disconnectSocket } = useSocket();
  const {logoutUser} = useAuth();
  // console.log("onlineUserIds", onlineUserIds);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const [lastMessages, setLastMessages] = useState<Record<string, Message>>({});
  console.log("users", users);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (!token || !savedUser) {
      navigate('/login');
      return;
    }

    setCurrentUser(JSON.parse(savedUser));

    const fetchUsers = async () => {
      try {
        const data = await authService.getUsers();
        setUsers(data);
      } catch (err: any) {
        setError('Failed to load user directory.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    if (socket) {
      fetchOnlineUsers();
    }
  }, [socket, fetchOnlineUsers]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchChatHistory = async () => {
      try {
        const response = await messageService.getConversation(selectedUser.id);
        if (response) {
          setMessages(response);

          // Update last message preview for the selected user if history exists
          if (response.length > 0) {
            const latest = response[response.length - 1];
            setLastMessages((prev) => ({
              ...prev,
              [selectedUser.id]: latest,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
    };

    fetchChatHistory();
  }, [selectedUser]);

  // Listen for real-time incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMessage: Message) => {
      setMessages((prev) => [...prev, newMessage]);
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket]);

  // useEffect(() => {
  //   if (!selectedUser) return;

  //   const fetchChatHistory = async () => {
  //     try {
  //       const response = await messageService.getConversation(selectedUser.id);

  //       if (response) {
  //         setMessages(response);
  //       }
  //     } catch (err) {
  //       console.error('Failed to load message history:', err);
  //     }
  //   };

  //   fetchChatHistory();
  // }, [selectedUser]);

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
    disconnectSocket(); // Disconnect the socket when logging out
    logoutUser();
    localStorage.removeItem('token');
    console.log('Token removed from localStorage');
    localStorage.removeItem('user');
    console.log('User removed from localStorage');
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