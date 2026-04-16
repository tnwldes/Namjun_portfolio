import React, { useState } from 'react';
import { usePortfolioStore } from '../store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Lock, ExternalLink, RefreshCw, Info } from 'lucide-react';

export default function Login() {
  const { login, authError } = usePortfolioStore();
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-zinc-200">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto bg-toss-blue text-white p-3 rounded-full w-fit mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">관리자 로그인</CardTitle>
          <p className="text-zinc-500">관리자 비밀번호를 입력해주세요.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                autoFocus
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-toss-blue hover:bg-toss-blue/90 text-white flex items-center justify-center gap-3 h-12 rounded-xl font-bold"
            >
              로그인
            </Button>
          </form>
          
          {authError && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium text-center">
              {authError}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
