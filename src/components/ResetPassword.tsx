import React from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axios";

const ResetPassword: React.FC = () => {
	const [loading, setLoading] = React.useState(false);
	const [email, setEmail] = React.useState('');
	const handleReset = async (e) => {
		e.preventDefault();
		try {
			setLoading(true);
			const response = await axiosInstance.post('/auth/user/reset-password', { email });
			if (response.status === 200) {
				toast({
					title: 'Success',
					description: 'Password reset link sent to your email.',
					variant: 'success',
				});
			}
		} catch (error) {
			console.error("Error sending reset link:", error);
			toast({
				title: error.response?.data.message || "Error",
				description: error.response?.data.description || error.message || "Failed to send reset link. Please try again.",
				variant: "destructive",
			})

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
					<CardTitle className="text-2xl font-bold">
						Reset Password
					</CardTitle>
					<CardDescription>
						Enter your email address below and we'll send you a link to reset your password.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleReset} className="space-y-4">
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
						<Button type="submit" disabled={loading} className="w-full">
							{loading ? 'Sending...' : 'Send Reset Link'}
						</Button>
						<p className="text-xs text-gray-500 mt-1">
							Remembered your password? <a href="/login" className="text-blue-600 hover:underline">Sign in</a>
						</p>
					</form>
				</CardContent>
			</Card>
		</div>
	)
};
export default ResetPassword;