import { Spinner } from 'react-bootstrap';

interface LoadingProps {
    message?: string;
    fullScreen?: boolean;
}

const Loading = ({
    message = 'Loading...',
    fullScreen = true
}: LoadingProps) => {
    const containerClass = fullScreen
        ? 'd-flex flex-column vh-100 w-100 justify-content-center align-items-center bg-light'
        : 'd-flex flex-column p-4 justify-content-center align-items-center flex-grow-1';

    return (
        <div className={containerClass}>
            <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
            </Spinner>
            {message && <p className="mt-3 text-muted fw-medium">{message}</p>}
        </div>
    );
};

export default Loading;