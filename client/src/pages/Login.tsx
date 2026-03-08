import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLocation } from 'wouter';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setAuthenticated } = useStore();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch(mode === 'login' ? '/api/login' : '/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `${mode} failed`);
      }

      setAuthenticated(true);
      setLocation('/');
    } catch (err) {
      console.error(err);
      setError(mode === 'login' ? 'Login failed' : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background p-4" data-testid="page-login">
      <div className="w-full max-w-sm glass-panel p-8 rounded-xl flex flex-col gap-6 animate-in fade-in zoom-in-95">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-2 shadow-lg shadow-primary/20">
            <Activity className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to TrueScope</h1>
          <p className="text-sm text-muted-foreground">Private investigative analysis platform.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="deuce"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="bg-background/50 border-border/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 border-border/50"
            />
          </div>

          {error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : null}

          <Button type="submit" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting
              ? (mode === 'login' ? 'Logging in...' : 'Creating account...')
              : (mode === 'login' ? 'Secure Login' : 'Create Account')}
          </Button>
        </form>

        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError('');
          }}
        >
          {mode === 'login'
            ? 'Need an account? Register'
            : 'Already have an account? Login'}
        </button>

        <div className="text-center text-xs text-muted-foreground mt-2">
          Data is private to your workspace.
        </div>
      </div>
    </div>
  );
}
