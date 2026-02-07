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
            toast.success('Logged in successfully');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-background">
            <Card className="w-full max-w-md shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-extrabold text-center tracking-tight italic text-primary">SalesDex</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">Enter your credentials to access your dashboard</CardDescription>
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
    );
};
