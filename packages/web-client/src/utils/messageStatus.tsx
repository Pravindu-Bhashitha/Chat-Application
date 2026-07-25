export const MessageStatus = ({ isRead }: { isRead: boolean }) => {
    return (
        <span
            className="ms-1 d-inline-flex align-items-center"
            style={{
                fontSize: '0.85rem',
                color: isRead ? '#34b7f1' : '#8696a0', // WhatsApp Blue vs. Gray
                lineHeight: 1,
            }}
            title={isRead ? 'Read' : 'Sent'}
        >
            {isRead ? '✓✓' : '✓'}
        </span>
    );
};