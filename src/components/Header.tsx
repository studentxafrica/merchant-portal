import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, LogOut, User, Search, MessageSquare } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Merchant } from '@/types/user';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { setLogout } from '@/state/auth';
import { useDispatch } from 'react-redux';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

interface HeaderProps {
	merchant: Partial<Merchant>;
}

export const Header: React.FC<HeaderProps> = ({ merchant }) => {
	const dispatch = useDispatch();
	return (
		<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
			<div className=" mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex items-center space-x-4">
						<div className="text-2xl font-bold">Student<span className='text-brand-primary'>X</span></div>
					</div>

					{/* Search */}
					<div className="hidden md:flex flex-1 max-w-lg mx-8">
						<div className="relative w-full">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
								placeholder="Search offers, customers, coupons..."
								className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
							/>
						</div>
					</div>

					{/* Navigation Items */}
					<div className="flex items-center space-x-4">
						{/* <Button variant="ghost" size="sm" className="relative">
							<MessageSquare className="h-5 w-5" />
							<span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
								3
							</span>
						</Button>
						<Button variant="ghost" size="sm" className="relative">
							<Bell className="h-5 w-5" />
							<span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
						</Button>
						<Button variant="ghost" size="sm">
							<Settings className="h-5 w-5" />
						</Button> */}

						{/* Profile Dropdown */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									className="hover:bg-gray-200 p-2 rounded-lg w-full h-full border-2 border-gray-200"
								>
									<div className="flex items-center space-x-3 border-l border-gray-200">
										<div className="w-8 h-8 rounded-full flex items-center justify-center">
											<Avatar>
												<AvatarImage src={merchant?.logo} alt={merchant?.name} className="rounded-full" />
												<AvatarFallback>
													{merchant?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4 text-white" />}
												</AvatarFallback>
											</Avatar>
										</div>
									</div>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-48">

								<DropdownMenuItem className='text-red-600'>
									<Button onClick={() => dispatch(setLogout())} variant="ghost" className="w-full text-left">
										<LogOut className="mr-2 h-4 w-4" />
										Log Out
									</Button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

					</div>
				</div>
			</div>
		</header>
	);
};