import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '@/features/auth/application/use-login';
import { LoginForm } from '../components/login-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { toast } from 'sonner';
import { LoginInput } from '@/features/auth/domain/auth.schema';

export const LoginPage = () => {
    const { mutateAsync: login, isPending } = useLogin();
    const navigate = useNavigate();

    const handleLogin = async (data: LoginInput) => {
        try {
            await login(data);
            console.log(data)
            toast.success('Logged in successfully');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center px-4 bg-background overflow-hidden">
            <div className="pointer-events-none absolute inset-0 gradient-primary" />

            <div className="relative w-full max-w-md">
                <Card className="glass hover-lift border-primary/10 shadow-xl">
                    <CardHeader className="space-y-2">
                        <CardTitle className="text-3xl font-extrabold text-center tracking-tight text-foreground">
                            <span className="text-primary">Sales</span>Dex
                        </CardTitle>
                        <CardDescription className="text-center text-muted-foreground">
                            Enter your credentials to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm onSubmit={handleLogin} isLoading={isPending} />
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <div className="text-sm text-center text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary font-semibold hover:underline">
                                Create an account
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};
