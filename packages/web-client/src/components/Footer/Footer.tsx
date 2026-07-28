import { Container } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <Container className="text-center text-muted small">
        © {new Date().getFullYear()} Chat App. All rights reserved.
      </Container>
    </footer>
  );
};

export default Footer;