import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Register from '../Register';
import { authService } from '../../../api/authService/authService';

// Mock authService
vi.mock('../../../api/authService/authService', () => ({
    authService: {
        register: vi.fn(),
    },
}));

// Mock useNavigate from react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Register Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

    it('renders initial form controls correctly', () => {
        renderComponent();

        expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('toggles password visibility when the eye button is clicked', () => {
        renderComponent();

        const passwordInput = screen.getByLabelText(/password/i);
        const toggleBtn = screen.getByRole('button', { name: '👁️' });

        // Initial state: hidden
        expect(passwordInput).toHaveAttribute('type', 'password');

        // Toggle: visible
        fireEvent.click(toggleBtn);
        expect(passwordInput).toHaveAttribute('type', 'text');
        expect(screen.getByRole('button', { name: '🙈' })).toBeInTheDocument();

        // Toggle back: hidden
        fireEvent.click(screen.getByRole('button', { name: '🙈' }));
        expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('submits form successfully and redirects to /login after delay', async () => {
        vi.mocked(authService.register).mockResolvedValueOnce({
            id: '123',
            username: 'john_doe',
            email: 'john@example.com',
        });

        renderComponent();

        // Fill in inputs
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'john_doe' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        // Submit form
        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        // Verify service call with correct payload
        expect(authService.register).toHaveBeenCalledWith({
            username: 'john_doe',
            email: 'john@example.com',
            password: 'password123',
        });

        // Check success alert
        expect(await screen.findByText(/account created! redirecting to login/i)).toBeInTheDocument();

        // Fast-forward navigation delay
        await waitFor(
            () => {
                expect(mockNavigate).toHaveBeenCalledWith('/login');
            },
            { timeout: 2000 }
        );
    });

    it('displays API error message on registration failure', async () => {
        vi.mocked(authService.register).mockRejectedValueOnce({
            response: { data: { error: 'Username already taken' } },
        });

        renderComponent();

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'existing_user' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'existing@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText('Username already taken')).toBeInTheDocument();
    });

    it('displays fallback error message if API error response is missing', async () => {
        vi.mocked(authService.register).mockRejectedValueOnce(new Error('Network Error'));

        renderComponent();

        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'john_doe' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /create account/i }));

        expect(await screen.findByText('Registration failed.')).toBeInTheDocument();
    });
});