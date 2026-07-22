import { ListGroup, Spinner, Alert } from 'react-bootstrap';
import { User } from '../../types';
import UserCard from '../UserCard/UserCard';

interface UserListProps {
    users: User[];
    currentUserId?: string;
    selectedUserId?: string;
    onlineUserIds: string[];
    loading: boolean;
    error: string;
    onSelectUser: (user: User) => void;
}

const UserList = ({
    users,
    currentUserId,
    selectedUserId,
    onlineUserIds,
    loading,
    error,
    onSelectUser,
}: UserListProps) => {
    if (loading) {
        return (
            <div className="text-center p-4">
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-3">
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    const otherUsers = users.filter((u) => u.id !== currentUserId);

    return (
        <div className="border-end bg-white d-flex flex-column h-100 overflow-hidden">
            <div className="p-3 text-uppercase text-muted fw-bold small border-bottom bg-light">
                Users Directory ({otherUsers.length})
            </div>
            <div className="flex-grow-1 overflow-auto">
                <ListGroup variant="flush">
                    {otherUsers.map((user) => {
                        const isOnline = onlineUserIds.includes(user.id);
                        const isSelected = selectedUserId === user.id;

                        return (
                            <div
                                key={user.id}
                                style={{
                                    backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                                    borderLeft: isSelected ? '4px solid #0284c7' : '4px solid transparent',
                                    cursor: 'pointer',
                                }}
                            >
                                <UserCard
                                    username={user.username}
                                    email={user.email}
                                    isCurrentUser={false}
                                    isOnline={isOnline}
                                    onSelect={() => onSelectUser(user)}
                                />
                            </div>
                        );
                    })}
                </ListGroup>
            </div>
        </div>
    );
};

export default UserList;