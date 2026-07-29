import React, { useRef, useEffect, useState } from 'react';
import { Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Message, User } from '../../types';
import CustomButton from '../CustomButton/CustomButton';
import { StatusType } from '../../context/SocketContext';
import { getStatusColor } from '../../utils/statusColor';
import { MessageStatus } from '../../utils/messageStatus';

interface ChatAreaProps {
    selectedUser: User | null;
    currentUserId?: string;
    onlineUserIds: string[];
    messages: Message[];
    inputMessage: string;
    onInputChange: (value: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    onSendMedia: (file: File) => Promise<void>; 
    presences: Record<string, { status: StatusType; customNote?: string }>;
    onBack: () => void;
}

const ChatArea = ({
    selectedUser,
    currentUserId,
    onlineUserIds,
    messages,
    inputMessage,
    onInputChange,
    onSendMessage,
    presences,
    onBack,
    onSendMedia
}: ChatAreaProps) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await onSendMedia(file);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (!selectedUser) {
        return (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center bg-light text-muted p-4">
                <h5>👈 Select a contact from the sidebar to start chatting</h5>
            </div>
        );
    }

    const isOnline = onlineUserIds.includes(selectedUser.id);
    const status = presences[selectedUser.id]?.status || 'Offline';
    const activeChatMessages = messages.filter(
        (msg) =>
            (msg.senderId === currentUserId && msg.receiverId === selectedUser.id) ||
            (msg.senderId === selectedUser.id && msg.receiverId === currentUserId)
    );

    return (
    <div className="d-flex flex-column h-100 overflow-hidden bg-white">
      {/* Active Conversation Header */}
      <div className="border-bottom px-4 py-3 d-flex align-items-center justify-content-between bg-white shadow-sm z-1">
        <div className="d-flex align-items-center gap-3">
          {onBack && (
            <Button
              variant="light"
              size="sm"
              className="d-md-none text-secondary p-1 rounded-circle border-0 shadow-none"
              onClick={onBack}
            >
              ←
            </Button>
          )}

          {/* User Avatar */}
          <div className="position-relative">
            <div
              className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-sm"
              style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              }}
            >
              {selectedUser.username.charAt(0).toUpperCase()}
            </div>
            <span
              className="position-absolute bottom-0 end-0 rounded-circle border border-2 border-white"
              style={{
                width: 12,
                height: 12,
                backgroundColor: getStatusColor(status),
              }}
            />
          </div>

          <div>
            <h6 className="m-0 fw-bold text-dark">{selectedUser.username}</h6>
            <span className="text-secondary small">
              {isOnline ? status : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-grow-1 p-4 overflow-auto d-flex flex-column gap-3"
        style={{
          backgroundColor: '#f8fafc',
          backgroundImage:
            'radial-gradient(rgba(203, 213, 225, 0.4) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      >
        {activeChatMessages.length === 0 ? (
          <div className="text-center my-auto py-5">
            <div
              className="rounded-circle bg-white shadow-sm d-inline-flex p-3 mb-2"
              style={{ fontSize: '1.5rem' }}
            >
              👋
            </div>
            <p className="text-muted small m-0">
              No messages yet. Say hello to <strong>{selectedUser.username}</strong>!
            </p>
          </div>
        ) : (
          activeChatMessages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            const isImage =
              msg.type === 'IMAGE' ||
              (!!msg.mediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.mediaUrl));
            const isFile = msg.type === 'FILE' || (!!msg.mediaUrl && !isImage);

            return (
              <div
                key={msg.id || index}
                className={`d-flex flex-column ${
                  isMe ? 'align-items-end' : 'align-items-start'
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-4 shadow-sm ${
                    isMe
                      ? 'text-white'
                      : 'bg-white text-dark border border-light-subtle'
                  }`}
                  style={{
                    maxWidth: '70%',
                    wordBreak: 'break-word',
                    background: isMe
                      ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                      : '#ffffff',
                    borderBottomRightRadius: isMe ? '4px' : '16px',
                    borderBottomLeftRadius: isMe ? '16px' : '4px',
                  }}
                >
                  {/* Image Attachment */}
                  {isImage && msg.mediaUrl && (
                    <div className="mb-2">
                      <img
                        src={msg.mediaUrl}
                        alt={msg.content || 'Attached Image'}
                        className="img-fluid rounded-3 border"
                        style={{
                          maxHeight: '220px',
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(msg.mediaUrl, '_blank')}
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* File Attachment */}
                  {isFile && msg.mediaUrl && (
                    <div className="mb-2">
                      <a
                        href={msg.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`d-flex align-items-center gap-2 p-2 rounded-3 text-decoration-none small ${
                          isMe
                            ? 'bg-white bg-opacity-20 text-white'
                            : 'bg-light text-dark border'
                        }`}
                      >
                        📎{' '}
                        <span className="fw-semibold text-truncate">
                          {msg.content || 'Download Attachment'}
                        </span>
                      </a>
                    </div>
                  )}

                  {/* Text Content */}
                  {!isImage && !isFile && <div>{msg.content}</div>}

                  {/* Timestamp & Status */}
                  <div
                    className={`d-flex align-items-center justify-content-end gap-1 mt-1 ${
                      isMe ? 'text-white-50' : 'text-muted'
                    }`}
                    style={{ fontSize: '0.65rem' }}
                  >
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && <MessageStatus isRead={msg.isRead} />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Area */}
      <div className="p-3 bg-white border-top">
        <Form onSubmit={onSendMessage}>
          <InputGroup className="bg-light rounded-pill p-1 border">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* Media Upload Button */}
            <Button
              variant="light"
              className="rounded-circle border-0 text-secondary d-flex align-items-center justify-content-center shadow-none ms-1"
              style={{ width: 38, height: 38 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                '📎'
              )}
            </Button>

            {/* Input Field */}
            <Form.Control
              type="text"
              placeholder={`Message ${selectedUser.username}...`}
              value={inputMessage}
              onChange={(e) => onInputChange(e.target.value)}
              className="border-0 bg-transparent shadow-none px-3"
              style={{ fontSize: '0.9rem' }}
            />

            {/* Send Button */}
            <CustomButton
              type="submit"
              className="rounded-pill px-4 border-0 fw-semibold shadow-sm"
              loading={false}
            >
              Send
            </CustomButton>
          </InputGroup>
        </Form>
      </div>
    </div>
  );
};

export default ChatArea;