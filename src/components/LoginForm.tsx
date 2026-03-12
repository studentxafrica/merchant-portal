
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Mail, Lock, EyeOff, Eye } from 'lucide-react';
import { mockMerchants } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { setCurrentUser } from '@/state/auth';
import axiosInstance from '@/api/axios';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const next = new URLSearchParams(useLocation().search).get('next');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axiosInstance.post('/auth/merchant/login', { email, password });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Login failed');
      }
      const merchant = response.data.user;
      const userRole = response.data.user_role

      dispatch(
        setCurrentUser({
          user: merchant,
          role: userRole
        }));
      navigate(next || '/');

      toast({
        title: "Login successful",
        description: `Welcome back, ${merchant.name}!`,
      });
    } catch (error) {
      toast({
        title: error.response?.data.message || error.message || "Login failed",
        description: error.response?.data.description || "Invalid email or password",
        variant: "warning",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
            <img src="/favicon.ico" className='h-full w-full rounded-lg p-2' alt="" />
          </div>
          <CardTitle className="text-2xl font-bold">StudentX Merchant Portal</CardTitle>
          <CardDescription>Sign in to manage your offers and track coupons</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="merchant@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                  onClick={() => setPasswordVisible(!passwordVisible)}
                >
                  {passwordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex justify-between flex-wrap items-center mt-4">
                <p className="text-xs text-gray-500 mt-1">
                  Don't have an account? <a href="mailto:info@studentx.co.ke" className="text-blue-600 hover:underline">Contact Sales</a>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Forgot your password? <a href="/reset-password" className="text-blue-600 hover:underline">Reset it</a>
                </p>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
