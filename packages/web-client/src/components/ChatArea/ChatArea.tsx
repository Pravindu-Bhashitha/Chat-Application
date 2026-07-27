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
        <div className="d-flex flex-column h-100 bg-light overflow-hidden">
            <div className="bg-white border-bottom p-3 d-flex align-items-center gap-2 shadow-sm flex-shrink-0">
                {onBack && (
                    <Button
                        variant="link"
                        className="d-md-none text-dark p-0 me-2 shadow-none text-decoration-none fs-4"
                        onClick={onBack}
                    >
                        ←
                    </Button>
                )}
                <span
                    style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(status),
                    }}
                />
                <h5 className="m-0 fw-bold">{selectedUser.username}</h5>
                <span className="text-muted small">({isOnline ? status : 'Offline'})</span>
            </div>
            <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3">
                {activeChatMessages.length === 0 ? (
                    <div className="text-center text-muted my-auto">
                        No messages yet. Say 👋 hello to {selectedUser.username}!
                    </div>
                ) : (
                    activeChatMessages.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        const isImage =
                            msg.type === 'IMAGE' ||
                            (!!msg.mediaUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.mediaUrl));
                        console.log('Rendering message:', msg, 'isMe:', isMe, 'isImage:', isImage);
                        const isFile =
                            msg.type === 'FILE' ||
                            (!!msg.mediaUrl && !isImage);
                        return (
                            <div
                                key={msg.id || index}
                                className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'
                                    }`}
                            >
                                <div
                                    className={`px-3 py-2 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark border'
                                        }`}
                                    style={{
                                        maxWidth: '70%',
                                        wordBreak: 'break-word',
                                        position: 'relative',
                                    }}
                                >
                                    {/* Render Media */}
                                    {isImage && msg.mediaUrl && (
                                        <div className="mb-2">
                                            <img
                                                src={msg.mediaUrl}
                                                alt={msg.content || 'Attached Image'}
                                                className="img-fluid rounded border"
                                                style={{
                                                    maxHeight: '250px',
                                                    objectFit: 'cover',
                                                    cursor: 'pointer',
                                                    aspectRatio: '16/9',
                                                }}
                                                onClick={() => window.open(msg.mediaUrl, '_blank')}
                                                loading='lazy'
                                            />
                                        </div>
                                    )}
                                    {isFile && msg.mediaUrl && (
                                        <div className="mb-2">
                                            <a
                                                href={msg.mediaUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`d-flex align-items-center gap-2 p-2 rounded text-decoration-none ${isMe
                                                    ? 'bg-white text-primary'
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
                                    {(!isImage && !isFile) && (
                                        <div>{msg.content}</div>
                                    )}
                                    <div
                                        className={`d-flex align-items-center justify-content-end gap-1 mt-1 ${isMe ? 'text-white-50' : 'text-muted'
                                            }`}
                                        style={{ fontSize: '0.68rem' }}
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
            <div className="bg-white border-top p-3 flex-shrink-0">
                <Form onSubmit={onSendMessage}>
                    <InputGroup>
                        {/* Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />

                        {/* Attachment Button */}
                        <Button
                            variant="outline-secondary"
                            className="rounded-start-pill border-end-0 shadow-none px-3"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            {uploading ? <Spinner animation="border" size="sm" /> : '📎'}
                        </Button>
                        <Form.Control
                            type="text"
                            placeholder={`Message ${selectedUser.username}...`}
                            value={inputMessage}
                            onChange={(e) => onInputChange(e.target.value)}
                            className="rounded-start-pill border-end-0 shadow-none"
                        />
                        <CustomButton
                            type="submit"
                            className="rounded-end-pill px-4"
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