import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Loader2, Loader } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import axiosInstance from '@/api/axios';
import { useNavigate } from 'react-router-dom';

// Receive the token from the URL parameters and verifies it with the server
const ConfirmPasswordReset = () => {
	const token = new URLSearchParams(window.location.search).get('token');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const [verifyingToken, setVerifyingToken] = useState(false);
	const [error, setError] = useState(null);
	const [confirmPassword, setConfirmPassword] = useState('');

	useEffect(() => {
		if (!token) {
			setError('Invalid or expired token');
		}
	}, [token]);

	const handleSetNewPassword = async (e) => {
		e.preventDefault();
		if (!password) {
			toast({
				title: 'Error',
				description: 'Please enter a new password.',
				variant: 'destructive',
			});
			return;
		}
		if (password.length < 6) {
			toast({
				title: 'Error',
				description: 'Password must be at least 6 characters long.',
				variant: 'destructive',
			});
			return;
		}
		if (password !== confirmPassword) {
			toast({
				title: 'Error',
				description: 'Passwords do not match.',
				variant: 'destructive',
			});
			return;
		}
		try {
			setError(null);
			setVerifyingToken(true);
			const response = await axiosInstance.post(`/auth/user/confirm-reset-password?token=${token}`, { password });
			if (response.status !== 200) {
				throw new Error(response.data.message || 'Invalid or expired token');
			}
			toast({
				title: 'Password Reset Successful',
				description: 'You can now log in with your new password.',
				variant: 'success',
			});
		} catch (error) {
			console.error('Error verifying token:', error);
			setError(error.response?.data.message || 'Invalid or expired token');
			return false;
		} finally {
			setVerifyingToken(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="text-center">
					<div className="mx-auto w-12 h-12 bg-black rounded-lg flex items-center justify-center mb-4">
						<img src="/favicon.ico" className='h-full w-full rounded-lg p-2' alt="" />
					</div>
					<CardTitle className="text-2xl font-bold">{verifyingToken ? 'Verifying...' : 'Reset Password'}</CardTitle>
					<CardDescription>
						{verifyingToken ? 'Please wait while we verify your token...' : 'Enter your new password below.'}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{error ? (
						<div className="text-red-600 text-center">
							<p>{error}</p>
							<Button onClick={() => navigate('/reset-password')} className="mt-4">Resend Email</Button>
						</div>
					) : verifyingToken ? (
						<div className="flex items-center justify-center h-32">
							<Loader2 className="text-green-600 animate-spin" />
						</div>
					) : (
						<form onSubmit={handleSetNewPassword} className="space-y-4">
							<div className="space-y-2">
								<div className="relative">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
										<Input
											id="password"
											type="password"
											placeholder="Enter new password"
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											className="pl-10"
											required
										/>
									</div>
								</div>
							</div>
							<div className="space-y-2">
								<Label htmlFor="new-password">Confirm Password</Label>
								<div className="relative">
									<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										id="new-password"
										type="password"
										placeholder="Confirm your password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="pl-10"
										required
									/>
								</div>

								<div className="flex justify-between flex-wrap items-center mt-4">
									<p className="text-xs text-gray-500 mt-1">
										Don't have an account? <a href="/sales" className="text-blue-600 hover:underline">Contact Sales</a>
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
					)}
				</CardContent>
			</Card>
		</div>
	)
}

export default ConfirmPasswordReset;