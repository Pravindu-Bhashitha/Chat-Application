import React, { useRef, useEffect } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { Message, User } from '../../types';
import CustomButton from '../CustomButton/CustomButton';
import { messageService } from '../../api/messageService/messageService';
import { StatusType } from '../../context/SocketContext';
import { getStatusColor } from '../../utils/statusColor';

interface ChatAreaProps {
    selectedUser: User | null;
    currentUserId?: string;
    onlineUserIds: string[];
    messages: Message[];
    inputMessage: string;
    onInputChange: (value: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    presences: Record<string, { status: StatusType; customNote?: string }>;
}

const ChatArea = ({
    selectedUser,
    currentUserId,
    onlineUserIds,
    messages,
    inputMessage,
    onInputChange,
    onSendMessage,
    presences
}: ChatAreaProps) => {
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    const sendMessage = async () => {
        const response = messageService.saveConversation(currentUserId || '', selectedUser.id, inputMessage);
        console.log('Message sent:', response);
    }

    return (
        <div className="d-flex flex-column h-100 bg-light overflow-hidden">
            <div className="bg-white border-bottom p-3 d-flex align-items-center gap-2 shadow-sm flex-shrink-0">
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
                        return (
                            <div
                                key={index}
                                className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}
                            >
                                <div
                                    className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'
                                        }`}
                                    style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                                >
                                    {msg.content}
                                </div>
                                <small className="text-muted mt-1 px-1" style={{ fontSize: '0.7rem' }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </small>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="bg-white border-top p-3 flex-shrink-0">
                <Form onSubmit={onSendMessage}>
                    <InputGroup>
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
                            onClick={sendMessage}
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