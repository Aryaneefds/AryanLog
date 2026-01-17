import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { Login } from './pages/admin/Login';
import { NotFound } from './pages/NotFound';
import { AuthProvider } from './lib/auth';

describe('Frontend Component Tests', () => {

    describe('Home Page', () => {
        it('renders the main heading', () => {
            render(<App />);
            expect(screen.getByText(/What I'm Thinking About/i)).toBeInTheDocument();
        });

        it('displays the site identifier', () => {
            render(<App />);
            expect(screen.getByText(/personal thinking system/i)).toBeInTheDocument();
        });

        it('shows BY CONCEPT section', () => {
            render(<App />);
            expect(screen.getByText(/By Concept/i)).toBeInTheDocument();
        });

        it('shows RECENT THINKING section', () => {
            render(<App />);
            expect(screen.getByText(/Recent Thinking/i)).toBeInTheDocument();
        });

        it('has navigation links', () => {
            render(<App />);
            expect(screen.getByText(/threads/i)).toBeInTheDocument();
            expect(screen.getByText(/archive/i)).toBeInTheDocument();
        });
    });

    describe('Login Page', () => {
        const renderLogin = () => {
            render(
                <AuthProvider>
                    <BrowserRouter>
                        <Login />
                    </BrowserRouter>
                </AuthProvider>
            );
        };

        it('renders login form elements', () => {
            renderLogin();
            expect(screen.getByRole('heading', { name: 'login' })).toBeInTheDocument();
            expect(screen.getByLabelText('email')).toBeInTheDocument();
            expect(screen.getByLabelText('password')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'login' })).toBeInTheDocument();
        });

        it('has register toggle button', () => {
            renderLogin();
            expect(screen.getByText('first time? register')).toBeInTheDocument();
        });

        it('toggles to register mode on click', () => {
            renderLogin();
            const toggleButton = screen.getByText('first time? register');
            fireEvent.click(toggleButton);

            expect(screen.getByRole('heading', { name: 'register' })).toBeInTheDocument();
            expect(screen.getByLabelText('name')).toBeInTheDocument();
            expect(screen.getByText('have an account? login')).toBeInTheDocument();
        });

        it('shows required validation on empty submit', () => {
            renderLogin();
            const emailInput = screen.getByLabelText('email') as HTMLInputElement;
            const passwordInput = screen.getByLabelText('password') as HTMLInputElement;

            // Inputs should be required
            expect(emailInput.required).toBe(true);
            expect(passwordInput.required).toBe(true);
        });

        it('accepts email input', () => {
            renderLogin();
            const emailInput = screen.getByLabelText('email') as HTMLInputElement;
            fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
            expect(emailInput.value).toBe('test@example.com');
        });

        it('accepts password input', () => {
            renderLogin();
            const passwordInput = screen.getByLabelText('password') as HTMLInputElement;
            fireEvent.change(passwordInput, { target: { value: 'mypassword' } });
            expect(passwordInput.value).toBe('mypassword');
        });

        it('has password field with minLength', () => {
            renderLogin();
            const passwordInput = screen.getByLabelText('password') as HTMLInputElement;
            expect(passwordInput.minLength).toBe(8);
        });
    });

    describe('404 Not Found Page', () => {
        const render404 = () => {
            render(
                <BrowserRouter>
                    <NotFound />
                </BrowserRouter>
            );
        };

        it('displays 404 message', () => {
            render404();
            expect(screen.getByText('404')).toBeInTheDocument();
        });

        it('shows helpful message', () => {
            render404();
            expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument();
        });

        it('has link back to home', () => {
            render404();
            const homeLinks = screen.getAllByRole('link');
            const backLink = homeLinks.find(link => link.getAttribute('href') === '/');
            expect(backLink).toBeTruthy();
        });
    });

    // Note: Routing tests removed because App includes BrowserRouter internally
    // and cannot be wrapped with MemoryRouter for route testing

    describe('Accessibility', () => {
        it('Login form inputs are properly labeled', () => {
            render(
                <AuthProvider>
                    <BrowserRouter>
                        <Login />
                    </BrowserRouter>
                </AuthProvider>
            );

            const emailInput = screen.getByLabelText('email');
            const passwordInput = screen.getByLabelText('password');

            expect(emailInput).toHaveAttribute('id', 'email');
            expect(passwordInput).toHaveAttribute('id', 'password');
        });

        it('Home page has proper heading hierarchy', () => {
            render(<App />);
            const h1 = screen.getByRole('heading', { level: 1 });
            expect(h1).toBeInTheDocument();
        });

        it('Submit button has proper type', () => {
            render(
                <AuthProvider>
                    <BrowserRouter>
                        <Login />
                    </BrowserRouter>
                </AuthProvider>
            );

            const submitButton = screen.getByRole('button', { name: 'login' });
            expect(submitButton).toHaveAttribute('type', 'submit');
        });
    });

    describe('Dark Mode', () => {
        it('does not have light theme by default', () => {
            render(<App />);
            expect(document.documentElement.getAttribute('data-theme')).not.toBe('light');
        });
    });
});
