import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Activity } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useLocation } from 'wouter';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setAuthenticated } = useStore();
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      setAuthenticated(true);
      setLocation('/');
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

        <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="investigator@agency.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          <Button type="submit" className="w-full mt-2">
            Secure Login
          </Button>
        </form>

        <div className="text-center text-xs text-muted-foreground mt-4">
          Data is encrypted and private to your workspace.
        </div>
      </div>
    </div>
  );
}
