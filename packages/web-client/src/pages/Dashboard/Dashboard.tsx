import { useState, useEffect, useRef } from 'react';
import { Container, Card, ListGroup, Badge, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.tsx/Header';
import UserCard from '../../components/UserCard/UserCard';
import Footer from '../../components/Footer/Footer';
import { authService } from '../../api/authService/authService';
import { useSocket } from '../../context/SocketContext';
import { Message } from '../../types';

interface User {
  id: string;
  username: string;
  email: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { socket, onlineUserIds, fetchOnlineUsers } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  console.log("onlineUserIds", onlineUserIds);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
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

  // Filter messages between current user & selected user
  const activeChatMessages = messages.filter(
    (msg) =>
      (msg.senderId === currentUser?.id && msg.receiverId === selectedUser?.id) ||
      (msg.senderId === selectedUser?.id && msg.receiverId === currentUser?.id)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // <div className="d-flex flex-column" style={{ backgroundColor: '#eef2f7', minHeight: '100vh' }}>
    //   <Header username={currentUser?.username} onLogout={handleLogout} />
    //   <Container style={{ maxWidth: '800px' }} className="my-auto">
    //     <Card className="auth-card p-3 mb-4">
    //       <Card.Body>
    //         <div className="d-flex justify-content-between align-items-center mb-3">
    //           <div>
    //             <h4 className="fw-bold mb-1" style={{ color: '#0284c7' }}>
    //               User Directory
    //             </h4>
    //             <p className="text-muted small mb-0">
    //               Real-time active status monitoring
    //             </p>
    //           </div>
    //           <Badge bg="info" className="fs-6 px-3 py-2 text-wrap">
    //             {users.length} Users
    //           </Badge>
    //         </div>

    //         {error && <Alert variant="danger">{error}</Alert>}

    //         {loading ? (
    //           <div className="text-center py-5">
    //             <Spinner animation="border" variant="primary" />
    //             <p className="text-muted mt-2">Fetching users...</p>
    //           </div>
    //         ) : (
    //           <ListGroup variant="flush" className="border rounded-3 overflow-hidden">
    //             {users.map((user) => (
    //               <UserCard
    //                 key={user.id}
    //                 username={user.username}
    //                 email={user.email}
    //                 // isCurrentUser={(currentUser?.id || (currentUser as any)?.userId) === user.id}
    //                 isCurrentUser={(currentUser?.id === user.id)}
    //                 isOnline={onlineUserIds.includes(user.id)}
    //               />
    //             ))}
    //           </ListGroup>
    //         )}
    //       </Card.Body>
    //     </Card>
    //   </Container>
    //   <Footer />
    // </div>
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8' }}>
      
      {/* SIDEBAR: User List */}
      <div style={{ width: '320px', borderRight: '1px solid #e0e0e0', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>💬 Chat Room</h3>
            <span style={{ fontSize: '12px', color: '#666' }}>Logged in as <b>{currentUser?.username}</b></span>
          </div>
          <button onClick={handleLogout} style={{ padding: '6px 12px', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '12px', fontSize: '12px', fontWeight: 'bold', color: '#888' }}>
            USERS DIRECTORY ({users.length - 1})
          </div>
          {loading && <p style={{ padding: '16px' }}>Loading users...</p>}
          {error && <p style={{ padding: '16px', color: 'red' }}>{error}</p>}

          {users
            .filter((u) => u.id !== currentUser?.id) // Hide logged in user from recipient list
            .map((u) => {
              const isOnline = onlineUserIds.includes(u.id);
              const isSelected = selectedUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#e6f7ff' : 'transparent',
                    borderLeft: isSelected ? '4px solid #1890ff' : '4px solid transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ position: 'relative', marginRight: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {u.username.substring(0, 2).toUpperCase()}
                    </div>
                    {/* Status Indicator Dot */}
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isOnline ? '#52c41a' : '#d9d9d9',
                        border: '2px solid #fff',
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{u.username}</div>
                    <div style={{ fontSize: '12px', color: isOnline ? '#52c41a' : '#8c8c8c' }}>
                      {isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* CHAT MAIN AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedUser ? (
          <>
            {/* CHAT HEADER */}
            <div style={{ padding: '16px', backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: onlineUserIds.includes(selectedUser.id) ? '#52c41a' : '#d9d9d9', marginRight: '8px' }} />
              <h3 style={{ margin: 0 }}>{selectedUser.username}</h3>
            </div>

            {/* MESSAGE LIST */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeChatMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', marginTop: '40px' }}>
                  No messages yet. Say hello to {selectedUser.username}! 👋
                </div>
              ) : (
                activeChatMessages.map((msg, index) => {
                  const isMe = msg.senderId === currentUser?.id;
                  return (
                    <div
                      key={index}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '60%',
                      }}
                    >
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '16px 16px 0px 16px' : '16px 16px 16px 0px',
                          backgroundColor: isMe ? '#1890ff' : '#ffffff',
                          color: isMe ? '#ffffff' : '#333333',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          wordBreak: 'break-word',
                        }}
                      >
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '10px', color: '#888', marginTop: '4px', textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* CHAT INPUT FIELD */}
            <form onSubmit={handleSendMessage} style={{ padding: '16px', backgroundColor: '#fff', borderTop: '1px solid #e0e0e0', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message ${selectedUser.username}...`}
                style={{ flex: 1, padding: '12px', borderRadius: '24px', border: '1px solid #ccc', outline: 'none' }}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                style={{
                  padding: '0 24px',
                  borderRadius: '24px',
                  backgroundColor: inputMessage.trim() ? '#1890ff' : '#d9d9d9',
                  color: '#fff',
                  border: 'none',
                  cursor: inputMessage.trim() ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold',
                }}
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            <h3>👈 Select a contact from the sidebar to start chatting</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;