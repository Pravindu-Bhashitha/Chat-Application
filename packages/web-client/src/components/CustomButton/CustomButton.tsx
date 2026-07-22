import React from 'react';
import { Button, Spinner } from 'react-bootstrap';

interface CustomButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

const CustomButton = ({
  children,
  loading = false,
  onClick,
  type = 'button',
  className = '',
}: CustomButtonProps) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`btn-primary-custom ${className}`}
    >
      {loading ? <Spinner animation="border" size="sm" /> : children}
    </Button>
  );
};

export default CustomButton;