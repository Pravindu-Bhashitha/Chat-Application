// import React, { useRef, useEffect } from 'react';
// import { Form, InputGroup } from 'react-bootstrap';
// import { Message, User } from '../../types';
// import CustomButton from '../CustomButton/CustomButton';
// import { messageService } from '../../api/messageService/messageService';
// import { StatusType } from '../../context/SocketContext';
// import { getStatusColor } from '../../utils/statusColor';

// interface ChatAreaProps {
//     selectedUser: User | null;
//     currentUserId?: string;
//     onlineUserIds: string[];
//     messages: Message[];
//     inputMessage: string;
//     onInputChange: (value: string) => void;
//     onSendMessage: (e: React.FormEvent) => void;
//     presences: Record<string, { status: StatusType; customNote?: string }>;
// }

// const ChatArea = ({
//     selectedUser,
//     currentUserId,
//     onlineUserIds,
//     messages,
//     inputMessage,
//     onInputChange,
//     onSendMessage,
//     presences
// }: ChatAreaProps) => {
//     const messagesEndRef = useRef<HTMLDivElement | null>(null);

//     useEffect(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     if (!selectedUser) {
//         return (
//             <div className="d-flex flex-grow-1 align-items-center justify-content-center bg-light text-muted p-4">
//                 <h5>👈 Select a contact from the sidebar to start chatting</h5>
//             </div>
//         );
//     }

//     const isOnline = onlineUserIds.includes(selectedUser.id);
//     const status = presences[selectedUser.id]?.status || 'Offline';
//     const activeChatMessages = messages.filter(
//         (msg) =>
//             (msg.senderId === currentUserId && msg.receiverId === selectedUser.id) ||
//             (msg.senderId === selectedUser.id && msg.receiverId === currentUserId)
//     );

//     const sendMessage = async () => {
//         const response = messageService.saveConversation(currentUserId || '', selectedUser.id, inputMessage);
//         console.log('Message sent:', response);
//     }

//     return (
//         <div className="d-flex flex-column h-100 bg-light overflow-hidden">
//             <div className="bg-white border-bottom p-3 d-flex align-items-center gap-2 shadow-sm flex-shrink-0">
//                 <span
//                     style={{
//                         width: '10px',
//                         height: '10px',
//                         borderRadius: '50%',
//                         backgroundColor: getStatusColor(status),
//                     }}
//                 />
//                 <h5 className="m-0 fw-bold">{selectedUser.username}</h5>
//                 <span className="text-muted small">({isOnline ? status : 'Offline'})</span>
//             </div>
//             <div className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3">
//                 {activeChatMessages.length === 0 ? (
//                     <div className="text-center text-muted my-auto">
//                         No messages yet. Say 👋 hello to {selectedUser.username}!
//                     </div>
//                 ) : (
//                     activeChatMessages.map((msg, index) => {
//                         const isMe = msg.senderId === currentUserId;
//                         return (
//                             <div
//                                 key={index}
//                                 className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'}`}
//                             >
//                                 <div
//                                     className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'
//                                         }`}
//                                     style={{ maxWidth: '70%', wordBreak: 'break-word' }}
//                                 >
//                                     {msg.content}
//                                 </div>
//                                 <small className="text-muted mt-1 px-1" style={{ fontSize: '0.7rem' }}>
//                                     {new Date(msg.timestamp).toLocaleTimeString([], {
//                                         hour: '2-digit',
//                                         minute: '2-digit',
//                                     })}
//                                 </small>
//                             </div>
//                         );
//                     })
//                 )}
//                 <div ref={messagesEndRef} />
//             </div>
//             <div className="bg-white border-top p-3 flex-shrink-0">
//                 <Form onSubmit={onSendMessage}>
//                     <InputGroup>
//                         <Form.Control
//                             type="text"
//                             placeholder={`Message ${selectedUser.username}...`}
//                             value={inputMessage}
//                             onChange={(e) => onInputChange(e.target.value)}
//                             className="rounded-start-pill border-end-0 shadow-none"
//                         />
//                         <CustomButton
//                             type="submit"
//                             className="rounded-end-pill px-4"
//                             loading={false}
//                             onClick={sendMessage}
//                         >
//                             Send
//                         </CustomButton>
//                     </InputGroup>
//                 </Form>
//             </div>
//         </div>
//     );
// };

// export default ChatArea;
// import React, { useRef, useEffect, useState } from 'react';
// import { Form, InputGroup, Button, Spinner } from 'react-bootstrap';
// import { Message, User } from '../../types';
// import CustomButton from '../CustomButton/CustomButton';
// import { StatusType } from '../../context/SocketContext';
// import { getStatusColor } from '../../utils/statusColor';
// import { messageService } from '../../api/messageService/messageService';

// interface ChatAreaProps {
//     selectedUser: User | null;
//     currentUserId?: string;
//     onlineUserIds: string[];
//     messages: Message[];
//     inputMessage: string;
//     onInputChange: (value: string) => void;
//     onSendMessage: (e: React.FormEvent) => void;
//     presences: Record<string, { status: StatusType; customNote?: string }>;
//     onBack?: () => void;
//     onLoadOlderMessages?: (oldestMessageId: string) => Promise<boolean>;
// }

// const ChatArea = ({
//     selectedUser,
//     currentUserId,
//     onlineUserIds,
//     messages,
//     inputMessage,
//     onInputChange,
//     onSendMessage,
//     presences,
//     onBack,
//     onLoadOlderMessages
// }: ChatAreaProps) => {
//     // 1. Declare ALL hooks first at the top level
//     const scrollContainerRef = useRef<HTMLDivElement | null>(null);
//     const messagesEndRef = useRef<HTMLDivElement | null>(null);

//     const [loadingOlder, setLoadingOlder] = useState(false);
//     const [hasMore, setHasMore] = useState(true);
//     const isInitialLoad = useRef(true);

//     // Safe filtering even if selectedUser is null
//     const activeChatMessages = selectedUser
//         ? messages.filter(
//             (msg) =>
//                 (msg.senderId === currentUserId && msg.receiverId === selectedUser.id) ||
//                 (msg.senderId === selectedUser.id && msg.receiverId === currentUserId)
//         )
//         : [];

//     // Hook 1: Reset state on user switch
//     useEffect(() => {
//         if (!selectedUser) return;
//         setHasMore(true);
//         isInitialLoad.current = true;
//     }, [selectedUser?.id]);

//     // Hook 2: Scroll management
//     useEffect(() => {
//         if (!selectedUser) return;

//         if (isInitialLoad.current && activeChatMessages.length > 0) {
//             messagesEndRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
//             isInitialLoad.current = false;
//         } else if (!isInitialLoad.current) {
//             messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//         }
//     }, [activeChatMessages.length, selectedUser]);



//     // Handle pagination on scroll
//     const handleScroll = async () => {
//         const container = scrollContainerRef.current;
//         if (
//             !container ||
//             loadingOlder ||
//             !hasMore ||
//             !onLoadOlderMessages ||
//             activeChatMessages.length === 0
//         ) {
//             return;
//         }

//         if (container.scrollTop <= 5) {
//             setLoadingOlder(true);

//             const oldestMessage = activeChatMessages[0];
//             const previousScrollHeight = container.scrollHeight;

//             try {
//                 const moreAvailable = await onLoadOlderMessages(oldestMessage.id);
//                 setHasMore(moreAvailable);

//                 requestAnimationFrame(() => {
//                     if (scrollContainerRef.current) {
//                         const newScrollHeight = scrollContainerRef.current.scrollHeight;
//                         scrollContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight;
//                     }
//                 });
//             } catch (err) {
//                 console.error('Failed to load older messages:', err);
//             } finally {
//                 setLoadingOlder(false);
//             }
//         }
//     };

//     // 2. Early return MUST come AFTER all hook definitions!
//     if (!selectedUser) {
//         return (
//             <div className="d-flex flex-grow-1 align-items-center justify-content-center bg-light text-muted p-4 h-100">
//                 <h5>👈 Select a contact from the sidebar to start chatting</h5>
//             </div>
//         );
//     }

//     const isOnline = onlineUserIds.includes(selectedUser.id);
//     const status = presences[selectedUser.id]?.status || 'Offline';

//     const sendMessage = async () => {
//         const response = messageService.saveConversation(currentUserId || '', selectedUser.id, inputMessage);
//         console.log('Message sent:', response);
//     }


//     return (
//         <div className="d-flex flex-column h-100 bg-light overflow-hidden">
//             {/* Top Header */}
//             <div className="bg-white border-bottom p-3 d-flex align-items-center gap-2 shadow-sm flex-shrink-0">
//                 {onBack && (
//                     <Button
//                         variant="link"
//                         className="d-md-none text-dark p-0 me-2 shadow-none text-decoration-none fs-4"
//                         onClick={onBack}
//                     >
//                         ←
//                     </Button>
//                 )}
//                 <span
//                     style={{
//                         width: '10px',
//                         height: '10px',
//                         borderRadius: '50%',
//                         backgroundColor: getStatusColor(status),
//                     }}
//                 />
//                 <h5 className="m-0 fw-bold">{selectedUser.username}</h5>
//                 <span className="text-muted small">({isOnline ? status : 'Offline'})</span>
//             </div>

//             {/* Scrollable Message Area */}
//             <div
//                 ref={scrollContainerRef}
//                 onScroll={handleScroll}
//                 className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3"
//             >
//                 {loadingOlder && (
//                     <div className="text-center my-2">
//                         <Spinner animation="border" size="sm" variant="secondary" />
//                     </div>
//                 )}

//                 {activeChatMessages.length === 0 ? (
//                     <div className="text-center text-muted my-auto">
//                         No messages yet. Say 👋 hello to {selectedUser.username}!
//                     </div>
//                 ) : (
//                     activeChatMessages.map((msg, index) => {
//                         const isMe = msg.senderId === currentUserId;
//                         return (
//                             <div
//                                 key={msg.id || index}
//                                 className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'
//                                     }`}
//                             >
//                                 <div
//                                     className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'
//                                         }`}
//                                     style={{ maxWidth: '70%', wordBreak: 'break-word' }}
//                                 >
//                                     {msg.content}
//                                 </div>
//                                 <small
//                                     className="text-muted mt-1 px-1"
//                                     style={{ fontSize: '0.7rem' }}
//                                 >
//                                     {new Date(msg.timestamp).toLocaleTimeString([], {
//                                         hour: '2-digit',
//                                         minute: '2-digit',
//                                     })}
//                                 </small>
//                             </div>
//                         );
//                     })
//                 )}
//                 <div ref={messagesEndRef} />
//             </div>

//             {/* Input Footer */}
//             <div className="bg-white border-top p-3 flex-shrink-0">
//                 <Form onSubmit={onSendMessage}>
//                     <InputGroup>
//                         <Form.Control
//                             type="text"
//                             placeholder={`Message ${selectedUser.username}...`}
//                             value={inputMessage}
//                             onChange={(e) => onInputChange(e.target.value)}
//                             className="rounded-start-pill border-end-0 shadow-none"
//                         />
//                         <CustomButton
//                             type="submit"
//                             className="rounded-end-pill px-4"
//                             loading={false}
//                             onClick={sendMessage}
//                         >
//                             Send
//                         </CustomButton>
//                     </InputGroup>
//                 </Form>
//             </div>
//         </div>
//     );
// };

// export default ChatArea;
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import { Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Message, User } from '../../types';
import CustomButton from '../CustomButton/CustomButton';
import { StatusType } from '../../context/SocketContext';
import { getStatusColor } from '../../utils/statusColor';
import { messageService } from '../../api/messageService/messageService';

interface ChatAreaProps {
    selectedUser: User | null;
    currentUserId?: string;
    onlineUserIds: string[];
    messages: Message[];
    inputMessage: string;
    onInputChange: (value: string) => void;
    onSendMessage: (e: React.FormEvent) => void;
    presences: Record<string, { status: StatusType; customNote?: string }>;
    onBack?: () => void;
    onLoadOlderMessages?: (oldestMessageId: string) => Promise<boolean>;
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
    onLoadOlderMessages
}: ChatAreaProps) => {
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const [loadingOlder, setLoadingOlder] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const isInitialLoad = useRef(true);
    const previousScrollHeightRef = useRef<number>(0);

    // Filter active chat messages safely
    const activeChatMessages = selectedUser
        ? messages.filter(
            (msg) =>
                (msg.senderId === currentUserId && msg.receiverId === selectedUser.id) ||
                (msg.senderId === selectedUser.id && msg.receiverId === currentUserId)
        )
        : [];

    // Reset pagination flags when changing active chat user
    useEffect(() => {
        if (!selectedUser) return;
        setHasMore(true);
        isInitialLoad.current = true;
    }, [selectedUser?.id]);

    // Handle initial scroll positioning on user select or new outgoing message
    useEffect(() => {
        if (!selectedUser) return;

        if (isInitialLoad.current && activeChatMessages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
            isInitialLoad.current = false;
        } else if (!isInitialLoad.current && !loadingOlder) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [activeChatMessages.length, selectedUser, loadingOlder]);

    // Preserve scroll offset after loading prepended older messages
    useLayoutEffect(() => {
        if (previousScrollHeightRef.current > 0 && scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeightRef.current;
            previousScrollHeightRef.current = 0; // Reset after adjustment
        }
    }, [activeChatMessages.length]);

    // Scroll listener for top threshold reaching
    const handleScroll = async () => {
        const container = scrollContainerRef.current;
        if (
            !container ||
            loadingOlder ||
            !hasMore ||
            !onLoadOlderMessages ||
            activeChatMessages.length === 0
        ) {
            return;
        }

        // Trigger fetch when user reaches near top (5px margin)
        if (container.scrollTop <= 5) {
            setLoadingOlder(true);
            const oldestMessage = activeChatMessages[0];
            previousScrollHeightRef.current = container.scrollHeight;

            try {
                const moreAvailable = await onLoadOlderMessages(oldestMessage.id);
                setHasMore(moreAvailable);
            } catch (err) {
                console.error('Failed to load older messages:', err);
                previousScrollHeightRef.current = 0;
            } finally {
                setLoadingOlder(false);
            }
        }
    };

    if (!selectedUser) {
        return (
            <div className="d-flex flex-grow-1 align-items-center justify-content-center bg-light text-muted p-4 h-100">
                <h5>👈 Select a contact from the sidebar to start chatting</h5>
            </div>
        );
    }

    const isOnline = onlineUserIds.includes(selectedUser.id);
    const status = presences[selectedUser.id]?.status || 'Offline';

    const sendMessage = async () => {
        const response = messageService.saveConversation(currentUserId || '', selectedUser.id, inputMessage);
        console.log('Message sent:', response);
    }

    return (
        <div className="d-flex flex-column h-100 bg-light overflow-hidden">
            {/* Top Header */}
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

            {/* Scrollable Message Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-grow-1 p-3 overflow-auto d-flex flex-column gap-3"
            >
                {loadingOlder && (
                    <div className="text-center my-2">
                        <Spinner animation="border" size="sm" variant="secondary" />
                    </div>
                )}

                {activeChatMessages.length === 0 ? (
                    <div className="text-center text-muted my-auto">
                        No messages yet. Say 👋 hello to {selectedUser.username}!
                    </div>
                ) : (
                    activeChatMessages.map((msg, index) => {
                        const isMe = msg.senderId === currentUserId;
                        return (
                            <div
                                key={msg.id || index}
                                className={`d-flex flex-column ${isMe ? 'align-items-end' : 'align-items-start'
                                    }`}
                            >
                                <div
                                    className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : 'bg-white text-dark'
                                        }`}
                                    style={{ maxWidth: '70%', wordBreak: 'break-word' }}
                                >
                                    {msg.content}
                                </div>
                                <small
                                    className="text-muted mt-1 px-1"
                                    style={{ fontSize: '0.7rem' }}
                                >
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

            {/* Input Footer */}
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