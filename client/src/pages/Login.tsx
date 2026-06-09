import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../store/authContext';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Schemas ────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type Tab = 'customer' | 'register' | 'admin';

// ─── Reusable input wrapper ──────────────────────────────────
const InputField: React.FC<{
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ icon, error, children }) => (
  <div className="space-y-1.5">
    <div className="relative">
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-muted-foreground pointer-events-none">
        {icon}
      </span>
      {children}
    </div>
    {error && <p className="text-xs text-destructive font-medium pl-1">{error}</p>}
  </div>
);

// ─── Customer Login Form ─────────────────────────────────────
const CustomerLoginForm: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login({ email: data.email, password: data.password, rememberMe: data.rememberMe });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
          {error}
        </div>
      )}

      <InputField icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
        <input
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
        />
      </InputField>

      <InputField icon={<Lock className="h-4 w-4" />} error={errors.password?.message}>
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          {...register('password')}
          className="w-full pl-11 pr-12 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
        />
        <button type="button" onClick={() => setShowPw(!showPw)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground">
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </InputField>

      <div className="flex items-center">
        <input id="rememberMe" type="checkbox" {...register('rememberMe')}
          className="h-4 w-4 text-primary border-muted rounded focus:ring-primary" />
        <label htmlFor="rememberMe" className="ml-2 text-xs text-muted-foreground cursor-pointer">Keep me signed in</label>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
        {isSubmitting
          ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <button type="button" onClick={onSwitchToRegister}
          className="text-primary font-semibold hover:underline">
          Create one free
        </button>
      </p>
    </form>
  );
};

// ─── Register Form ───────────────────────────────────────────
const RegisterForm: React.FC<{ onSwitchToLogin: () => void }> = ({ onSwitchToLogin }) => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
          {error}
        </div>
      )}

      <InputField icon={<User className="h-4 w-4" />} error={errors.name?.message}>
        <input
          type="text"
          placeholder="Your full name"
          {...register('name')}
          className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
        />
      </InputField>

      <InputField icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
        <input
          type="email"
          placeholder="your@email.com"
          {...register('email')}
          className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
        />
      </InputField>

      <InputField icon={<Lock className="h-4 w-4" />} error={errors.password?.message}>
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="Create a password"
          {...register('password')}
          className="w-full pl-11 pr-12 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
        />
        <button type="button" onClick={() => setShowPw(!showPw)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground">
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </InputField>

      <InputField icon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message}>
        <input
          type="password"
          placeholder="Confirm your password"
          {...register('confirmPassword')}
          className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm outline-none"
        />
      </InputField>

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/25 disabled:opacity-50">
        {isSubmitting
          ? <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          : <><span>Create Account</span><ArrowRight className="h-4 w-4" /></>}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin}
          className="text-primary font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </form>
  );
};

// ─── Admin Login Form ────────────────────────────────────────
const AdminLoginForm: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    try {
      await login({ email: data.email, password: data.password });
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid admin credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-medium">
        <ShieldCheck className="h-4 w-4 shrink-0" />
        Restricted — Admin accounts only
      </div>

      {error && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
          {error}
        </div>
      )}

      <InputField icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
        <input
          type="email"
          placeholder="admin@vapeco.com"
          {...register('email')}
          className="w-full pl-11 pr-4 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm outline-none"
        />
      </InputField>

      <InputField icon={<Lock className="h-4 w-4" />} error={errors.password?.message}>
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="••••••••"
          {...register('password')}
          className="w-full pl-11 pr-12 py-3 bg-secondary/50 rounded-xl border border-muted focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all text-sm outline-none"
        />
        <button type="button" onClick={() => setShowPw(!showPw)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted-foreground hover:text-foreground">
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </InputField>

      <button type="submit" disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50">
        {isSubmitting
          ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          : <><ShieldCheck className="h-4 w-4" /><span>Admin Sign In</span></>}
      </button>
    </form>
  );
};

// ─── Main Login Page ─────────────────────────────────────────
export const Login: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('customer');

  // If already logged in, go to the right place
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : '/');
    }
  }, [user, navigate]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'customer', label: 'Sign In' },
    { id: 'register', label: 'Register' },
    { id: 'admin',    label: 'Admin' },
  ];

  const headings: Record<Tab, { title: string; subtitle: string }> = {
    customer: { title: 'Welcome back', subtitle: 'Sign in to browse the VapeCo catalog.' },
    register: { title: 'Create account', subtitle: 'Join VapeCo to explore our products.' },
    admin:    { title: 'Admin Portal',   subtitle: 'Restricted access — authorised staff only.' },
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">

          {/* Logo */}
          <div className="text-center mb-6">
            <span className="text-2xl font-extrabold tracking-tight text-gradient">
              VAPE<span className="text-foreground">CO</span>
            </span>
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary/60 rounded-2xl p-1 mb-6 gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
                  tab === t.id
                    ? t.id === 'admin'
                      ? 'bg-amber-500 text-white shadow'
                      : 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab + '-heading'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-extrabold tracking-tight">{headings[tab].title}</h1>
              <p className="text-sm text-muted-foreground mt-1">{headings[tab].subtitle}</p>
            </motion.div>
          </AnimatePresence>

          {/* Form */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'customer' && (
                <CustomerLoginForm onSwitchToRegister={() => setTab('register')} />
              )}
              {tab === 'register' && (
                <RegisterForm onSwitchToLogin={() => setTab('customer')} />
              )}
              {tab === 'admin' && <AdminLoginForm />}
            </motion.div>
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
