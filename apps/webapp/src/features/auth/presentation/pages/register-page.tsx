import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '@/features/auth/application/use-register';
import { RegisterForm } from '../components/register-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/shared/ui/card';
import { toast } from 'sonner';
import { RegisterInput } from '@/features/auth/domain/auth.schema';

export const RegisterPage = () => {
    const { mutateAsync: register, isPending } = useRegister();
    const navigate = useNavigate();

    const handleRegister = async (data: RegisterInput) => {
        try {
            await register(data);
            toast.success('Account created successfully');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Registration failed');
        }
    };

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-background">
            <Card className="w-full max-w-md shadow-lg border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-3xl font-extrabold text-center tracking-tight italic text-primary">SalesDex</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">Join our AI-powered sales coaching platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <RegisterForm onSubmit={handleRegister} isLoading={isPending} />
                </CardContent>
                <CardFooter>
                    <div className="text-sm text-center w-full text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign in instead
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
