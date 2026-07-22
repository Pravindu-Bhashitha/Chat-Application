import { Navbar, Button } from 'react-bootstrap';

interface HeaderProps {
  username?: string;
  onLogout: () => void;
}

const Header = ( { username, onLogout }: HeaderProps ) => {
  return (
    <Navbar bg="white" className="shadow-sm px-4 justify-content-between mb-4">
      <Navbar.Brand className="fw-bold fs-4" style={{ color: '#0284c7' }}>
        💬 Chat App
      </Navbar.Brand>
      <div className="d-flex align-items-center gap-3">
        {username && (
          <span className="text-muted">
            Logged in as <strong style={{ color: '#0284c7' }}>{username}</strong>
          </span>
        )}
        <Button variant="outline-danger" size="sm" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </Navbar>
  );
};

export default Header;