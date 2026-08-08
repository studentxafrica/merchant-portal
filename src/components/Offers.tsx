import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axios';
import { Merchant } from '@/types/user';
import { OfferType, UsageType, OfferKind } from '@/types/offer';
import { Helmet } from 'react-helmet-async';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import {
	Plus,
	Edit,
	Eye,
	Trash2,
	DollarSign,
	Calendar,
	Tag,
	TrendingUp,
	Users,
	Filter,
	ChevronLeft,
	ChevronRight,
	ArrowUpDown,
	Download,
	MoreHorizontal,
	Check,
	Repeat,
	Infinity,
	Trophy,
	Clock,
	Settings,
	Info,
	Percent,
	Video,
	Link2,
} from 'lucide-react';
// import { mockOffers, mockCategories } from '@/data/mockData';
import { DatePicker } from "@/components/ui/date-picker";
import { Progress } from "@/components/ui/progress";
import { Category } from '@/types/category';
import { useNavigate } from 'react-router-dom';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ConfirmModal } from './confirmModal';
import { CsvUploadWizard } from './CsvUploadWizard';
import OpenAI from "openai";

interface Offer {
	id: string;
	title: string;
	description: string;
	slug: string;
	coverImage: string;
	offerKind?: OfferKind;
	eventUrl?: string;
	discountType: OfferType;
	discountValue: number;
	redemptionType: string;
	currency: string;
	category: {
		id: string;
		name: string;
	};
	coupons: {
		total: number;
		claimed: number;
		redeemed: number;
	};
	status: string;
	startDate: Date;
	endDate: Date;
	termsAndConditions: string;
	expectedRevenue?: number;
	revenueGenerated?: number;
	conversionRate?: number;
	avgRedemptionTime?: number;
	tags?: string[];
	stores?: string[];
	// New flexible usage system fields
	usage_type?: UsageType;
	max_claims_per_user?: number;
	cooldown_period_hours?: number;
	tier_progression?: {
		tiers: Array<{
			min_usage: number;
			discount_multiplier: number;
			name: string;
		}>;
	};
}

interface OfferManagementProps {
	merchant: Partial<Merchant> | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const OfferCreationSteps = {
	'basic-info': {
		id: 'basic-info',
		title: 'Basic Information',
		description: 'Provide essential details about your offer',
	},
	'discount-details': {
		id: 'discount-details',
		title: 'Discount Details',
		description: 'Set up your discount type and value',
	},
	'event-details': {
		id: 'event-details',
		title: 'Event Details',
		description: 'Add the link students receive when they register',
	},
	'usage-config': {
		id: 'usage-config',
		title: 'Usage Configuration',
		description: 'Configure how often students can use your offer',
	},
	'redemption': {
		id: 'redemption',
		title: 'Redemption Options',
		description: 'Configure how students can redeem your offer',
	},
	'registration': {
		id: 'registration',
		title: 'Registration Options',
		description: 'Set how many students can register and for how long',
	},
	'visuals': {
		id: 'visuals',
		title: 'Visuals & Branding',
		description: 'Upload images and set offer appearance',
	},
	'review': {
		id: 'review',
		title: 'Review & Publish',
		description: 'Preview and launch your offer',
	},
};

const DISCOUNT_OFFER_STEPS = ['basic-info', 'discount-details', 'usage-config', 'redemption', 'visuals', 'review'];
const EVENT_OFFER_STEPS = ['basic-info', 'event-details', 'registration', 'visuals', 'review'];

const isEventLink = (url?: string) => /^https?:\/\/\S+\.\S+/.test((url || '').trim());

export interface AnalyticsProps {
	totalOffers: number;
	activeOffers: number;
	expiredOffers: number;
	couponStats: {
		total: number;
		claimed: number;
		redeemed: number;
		redemptionRate: number;
	};
	revenueStats: {
		totalRevenue: number;
		avgRevenuePerOffer: number;
		avgRevenuePerRedemption: number;
	};
	performanceMetrics: {
		totalViews: number;
		uniqueVisitors: number;
		clickThroughRate: number;
		avgRedemptionTime: number;
	};
	categoryDistribution: Array<{
		name: string; value: number
	}>;
	redemptionTrends: Array<{
		name: string;
		claimed: number;
		redeemed: number;
	}>;
	topPerformingOffers: Array<{
		title: string;
		views: number;
		uniqueVisitors: number;
		claims: number;
		redeemed: number;
		revenue: number;
		conversionRate: number;
	}>;
}

export const ActiveOffers: React.FC<OfferManagementProps> = ({ merchant }) => {
	const query = new URLSearchParams(window.location.search);
	const [activeTab, setActiveTab] = useState(query.get('tab') || 'overview');
	const [offers, setOffers] = useState<Offer[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(query.get('create') === 'true');
	const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(query.get('edit') === 'true');
	const [filterStatus, setFilterStatus] = useState('all');
	const [currentStep, setCurrentStep] = useState(0);
	const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
	const { toast } = useToast();
	const navigate = useNavigate();
	const [recommendedTags, setRecommendedTags] = useState<string[]>([
		'discount', 'offer', 'college discount', 'university offer', 'savings',
		'deals', 'promotion', 'benefits', 'perks', 'rewards', 'coupon', 'special',
		'exclusive', 'price', 'rate', 'access', 'membership', 'loyalty', 'program',
		'initiative', 'campaign', 'event', 'partnership', 'collaboration', 'community',
		'network', 'organization', 'association', 'club', 'society', 'group', 'union',
		'council', 'leadership', 'engagement', 'involvement', 'participation', 'activism',
		'advocacy', 'empowerment', 'development', 'growth', 'success',
	]);
	console.log(selectedOffer?.tags, recommendedTags);
	const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();
	const [updatingOffer, setUpdatingOffer] = useState(false);
	const [createdOfferId, setCreatedOfferId] = useState<string | null>(null);
	const [showImportPrompt, setShowImportPrompt] = useState(false);
	const [showCsvUploadWizard, setShowCsvUploadWizard] = useState(false);

	// New offer state with additional fields
	const [newOffer, setNewOffer] = useState<Partial<Offer>>({
		title: '',
		description: '',
		coverImage: '',
		offerKind: OfferKind.DISCOUNT,
		eventUrl: '',
		discountType: OfferType.PERCENTAGE,
		discountValue: 10,
		redemptionType: 'both',
		currency: 'USD',
		category: { id: '', name: '' },
		coupons: {
			total: 100,
			claimed: 0,
			redeemed: 0,
		},
		status: 'active',
		startDate: new Date(),
		endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
		termsAndConditions: '',
		tags: [],
		stores: [],
		expectedRevenue: 0,
		conversionRate: 0,
		// New flexible usage system fields
		usage_type: UsageType.SINGLE_USE,
		max_claims_per_user: 1,
		cooldown_period_hours: undefined,
		tier_progression: undefined,
	});

	const isEventOffer = newOffer.offerKind === OfferKind.EVENT;
	const editingEventOffer = selectedOffer?.offerKind === OfferKind.EVENT;
	const creationSteps = React.useMemo(
		() => (isEventOffer ? EVENT_OFFER_STEPS : DISCOUNT_OFFER_STEPS)
			.map(id => OfferCreationSteps[id]),
		[isEventOffer]
	);
	const activeStep = creationSteps[Math.min(currentStep, creationSteps.length - 1)];

	// Analytics data
	const [analytics, setAnalytics] = useState<AnalyticsProps>({
		totalOffers: 0,
		activeOffers: 0,
		expiredOffers: 0,
		couponStats: {
			total: 0,
			claimed: 0,
			redeemed: 0,
			redemptionRate: 0,
		},
		revenueStats: {
			totalRevenue: 0,
			avgRevenuePerOffer: 0,
			avgRevenuePerRedemption: 0,
		},
		performanceMetrics: {
			totalViews: 0,
			uniqueVisitors: 0,
			clickThroughRate: 0,
			avgRedemptionTime: 0,
		},
		categoryDistribution: [],
		redemptionTrends: [],
		topPerformingOffers: [],
	});

	const fetchMerchantOffers = async () => {
		try {
			const response = await axiosInstance.get(`/user/merchant/offers`);
			if (response.status !== 200) {
				throw new Error(response.data.message || 'Failed to fetch offers');
			}
			setOffers(response.data.data || []);

			// Fetch analytics data
			const analyticsResponse = await axiosInstance.get(`/user/merchant/offers/analytics`, {
				params: {
					time_period: 6 // last 6 months
				}
			});
			if (analyticsResponse.status === 200) {
				setAnalytics(analyticsResponse.data);
			}
			// Fetch categories
			const categoriesResponse = await axiosInstance.get('/offer/categories');
			if (categoriesResponse.status === 200) {
				setCategories(categoriesResponse.data.data);
			}
		} catch (error) {
			console.error("Error fetching merchant offers:", error);
			toast({
				title: error.response?.data?.message || error.message || "Error",
				description: error.response?.data?.description || "Failed to load offers. Please try again later.",
				variant: "destructive",
			});
		}
	};

	useEffect(() => {
		if (merchant) {
			fetchMerchantOffers();
		}
	}, [merchant]);

	const handleCreateOffer = async () => {
		if (!merchant?.isApproved) {
			toast({
				title: "Account not approved",
				description: "Your account needs to be approved before creating offers.",
				variant: "destructive",
			});
			return;
		}

		if (isEventOffer && !isEventLink(newOffer.eventUrl)) {
			toast({
				title: "Event link required",
				description: "Add the link students will use to join, starting with http:// or https://",
				variant: "destructive",
			});
			return;
		}

		try {
			const response = await axiosInstance.post('/offer/new', {
				title: newOffer.title,
				description: newOffer.description,
				slug: newOffer.slug || newOffer.title?.toLowerCase().replace(/\s+/g, '-'),
				cover_image: newOffer.coverImage || 'https://via.placeholder.com/300',
				offer_kind: newOffer.offerKind,
				event_url: isEventOffer ? newOffer.eventUrl?.trim() : undefined,
				discount_type: newOffer.discountType,
				discount_value: newOffer.discountValue,
				currency: newOffer.currency || 'USD',
				// category_id: newOffer.category?.id,
				coupon_limit: newOffer.coupons?.total,
				redemption_type: newOffer.redemptionType,
				start_date: newOffer.startDate?.toISOString(),
				end_date: newOffer.endDate?.toISOString(),
				terms_and_conditions: newOffer.termsAndConditions,
				tags: newOffer.tags,
				stores: newOffer.stores,
				// New flexible usage system fields
				usage_type: isEventOffer ? UsageType.SINGLE_USE : newOffer.usage_type,
				max_claims_per_user: isEventOffer ? 1 : newOffer.max_claims_per_user,
				cooldown_period_hours: isEventOffer ? undefined : newOffer.cooldown_period_hours,
				tier_progression: !isEventOffer && newOffer.usage_type === UsageType.TIERED ? {
					tiers: [
						{ min_usage: 0, discount_multiplier: 1.0, name: "Bronze" },
						{ min_usage: 3, discount_multiplier: 1.5, name: "Silver" },
						{ min_usage: 6, discount_multiplier: 2.0, name: "Gold" }
					]
				} : undefined,
			});

			if (response.status === 201) {
				const createdOffer = response.data.data;
				const createdEvent = createdOffer?.offerKind === OfferKind.EVENT;
				setOffers([...offers, createdOffer]);
				setIsCreateModalOpen(false);
				setCurrentStep(0);
				setNewOffer({
					title: '',
					description: '',
					coverImage: '',
					offerKind: OfferKind.DISCOUNT,
					eventUrl: '',
					discountType: OfferType.PERCENTAGE,
					discountValue: 10,
					redemptionType: 'both',
					currency: 'USD',
					category: { id: '', name: '' },
					coupons: {
						total: 100,
						claimed: 0,
						redeemed: 0,
					},
					status: 'active',
					startDate: new Date(),
					endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
					termsAndConditions: '',
					tags: [],
					stores: [],
				});

				// Events hand out the same link to everyone, so there is nothing to import
				if (!createdEvent) {
					setCreatedOfferId(createdOffer.id);
					setShowImportPrompt(true);
				}

				toast({
					title: createdEvent ? "Event published successfully" : "Offer created successfully",
					description: createdEvent
						? "Students can now register and get the event link."
						: "Your new offer is now live for students to claim!",
					variant: "success",
				});
			}
		} catch (error) {
			toast({
				title: "Error creating offer",
				description: error.response?.data?.message || "Please try again later.",
				variant: "destructive",
			});
		}
	};

	const handleEditOffer = (offer: Offer) => {
		setSelectedOffer(offer);
		console.log("Editing offer:", offer);
		setSelectedOffer(offer);
		setIsEditModalOpen(true);
	};

	const handleUpdateOffer = async () => {
		const editingEvent = selectedOffer?.offerKind === OfferKind.EVENT;
		if (editingEvent && !isEventLink(selectedOffer?.eventUrl)) {
			toast({
				title: "Event link required",
				description: "Add the link students will use to join, starting with http:// or https://",
				variant: "destructive",
			});
			return;
		}

		try {
			setUpdatingOffer(true);
			console.log("Updating offer:", selectedOffer);
			const response = await axiosInstance.put(`/user/merchant/offers/${selectedOffer?.id}`, {
				...selectedOffer,
				cover_image: selectedOffer?.coverImage,
				event_url: editingEvent ? selectedOffer?.eventUrl?.trim() : undefined,
			});

			if (response.status === 200) {
				const updatedOffers = offers.map(offer =>
					offer.id === selectedOffer?.id ? response.data.data : offer
				);
				setOffers(updatedOffers);
				// setIsEditModalOpen(false);
				toast({
					title: "Offer updated successfully",
					description: "Your offer has been updated.",
				});
			}
		} catch (error) {
			console.error(error)
			toast({
				title: "Error updating offer",
				description: error.response?.data?.message || "Please try again later.",
				variant: "destructive",
			});
		} finally {
			setUpdatingOffer(false);
		}
	};

	const handleDeleteOffer = async (offerId) => {
		try {
			const response = await axiosInstance.delete(`/offer/${offerId}`);
			if (response.status !== 200) {
				throw new Error(response.data.message || 'Failed to delete offer');
			}
			setOffers(offers.filter(offer => offer.id !== offerId));
			toast({
				title: "Offer deleted",
				description: "The offer has been removed successfully.",
			});
		} catch (error) {
			console.error("Error deleting offer:", error);
			toast({
				title: error.response?.data.message || "Error",
				description: error.response?.data.description || "Failed to delete offer. Please try again.",
				variant: "destructive",
			});
			return;

		}
	};

	const handleSort = (key: string) => {
		let direction: 'asc' | 'desc' = 'asc';
		if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
			direction = 'desc';
		}
		setSortConfig({ key, direction });
	};

	const sortedOffers = React.useMemo(() => {
		if (!sortConfig) return offers;

		return [...offers].sort((a, b) => {
			// Handle nested properties
			const getValue = (obj: any, key: string) => {
				return key.split('.').reduce((o, k) => (o || {})[k], obj);
			};

			const aValue = getValue(a, sortConfig.key);
			const bValue = getValue(b, sortConfig.key);

			if (aValue < bValue) {
				return sortConfig.direction === 'asc' ? -1 : 1;
			}
			if (aValue > bValue) {
				return sortConfig.direction === 'asc' ? 1 : -1;
			}
			return 0;
		});
	}, [offers, sortConfig]);

	const filteredOffers = filterStatus === 'all'
		? sortedOffers
		: sortedOffers.filter(offer => offer.status === filterStatus);

	// Analytics calculations
	const totalRevenue = offers.reduce((sum, offer) => sum + (offer.revenueGenerated || 0), 0);
	const totalClaimed = offers.reduce((sum, offer) => sum + (offer.coupons?.claimed || 0), 0);
	const totalRedeemed = offers.reduce((sum, offer) => sum + (offer.coupons?.redeemed || 0), 0);
	const avgRedemptionRate = offers.length > 0
		? (totalRedeemed / totalClaimed) * 100
		: 0;

	const topPerformingOffers = analytics.topPerformingOffers || [];
	// [...offers]
	// 	.sort((a, b) => (b.coupons?.claimed || 0) - (a.coupons?.claimed || 0))
	// 	.slice(0, 5);

	const categoryDistribution = analytics.categoryDistribution || [];
	// mockCategories.map(category => ({
	// 	name: category.name,
	// 	value: offers.filter(o => o.category?.id === category.id).length,
	// }));

	const redemptionTrends = analytics.redemptionTrends;
	// [
	// 	{ name: 'Jan', claimed: 45, redeemed: 30 },
	// 	{ name: 'Feb', claimed: 60, redeemed: 42 },
	// 	{ name: 'Mar', claimed: 75, redeemed: 55 },
	// 	{ name: 'Apr', claimed: 90, redeemed: 68 },
	// 	{ name: 'May', claimed: 110, redeemed: 82 },
	// 	{ name: 'Jun', claimed: 130, redeemed: 95 },
	// ];

	const nextStep = () => {
		if (currentStep < creationSteps.length - 1) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep(currentStep - 1);
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setNewOffer({ ...newOffer, coverImage: reader.result as string });
			};
			reader.readAsDataURL(file);
		}
	};

	const handleEditOfferImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setSelectedOffer({ ...selectedOffer, coverImage: reader.result as string });
			};
			reader.readAsDataURL(file);
		}
	};

	return (
		<div className="space-y-6">
			<Helmet>
				<title>Offer Management - Merchant Dashboard</title>
				<meta name="description" content="Create and manage your student discount offers." />
			</Helmet>

			<ConfirmModal
				isOpen={isOpen}
				onClose={closeModal}
				{...modalProps}
			/>

			{/* Post-creation import prompt */}
			<Dialog open={showImportPrompt} onOpenChange={setShowImportPrompt}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Check className="h-5 w-5 text-green-600" />
							Offer Created Successfully!
						</DialogTitle>
						<DialogDescription>
							Would you like to import coupon codes from your POS system for this offer?
						</DialogDescription>
					</DialogHeader>
					<div className="flex flex-col gap-2 pt-2">
						<Button
							className="w-full bg-blue-600 hover:bg-blue-700"
							onClick={() => {
								setShowImportPrompt(false);
								setShowCsvUploadWizard(true);
							}}
						>
							Yes, Import Coupons Now
						</Button>
						<Button
							variant="outline"
							className="w-full"
							onClick={() => {
								setShowImportPrompt(false);
								setCreatedOfferId(null);
							}}
						>
							Maybe Later
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* CSV Upload Wizard (from offer creation flow) */}
			<CsvUploadWizard
				open={showCsvUploadWizard}
				onOpenChange={(val) => {
					setShowCsvUploadWizard(val);
					if (!val) setCreatedOfferId(null);
				}}
				preselectedOfferId={createdOfferId || undefined}
				merchant={merchant}
				onComplete={() => {
					fetchMerchantOffers();
					setCreatedOfferId(null);
				}}
			/>

			{/* Header */}
			<div className="flex justify-between items-start">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
					<p className="text-gray-600 mt-1">Create and manage your student discount offers</p>
				</div>
				<Dialog open={isCreateModalOpen} onOpenChange={(e) => {
					setIsCreateModalOpen(e);
					// if (e) {
					// 	setNewOffer({
					// 		title: '',
					// 		description: '',
					// 		coverImage: '',
					// 		discountType: OfferType.PERCENTAGE,
					// 		discountValue: 10,
					// 		redemptionType: 'both',
					// 		currency: 'USD',
					// 		category: { id: '', name: '' },
					// 		coupons: {
					// 			total: 100,
					// 			claimed: 0,
					// 			redeemed: 0,
					// 		},
					// 		status: 'active',
					// 		startDate: new Date(),
					// 		endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
					// 		termsAndConditions: '',
					// 		tags: [],
					// 		stores: [],
					// 		expectedRevenue: 0,
					// 		conversionRate: 0,
					// 	});
					// 	setCurrentStep(0);
					// }
					query.set('create', e ? 'true' : 'false');
					navigate(`?${query.toString()}`);
				}}>
					<DialogTrigger asChild>
						<Button className="bg-blue-600 hover:bg-blue-700">
							<Plus className="h-4 w-4 mr-2" />
							Create Offer
						</Button>
					</DialogTrigger>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
						<DialogHeader>
							<DialogTitle>
								{activeStep.title}
							</DialogTitle>
							<DialogDescription>
								{activeStep.description}
							</DialogDescription>
						</DialogHeader>

						{/* Progress indicator */}
						<div className="w-full mb-6">
							<div className="flex justify-between mb-2">
								{creationSteps.map((step, index) => (
									<div
										key={step.id}
										className={`flex flex-col items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}
									>
										<div
											className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
										>
											{index + 1}
										</div>
										<span className="text-xs mt-1">{step.title}</span>
									</div>
								))}
							</div>
							<Progress value={(currentStep + 1) * (100 / creationSteps.length)} />
						</div>

						{/* Step 1: Basic Information */}
						{activeStep.id === 'basic-info' && (
							<div className="space-y-6">
								<div className="space-y-2">
									<Label>What are you offering students?*</Label>
									<div className="grid grid-cols-2 gap-3">
										<div
											className={`border rounded-lg p-3 cursor-pointer transition-colors ${!isEventOffer ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
											onClick={() => setNewOffer({ ...newOffer, offerKind: OfferKind.DISCOUNT })}
										>
											<div className="flex items-center space-x-3">
												<Percent className="h-5 w-5 text-blue-600" />
												<div>
													<h4 className="font-medium">Discount</h4>
													<p className="text-sm text-gray-600">Students claim a coupon code to save money</p>
												</div>
											</div>
										</div>
										<div
											className={`border rounded-lg p-3 cursor-pointer transition-colors ${isEventOffer ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
											onClick={() => setNewOffer({
												...newOffer,
												offerKind: OfferKind.EVENT,
												usage_type: UsageType.SINGLE_USE,
												max_claims_per_user: 1,
												cooldown_period_hours: undefined,
											})}
										>
											<div className="flex items-center space-x-3">
												<Video className="h-5 w-5 text-indigo-600" />
												<div>
													<h4 className="font-medium">Event registration</h4>
													<p className="text-sm text-gray-600">Students register and get your event link</p>
												</div>
											</div>
										</div>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="title">{isEventOffer ? 'Event Title*' : 'Offer Title*'}</Label>
											<Input
												id="title"
												value={newOffer.title || ''}
												onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
												placeholder={isEventOffer ? "e.g., Careers in Tech Webinar" : "e.g., 50% Off Large Pizza"}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="description">Description*</Label>
											<Textarea
												id="description"
												value={newOffer.description || ''}
												onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
												placeholder={isEventOffer
													? "What the event covers, when it starts, who should join..."
													: "Describe your offer in detail..."}
												rows={4}
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="category">Category*</Label>
											<Select
												value={newOffer.category?.id || ''}
												onValueChange={(value) => {
													const selectedCategory = categories.find((cat) => cat.id === value);
													setNewOffer({
														...newOffer,
														category: selectedCategory
															? { id: selectedCategory.id, name: selectedCategory.name }
															: { id: value, name: '' }
													});
												}}
											>
												<SelectTrigger>
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
												<SelectContent>
													{categories.map((category) => (
														<SelectItem key={category.id} value={category.id}>
															{category.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									</div>
									<div className="space-y-4">
										<div className="space-y-2">
											<Label>Cover Image</Label>
											<div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center">
												{newOffer.coverImage ? (
													<img
														src={newOffer.coverImage}
														alt="Preview"
														className="w-full h-48 object-cover rounded-md"
													/>
												) : (
													<div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
														<span className="text-gray-500">No image selected</span>
													</div>
												)}
												<Input
													type="file"
													accept="image/*"
													onChange={handleImageUpload}
													className="mt-4"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Step 2 (discount offers): Discount Details */}
						{activeStep.id === 'discount-details' && (
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="discountType">Discount Type*</Label>
										<Select
											value={newOffer.discountType || ''}
											onValueChange={(value) => setNewOffer({ ...newOffer, discountType: value as OfferType })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="percentage">Percentage Off</SelectItem>
												<SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
												<SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
												<SelectItem value="free_item">Free Item</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className='flex justify-between items-center'>
										<div className="space-y-2 w-full">
											<Label htmlFor="discountValue">
												{newOffer.discountType === 'percentage' ? 'Discount Percentage*' : 'Discount Amount*'}
											</Label>
											<div className="flex items-center">
												{newOffer.discountType === 'percentage' ? (
													<>
														<Input
															id="discountValue"
															type="number"
															min="1"
															max="100"
															value={newOffer.discountValue || 0}
															onChange={(e) => setNewOffer({ ...newOffer, discountValue: Number(e.target.value) })}
															className="w-24"
														/>
														<span className="ml-2">%</span>
													</>
												) : (
													<>
														<Input
															id="discountValue"
															type="number"
															min="0.01"
															step="0.01"
															value={newOffer.discountValue || 0}
															onChange={(e) => setNewOffer({ ...newOffer, discountValue: Number(e.target.value) })}
															className="w-24"
														/>
													</>
												)}
											</div>
										</div>
										<div className="space-y-2 w-full">
											<Label htmlFor="currency">Currency*</Label>
											<Select
												value={newOffer.currency || window.navigator.language.split('-')[1] || 'USD'}
												onValueChange={(value) => setNewOffer({ ...newOffer, currency: value })}
											>
												<SelectTrigger>
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="AUD">AUD</SelectItem>
													<SelectItem value="CAD">CAD</SelectItem>
													<SelectItem value="CNY">CNY</SelectItem>
													<SelectItem value="EUR">EUR</SelectItem>
													<SelectItem value="GBP">GBP</SelectItem>
													<SelectItem value="INR">INR</SelectItem>
													<SelectItem value="JPY">JPY</SelectItem>
													<SelectItem value="KES">KES</SelectItem>
													<SelectItem value="NZD">NZD</SelectItem>
													<SelectItem value="RUB">RUB</SelectItem>
													<SelectItem value="SGD">SGD</SelectItem>
													<SelectItem value="USD">USD</SelectItem>
													<SelectItem value="ZAR">ZAR</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>
								<div className="space-y-4">
									<div className="space-y-2">
										<Label>Expected Revenue Impact</Label>
										<Card className="p-4">
											<div className="flex items-center justify-between">
												<div>
													<p className="text-sm text-gray-500">Estimated revenue per redemption</p>
													<p className="text-xl font-semibold">
														${(newOffer.discountValue || 0) * 2.5} - ${(newOffer.discountValue || 0) * 5}
													</p>
												</div>
												<TrendingUp className="h-8 w-8 text-green-500" />
											</div>
											<p className="text-xs text-gray-500 mt-2">
												Based on average order values from similar offers
											</p>
										</Card>
									</div>
									<div className="space-y-2">
										<Label htmlFor="terms">Terms and Conditions</Label>
										<Textarea
											id="terms"
											value={newOffer.termsAndConditions || ''}
											onChange={(e) => setNewOffer({ ...newOffer, termsAndConditions: e.target.value })}
											placeholder="Enter terms and conditions..."
											rows={3}
										/>
									</div>
								</div>
							</div>
						)}

						{/* Step 2 (event offers): Event Details */}
						{activeStep.id === 'event-details' && (
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="eventUrl">Event Link*</Label>
										<div className="flex items-center space-x-2">
											<Link2 className="h-4 w-4 text-gray-400" />
											<Input
												id="eventUrl"
												type="url"
												value={newOffer.eventUrl || ''}
												onChange={(e) => setNewOffer({ ...newOffer, eventUrl: e.target.value })}
												placeholder="https://meet.google.com/abc-defg-hij"
												required
											/>
										</div>
										<p className="text-xs text-gray-600">
											Meeting link, ticket page or anything else students need to attend.
										</p>
										{newOffer.eventUrl && !isEventLink(newOffer.eventUrl) && (
											<p className="text-xs text-red-600">
												Enter a full link starting with http:// or https://
											</p>
										)}
									</div>
									<div className="space-y-2">
										<Label htmlFor="event-terms">Terms and Conditions</Label>
										<Textarea
											id="event-terms"
											value={newOffer.termsAndConditions || ''}
											onChange={(e) => setNewOffer({ ...newOffer, termsAndConditions: e.target.value })}
											placeholder="Attendance rules, what to bring, cancellation policy..."
											rows={5}
										/>
									</div>
								</div>
								<div className="space-y-4">
									<Card className="p-4">
										<div className="flex items-start space-x-2">
											<Info className="h-4 w-4 text-indigo-600 mt-0.5" />
											<div className="text-sm space-y-2 text-gray-600">
												<p className="font-medium text-gray-900">How students get in</p>
												<p>
													Registering reveals this link and a QR code for it. Everyone
													who registers sees the same link, so there are no codes to
													generate, import or hand out.
												</p>
												<p>
													You can update the link later and every student who already
													registered will see the new one.
												</p>
											</div>
										</div>
									</Card>
									<Card className="p-4">
										<Label className="text-sm text-gray-500">What students see</Label>
										<div className="mt-3 flex items-center space-x-3">
											<div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
												<Video className="h-6 w-6 text-indigo-600" />
											</div>
											<div className="min-w-0">
												<p className="font-medium truncate">{newOffer.title || 'Your Event Title'}</p>
												<p className="text-xs text-gray-500 truncate">
													{newOffer.eventUrl || 'Your event link appears here'}
												</p>
											</div>
										</div>
									</Card>
								</div>
							</div>
						)}

						{/* Step 3 (discount offers): Usage Configuration */}
						{activeStep.id === 'usage-config' && (
							<div className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									{/* Usage Type Selection */}
									<Card className="p-4">
										<div className="space-y-4">
											<div>
												<Label className="text-lg font-semibold">Usage Type</Label>
												<p className="text-sm text-gray-600">Choose how students can use your offer</p>
											</div>

											<div className="space-y-3">
												{/* Single Use Option */}
												<div className={`border rounded-lg p-3 cursor-pointer transition-colors ${newOffer.usage_type === UsageType.SINGLE_USE ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
													onClick={() => setNewOffer({ ...newOffer, usage_type: UsageType.SINGLE_USE, max_claims_per_user: 1 })}>
													<div className="flex items-center space-x-3">
														<Users className="h-5 w-5 text-blue-600" />
														<div>
															<h4 className="font-medium">One-time Use</h4>
															<p className="text-sm text-gray-600">Each student can claim once</p>
														</div>
													</div>
												</div>

												{/* Multi Use Option */}
												<div className={`border rounded-lg p-3 cursor-pointer transition-colors ${newOffer.usage_type === UsageType.MULTI_USE ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
													onClick={() => setNewOffer({ ...newOffer, usage_type: UsageType.MULTI_USE, max_claims_per_user: 3 })}>
													<div className="flex items-center space-x-3">
														<Repeat className="h-5 w-5 text-green-600" />
														<div>
															<h4 className="font-medium">Multi-use</h4>
															<p className="text-sm text-gray-600">Students can claim multiple times</p>
														</div>
													</div>
												</div>

												{/* Unlimited Option */}
												<div className={`border rounded-lg p-3 cursor-pointer transition-colors ${newOffer.usage_type === UsageType.UNLIMITED ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
													onClick={() => setNewOffer({ ...newOffer, usage_type: UsageType.UNLIMITED, max_claims_per_user: undefined })}>
													<div className="flex items-center space-x-3">
														<Infinity className="h-5 w-5 text-purple-600" />
														<div>
															<h4 className="font-medium">Unlimited</h4>
															<p className="text-sm text-gray-600">No limits on claims</p>
														</div>
													</div>
												</div>

												{/* Tiered Option */}
												<div className={`border rounded-lg p-3 cursor-pointer transition-colors ${newOffer.usage_type === UsageType.TIERED ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
													onClick={() => setNewOffer({ ...newOffer, usage_type: UsageType.TIERED, max_claims_per_user: 10 })}>
													<div className="flex items-center space-x-3">
														<Trophy className="h-5 w-5 text-yellow-600" />
														<div>
															<h4 className="font-medium">Tiered Rewards</h4>
															<p className="text-sm text-gray-600">Better discounts with more usage</p>
														</div>
													</div>
												</div>
											</div>
										</div>
									</Card>

									{/* Configuration Options */}
									<Card className="p-4">
										<div className="space-y-4">
											<div>
												<Label className="text-lg font-semibold">Configuration</Label>
												<p className="text-sm text-gray-600">Set limits and restrictions</p>
											</div>

											{/* Max Claims Per User (for multi-use and tiered) */}
											{(newOffer.usage_type === UsageType.MULTI_USE || newOffer.usage_type === UsageType.TIERED) && (
												<div className="space-y-2">
													<Label htmlFor="maxClaims">Maximum claims per user</Label>
													<Input
														id="maxClaims"
														type="number"
														min="1"
														max="50"
														value={newOffer.max_claims_per_user || 1}
														onChange={(e) => setNewOffer({ ...newOffer, max_claims_per_user: Number(e.target.value) })}
													/>
													<p className="text-xs text-gray-600">How many times each student can claim this offer</p>
												</div>
											)}

											{/* Cooldown Period (for all except single-use) */}
											{newOffer.usage_type !== UsageType.SINGLE_USE && (
												<div className="space-y-2">
													<Label htmlFor="cooldown">Cooldown period (hours)</Label>
													<Input
														id="cooldown"
														type="number"
														min="0"
														max="168"
														value={newOffer.cooldown_period_hours || ''}
														onChange={(e) => setNewOffer({ ...newOffer, cooldown_period_hours: Number(e.target.value) || undefined })}
														placeholder="Optional"
													/>
													<p className="text-xs text-gray-600">Time between claims (leave empty for no cooldown)</p>
												</div>
											)}

											{/* Tier Configuration (for tiered) */}
											{newOffer.usage_type === UsageType.TIERED && (
												<div className="space-y-2">
													<Label>Tier Rewards</Label>
													<div className="space-y-2 text-sm">
														<div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
															<span>Bronze (1-2 claims)</span>
															<span>Standard discount</span>
														</div>
														<div className="flex justify-between items-center p-2 bg-yellow-100 rounded">
															<span>Silver (3-5 claims)</span>
															<span>+50% bonus discount</span>
														</div>
														<div className="flex justify-between items-center p-2 bg-yellow-200 rounded">
															<span>Gold (6+ claims)</span>
															<span>+100% bonus discount</span>
														</div>
													</div>
													<p className="text-xs text-gray-600">Tiers automatically increase discount value</p>
												</div>
											)}

											{/* Usage Type Info */}
											<div className="p-3 bg-gray-50 rounded-lg">
												<div className="flex items-start space-x-2">
													<Info className="h-4 w-4 text-blue-600 mt-0.5" />
													<div className="text-sm">
														{newOffer.usage_type === UsageType.SINGLE_USE && (
															<p>Students can claim this offer once. Perfect for exclusive deals.</p>
														)}
														{newOffer.usage_type === UsageType.MULTI_USE && (
															<p>Students can claim up to {newOffer.max_claims_per_user} times. Great for building customer loyalty.</p>
														)}
														{newOffer.usage_type === UsageType.UNLIMITED && (
															<p>No limits on claims. Ideal for daily deals or frequent promotions.</p>
														)}
														{newOffer.usage_type === UsageType.TIERED && (
															<p>Discount value increases with usage frequency. Encourages repeat business.</p>
														)}
													</div>
												</div>
											</div>
										</div>
									</Card>
								</div>
							</div>
						)}

						{/* Step 4 (discount offers): Redemption Options */}
						{activeStep.id === 'redemption' && (
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="redemptionType">Redemption Type*</Label>
										<Select
											value={newOffer.redemptionType || 'both'}
											onValueChange={(value) => setNewOffer({ ...newOffer, redemptionType: value })}
										>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="in-store">In-Store Only</SelectItem>
												<SelectItem value="online">Online Only</SelectItem>
												<SelectItem value="both">Both In-Store and Online</SelectItem>
											</SelectContent>
										</Select>
									</div>
									<div className="space-y-2">
										<Label htmlFor="couponLimit">Coupon Limit*</Label>
										<Input
											type="number"
											min="1"
											value={newOffer.coupons?.total || 0}
											onChange={(e) => setNewOffer({
												...newOffer,
												coupons: { ...newOffer.coupons, total: Number(e.target.value) }
											})}
											placeholder="100"
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="validity">Offer Validity*</Label>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="startDate">Start Date</Label>
												<DatePicker
													selected={newOffer.startDate ? new Date(newOffer.startDate) : new Date()}
													onChange={(date) => setNewOffer({ ...newOffer, startDate: date })}
												/>
											</div>
											<div>
												<Label htmlFor="endDate">End Date</Label>
												<DatePicker
													selected={newOffer.endDate ? new Date(newOffer.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
													onChange={(date) => setNewOffer({ ...newOffer, endDate: date })}
													minDate={newOffer.startDate ? new Date(newOffer.startDate) : new Date()}
												/>
											</div>
										</div>
									</div>
								</div>
								<div className="space-y-4 max-h-full overflow-y-auto">
									<div className="space-y-2">
										<Label>Applicable Stores</Label>
										{merchant?.stores?.length > 0 ? (
											<div className="border rounded-md p-4 flex items-center space-x-2">
												{/* Select all stores */}
												<input
													type="checkbox"
													id="select-all"
													checked={merchant?.stores?.length ? newOffer.stores?.length === merchant.stores.length : false}
													onChange={(e) => {
														if (e.target.checked) {
															setNewOffer({ ...newOffer, stores: merchant?.stores?.map(store => store.id) || [] });
														} else {
															setNewOffer({ ...newOffer, stores: [] });
														}
													}}
												/>
												<Label htmlFor='select-all'>Select All</Label>
											</div>
										) : newOffer.stores.length <= 0 && (
											<p className="text-xs text-blue-500">No stores selected. Coupons will be redeemable at all stores or online</p>
										)}
										<div className="border rounded-md p-4">
											{merchant?.stores?.length ? (
												merchant.stores.map(store => (
													<div key={store.id} className="flex items-center space-x-2 mb-2">
														<input
															type="checkbox"
															id={`store-${store.id}`}
															checked={newOffer.stores?.includes(store.id) || false}
															onChange={(e) => {
																const stores = newOffer.stores || [];
																if (e.target.checked) {
																	setNewOffer({ ...newOffer, stores: [...stores, store.id] });
																} else {
																	setNewOffer({ ...newOffer, stores: stores.filter(id => id !== store.id) });
																}
															}}
														/>
														<Label htmlFor={`store-${store.id}`}>{store.name} - {store.location}</Label>
													</div>
												))
											) : (
												<div className="text-center w-full flex flex-col items-center">

													<p className="text-sm text-gray-500 mb-4">No stores added yet</p>
													<Button
														className="mt-2 w-fit"
														onClick={() => navigate('/stores')}
													>
														<Plus className="h-6 w-6 text-gray-400" />
														Add Stores
													</Button>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Step 3 (event offers): Registration Options */}
						{activeStep.id === 'registration' && (
							<div className="grid grid-cols-2 gap-6">
								<div className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="registrationLimit">Registration Limit*</Label>
										<Input
											id="registrationLimit"
											type="number"
											min="1"
											value={newOffer.coupons?.total || 0}
											onChange={(e) => setNewOffer({
												...newOffer,
												coupons: { ...newOffer.coupons, total: Number(e.target.value) }
											})}
											placeholder="100"
										/>
										<p className="text-xs text-gray-600">
											How many students can register before the event is full.
										</p>
									</div>
									<div className="space-y-2">
										<Label htmlFor="registrationWindow">Registration Window*</Label>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<Label htmlFor="eventStartDate">Opens</Label>
												<DatePicker
													selected={newOffer.startDate ? new Date(newOffer.startDate) : new Date()}
													onChange={(date) => setNewOffer({ ...newOffer, startDate: date })}
												/>
											</div>
											<div>
												<Label htmlFor="eventEndDate">Closes</Label>
												<DatePicker
													selected={newOffer.endDate ? new Date(newOffer.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
													onChange={(date) => setNewOffer({ ...newOffer, endDate: date })}
													minDate={newOffer.startDate ? new Date(newOffer.startDate) : new Date()}
												/>
											</div>
										</div>
										<p className="text-xs text-gray-600">
											Students keep access to the event link until registration closes.
										</p>
									</div>
								</div>
								<div className="space-y-4">
									<Card className="p-4">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-sm text-gray-500">Seats available</p>
												<p className="text-xl font-semibold">{newOffer.coupons?.total || 0}</p>
											</div>
											<Users className="h-8 w-8 text-indigo-500" />
										</div>
										<p className="text-xs text-gray-500 mt-2">
											Each student can register once, so this is your headcount cap.
										</p>
									</Card>
								</div>
							</div>
						)}

						{/* Visuals & Branding */}
						{activeStep.id === 'visuals' && (
							<div className="space-y-6">
								<div className="space-y-2">
									<Label>Offer Preview</Label>
									<Card className="p-4">
										<div className="flex items-start space-x-4">
											<div className="w-32 h-32 bg-gray-200 rounded-md overflow-hidden">
												{newOffer.coverImage ? (
													<img
														src={newOffer.coverImage}
														alt="Offer preview"
														className="w-full h-full object-cover"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center text-gray-500">
														No image
													</div>
												)}
											</div>
											<div className="flex-1">
												<h3 className="font-semibold text-lg">{newOffer.title || 'Your Offer Title'}</h3>
												<p className="text-gray-600 text-sm mt-1">
													{newOffer.description || 'Offer description will appear here'}
												</p>
												<div className="mt-2">
													<Badge variant="default">
														{isEventOffer
															? 'EVENT'
															: newOffer.discountType === 'percentage'
																? `${newOffer.discountValue || 0}% OFF`
																: newOffer.discountType === 'fixed_amount'
																	? `$${newOffer.discountValue || 0} OFF`
																	: newOffer.discountType === 'buy_one_get_one'
																		? 'BUY 1 GET 1'
																		: 'FREE ITEM'}
													</Badge>
												</div>
											</div>
										</div>
									</Card>
								</div>
								<div className="space-y-2">
									<Label>Tags (Optional)</Label>
									<div className="flex flex-wrap gap-2">
										{['student', 'discount', 'food', 'clothing', 'tech'].map(tag => (
											<Badge
												key={tag}
												variant={newOffer.tags?.includes(tag) ? 'default' : 'outline'}
												className="cursor-pointer"
												onClick={() => {
													const tags = newOffer.tags || [];
													if (tags.includes(tag)) {
														setNewOffer({ ...newOffer, tags: tags.filter(t => t !== tag) });
													} else {
														setNewOffer({ ...newOffer, tags: [...tags, tag] });
													}
												}}
											>
												{tag}
											</Badge>
										))}
									</div>
								</div>
							</div>
						)}

						{/* Review & Publish */}
						{activeStep.id === 'review' && (
							<div className="space-y-6">
								<div className="grid grid-cols-2 gap-6">
									<div className="space-y-4">
										<h4 className="font-semibold">Offer Details</h4>
										<div className="space-y-2">
											<p className="text-sm text-gray-500">Title</p>
											<p>{newOffer.title}</p>
										</div>
										<div className="space-y-2">
											<p className="text-sm text-gray-500">Description</p>
											<p>{newOffer.description}</p>
										</div>
										<div className="space-y-2">
											<p className="text-sm text-gray-500">Category</p>
											<p>{newOffer.category?.name || 'Not selected'}</p>
										</div>
									</div>
									{isEventOffer ? (
										<>
											<div className="space-y-4">
												<h4 className="font-semibold">Event Access</h4>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Event Link</p>
													<p className="break-all">{newOffer.eventUrl || 'Not set'}</p>
												</div>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Shared with</p>
													<p>Every student who registers, as a link and QR code</p>
												</div>
											</div>
											<div className="space-y-4">
												<h4 className="font-semibold">Registration</h4>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Registration Limit</p>
													<p>{newOffer.coupons?.total || 0} students</p>
												</div>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Per Student</p>
													<p>One registration</p>
												</div>
											</div>
										</>
									) : (
										<>
											<div className="space-y-4">
												<h4 className="font-semibold">Discount Information</h4>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Discount Type</p>
													<p>
														{newOffer.discountType === 'percentage'
															? 'Percentage Off'
															: newOffer.discountType === 'fixed_amount'
																? 'Fixed Amount Off'
																: newOffer.discountType === 'buy_one_get_one'
																	? 'Buy One Get One'
																	: 'Free Item'}
													</p>
												</div>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Discount Value</p>
													<p>
														{newOffer.discountType === 'percentage'
															? `${newOffer.discountValue}%`
															: `$${newOffer.discountValue}`}
													</p>
												</div>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Redemption Type</p>
													<p>
														{newOffer.redemptionType === 'in-store'
															? 'In-Store Only'
															: newOffer.redemptionType === 'online'
																? 'Online Only'
																: 'Both In-Store and Online'}
													</p>
												</div>
											</div>
											<div className="space-y-4">
												<h4 className="font-semibold">Usage Configuration</h4>
												<div className="space-y-2">
													<p className="text-sm text-gray-500">Usage Type</p>
													<p>
														{newOffer.usage_type === UsageType.SINGLE_USE
															? 'One-time Use'
															: newOffer.usage_type === UsageType.MULTI_USE
																? `Multi-use (up to ${newOffer.max_claims_per_user}x)`
																: newOffer.usage_type === UsageType.UNLIMITED
																	? 'Unlimited'
																	: `Tiered Rewards (up to ${newOffer.max_claims_per_user}x)`}
													</p>
												</div>
												{newOffer.cooldown_period_hours && (
													<div className="space-y-2">
														<p className="text-sm text-gray-500">Cooldown Period</p>
														<p>{newOffer.cooldown_period_hours} hours</p>
													</div>
												)}
											</div>
										</>
									)}
								</div>
								<div className="space-y-4">
									<h4 className="font-semibold">{isEventOffer ? 'Registration Window' : 'Validity'}</h4>
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<p className="text-sm text-gray-500">{isEventOffer ? 'Opens' : 'Start Date'}</p>
											<p>{newOffer.startDate?.toLocaleDateString()}</p>
										</div>
										<div className="space-y-2">
											<p className="text-sm text-gray-500">{isEventOffer ? 'Closes' : 'End Date'}</p>
											<p>{newOffer.endDate?.toLocaleDateString()}</p>
										</div>
									</div>
								</div>
								<div className="space-y-2">
									<p className="text-sm text-gray-500">Terms and Conditions</p>
									<p>{newOffer.termsAndConditions || 'None specified'}</p>
								</div>
							</div>
						)}

						<DialogFooter className="mt-6">
							<div className="flex justify-between w-full">
								{currentStep > 0 ? (
									<Button variant="outline" onClick={prevStep}>
										<ChevronLeft className="h-4 w-4 mr-2" />
										Back
									</Button>
								) : (
									<div></div>
								)}
								{currentStep < creationSteps.length - 1 ? (
									<Button
										onClick={nextStep}
										disabled={activeStep.id === 'event-details' && !isEventLink(newOffer.eventUrl)}
									>
										Next
										<ChevronRight className="h-4 w-4 ml-2" />
									</Button>
								) : (
									<Button onClick={handleCreateOffer}>
										{isEventOffer ? 'Publish Event' : 'Publish Offer'}
									</Button>
								)}
							</div>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>

			{/* Analytics Dashboard */}
			<Tabs value={activeTab} onValueChange={(e) => {
				setActiveTab(e as 'overview' | 'offers' | 'analytics');
				query.set('tab', e);
				window.history.replaceState({}, '', `?${query.toString()}`);
			}} className="space-y-6">
				<TabsList className="bg-gray-100 rounded-lg p-1">
					<TabsTrigger value="overview">Overview</TabsTrigger>
					<TabsTrigger value="offers">Offers</TabsTrigger>
					<TabsTrigger value="analytics">Analytics</TabsTrigger>
				</TabsList>

				<TabsContent value="overview">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Offers</CardTitle>
								<Tag className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{offers.length}</div>
								<p className="text-xs text-muted-foreground">
									{offers.filter(o => o.status === 'active').length} active
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
								<DollarSign className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
								<p className="text-xs text-muted-foreground">
									From offer redemptions
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Total Claims</CardTitle>
								<Users className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">{totalClaimed}</div>
								<p className="text-xs text-muted-foreground">
									{totalRedeemed} redeemed ({avgRedemptionRate.toFixed(1)}% rate)
								</p>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
								<CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
								<TrendingUp className="h-4 w-4 text-muted-foreground" />
							</CardHeader>
							<CardContent>
								<div className="text-2xl font-bold">
									{Number(analytics.performanceMetrics.clickThroughRate).toFixed(2)}{analytics.performanceMetrics.clickThroughRate ? '%' : '-'}
								</div>
								<p className="text-xs text-muted-foreground">
									Views to claims conversion
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
						<Card>
							<CardHeader>
								<CardTitle>Redemption Trends</CardTitle>
							</CardHeader>
							<CardContent className="h-80">
								{redemptionTrends.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full">
										<p className="text-gray-500">No data available</p>
										{/* Cta */}
										<Button className="mt-4" onClick={() => navigate('/coupons')}>
											<Plus className="h-4 w-4 mr-2" />
											Redeem Pending Coupons
										</Button>
									</div>
								) : (
									<ResponsiveContainer width="100%" height="100%">
										<BarChart data={redemptionTrends}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis dataKey="name" />
											<YAxis />
											<Tooltip />
											<Legend />
											<Bar dataKey="claimed" fill="#8884d8" name="Claimed" />
											<Bar dataKey="redeemed" fill="#82ca9d" name="Redeemed" />
										</BarChart>
									</ResponsiveContainer>
								)}
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Category Distribution</CardTitle>
							</CardHeader>
							<CardContent className="h-80">
								{categoryDistribution.length === 0 ? (
									<div className="flex flex-col items-center justify-center h-full">
										<p className="text-gray-500">No data available</p>
									</div>
								) : (
									<ResponsiveContainer width="100%" height="100%">
										<PieChart>
											<Pie
												data={categoryDistribution}
												cx="50%"
												cy="50%"
												labelLine={false}
												outerRadius={80}
												fill="#8884d8"
												dataKey="value"
												nameKey="name"
												label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
											>
												{categoryDistribution.map((entry, index) => (
													<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
												))}
											</Pie>
											<Tooltip />
										</PieChart>
									</ResponsiveContainer>
								)}
							</CardContent>
						</Card>
					</div>
				</TabsContent>

				<TabsContent value="offers">
					<div className="flex items-center justify-between mb-6">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<Filter className="h-4 w-4" />
								<Label>Filter by status:</Label>
							</div>
							<Select value={filterStatus} onValueChange={setFilterStatus}>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button variant="outline">
							<Download className="h-4 w-4 mr-2" />
							Export
						</Button>
					</div>

					<Card>
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
										<div className="flex items-center">
											Offer
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('category.name')}>
										<div className="flex items-center">
											Category
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('discountValue')}>
										<div className="flex items-center">
											Discount
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('usage_type')}>
										<div className="flex items-center">
											Usage Type
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('coupons.claimed')}>
										<div className="flex items-center">
											Claims
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('revenueGenerated')}>
										<div className="flex items-center">
											Revenue
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
										<div className="flex items-center">
											Status
											<ArrowUpDown className="ml-2 h-4 w-4" />
										</div>
									</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{filteredOffers.length === 0 && (
									// Engaging message when no offers are found with CTA to create one
									<TableRow>
										<TableCell colSpan={8} className="text-center py-10">
											<div className="flex flex-col items-center space-y-4">
												<p className="text-gray-500">No offers found</p>

											</div>
										</TableCell>
									</TableRow>
								)}
								{
									filteredOffers.map((offer) => (
										<TableRow key={offer.id}>
											<TableCell className="font-medium">
												<div className="flex items-center space-x-3">
													<div className="w-10 h-10 rounded-md overflow-hidden">
														<img
															src={offer.coverImage}
															alt={offer.title}
															className="w-full h-full object-cover"
														/>
													</div>
													<div>
														<div className="flex items-center space-x-2">
															<p>{offer.title}</p>
															{offer.offerKind === OfferKind.EVENT && (
																<Badge variant="secondary" className="text-xs">
																	<Video className="h-3 w-3 mr-1" />
																	Event
																</Badge>
															)}
														</div>
														<p className="text-xs text-gray-500">
															{new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>{offer.category?.name}</TableCell>
											<TableCell>
												{offer.offerKind === OfferKind.EVENT ? (
													<a
														href={offer.eventUrl}
														target="_blank"
														rel="noreferrer"
														className="text-sm text-blue-600 hover:underline inline-flex items-center max-w-[12rem]"
														title={offer.eventUrl}
													>
														<Link2 className="h-3 w-3 mr-1 shrink-0" />
														<span className="truncate">{offer.eventUrl}</span>
													</a>
												) : offer.discountType === 'percentage'
													? `${offer.discountValue}%`
													: `$${offer.discountValue}`}
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													{offer.usage_type === UsageType.SINGLE_USE ? (
														<>
															<Users className="h-4 w-4 text-blue-600" />
															<span className="text-sm">One-time</span>
														</>
													) : offer.usage_type === UsageType.MULTI_USE ? (
														<>
															<Repeat className="h-4 w-4 text-green-600" />
															<span className="text-sm">{offer.max_claims_per_user}x</span>
														</>
													) : offer.usage_type === UsageType.UNLIMITED ? (
														<>
															<Infinity className="h-4 w-4 text-purple-600" />
															<span className="text-sm">Unlimited</span>
														</>
													) : offer.usage_type === UsageType.TIERED ? (
														<>
															<Trophy className="h-4 w-4 text-yellow-600" />
															<span className="text-sm">Tiered</span>
														</>
													) : (
														<>
															<Users className="h-4 w-4 text-blue-600" />
															<span className="text-sm">One-time</span>
														</>
													)}
													{offer.cooldown_period_hours && (
														<Badge variant="outline" className="text-xs">
															<Clock className="h-3 w-3 mr-1" />
															{offer.cooldown_period_hours}h
														</Badge>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center space-x-2">
													<span>{offer.coupons?.claimed || 0}/{offer.coupons?.total}</span>
													<Progress
														value={(offer.coupons?.claimed / offer.coupons?.total) * 100 || 0}
														className="h-2 w-16"
													/>
												</div>
											</TableCell>
											<TableCell>${offer.revenueGenerated?.toLocaleString() || 0}</TableCell>
											<TableCell>
												<Badge variant={
													offer.status === 'active' ? 'default' :
														offer.status === 'expired' ? 'destructive' : 'secondary'
												}>
													{offer.status}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex space-x-2">
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleEditOffer(offer)}
													>
														<Edit className="h-4 w-4" />
													</Button>
													<Button size="sm" variant="outline" onClick={() => openModal({
														title: 'Delete Offer',
														message: `Are you sure you want to delete the offer "${offer.title}"? This action cannot be undone.`,
														confirmText: 'Delete',
														cancelText: 'Cancel',
														variant: 'destructive',
														onConfirm: () => handleDeleteOffer(offer.id),
														onClose: closeModal,
													})
													}>
														<Trash2 className="h-3 w-3" />
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))}
							</TableBody>
						</Table>
					</Card>
				</TabsContent>

				<TabsContent value="analytics">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<Card className="lg:col-span-2">
							<CardHeader>
								<CardTitle>Top Performing Offers</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									{topPerformingOffers.map((offer, index) => (
										<div key={index} className="flex items-center">
											<div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-4">
												<span className="font-medium">{index + 1}</span>
											</div>
											<div className="flex-1">
												<p className="font-medium">{offer.title}</p>
												<div className="flex items-center space-x-4 text-sm text-gray-500">
													<span>{offer.claims} claims</span>
													<span>${offer.revenue?.toLocaleString()} revenue</span>
													<span>{offer.conversionRate?.toFixed(1)}% conversion</span>
												</div>
											</div>
											<Button variant="ghost" size="icon">
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Performance Metrics</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-6">
									<div>
										<p className="text-sm text-gray-500 mb-2">Total Views</p>
										<p className="text-2xl font-bold">{analytics.performanceMetrics.totalViews}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500 mb-2">Unique Visitors</p>
										<p className="text-2xl font-bold">{analytics.performanceMetrics.uniqueVisitors}</p>
									</div>
									<div>
										<p className="text-sm text-gray-500 mb-2">Click Through Rate</p>
										<p className="text-2xl font-bold">{Number(analytics.performanceMetrics.clickThroughRate).toFixed(2)}%</p>
									</div>
									<div>
										<p className="text-sm text-gray-500 mb-2">Average Redemption Time</p>
										<p className="text-2xl font-bold">{analytics.performanceMetrics.avgRedemptionTime}</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>
				</TabsContent>
			</Tabs>

			{/* Edit Modal */}
			<Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editingEventOffer ? 'Edit Event' : 'Edit Offer'}
						</DialogTitle>
						<DialogDescription>
							{editingEventOffer
								? 'Update your event details. A new link replaces the old one for students who already registered.'
								: 'Update your offer details.'}
						</DialogDescription>
					</DialogHeader>
					<div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[75vh]">
						<div className="space-y-2">
							<Label htmlFor="edit-title">{editingEventOffer ? 'Event Title' : 'Offer Title'}</Label>
							<Input
								id="edit-title"
								value={selectedOffer?.title || ''}
								onChange={(e) => setSelectedOffer({ ...selectedOffer, title: e.target.value })}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-category">Category</Label>
							<Select
								value={selectedOffer?.category?.id || ''}
								onValueChange={(value) => {
									const selectedCategory = categories.find((cat) => cat.id === value);
									setSelectedOffer({
										...selectedOffer,
										category: selectedCategory
											? { id: selectedCategory.id, name: selectedCategory.name }
											: { id: value, name: '' }
									});
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{categories.map((category) => (
										<SelectItem key={category.id} value={category.id}>
											{category.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label htmlFor="edit-description">Description</Label>
							<Textarea
								id="edit-description"
								value={selectedOffer?.description || ''}
								onChange={(e) => setSelectedOffer({ ...selectedOffer, description: e.target.value })}
								rows={3}
							/>
						</div>
						<div className="space-y-4 row-span-4">
							<div className="space-y-2">
								<Label>Cover Image</Label>
								<div className="border-2 border-dashed rounded-lg p-4 flex flex-col items-center">
									{selectedOffer?.coverImage ? (
										<img
											src={selectedOffer?.coverImage}
											alt="Preview"
											className="w-full h-48 object-cover rounded-md"
										/>
									) : (
										<div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
											<span className="text-gray-500">No image selected</span>
										</div>
									)}
									<Input
										type="file"
										accept="image/*"
										onChange={handleEditOfferImageUpload}
										className="mt-4"
									/>
								</div>
							</div>
						</div>
						{editingEventOffer ? (
							<div className="space-y-2 col-span-2">
								<Label htmlFor="edit-eventUrl">Event Link</Label>
								<div className="flex items-center space-x-2">
									<Link2 className="h-4 w-4 text-gray-400" />
									<Input
										id="edit-eventUrl"
										type="url"
										value={selectedOffer?.eventUrl || ''}
										onChange={(e) => setSelectedOffer({ ...selectedOffer, eventUrl: e.target.value })}
										placeholder="https://meet.google.com/abc-defg-hij"
									/>
								</div>
								{selectedOffer?.eventUrl && !isEventLink(selectedOffer.eventUrl) && (
									<p className="text-xs text-red-600">
										Enter a full link starting with http:// or https://
									</p>
								)}
							</div>
						) : (
							<>
								<div className="space-y-2">
									<Label htmlFor="edit-discountType">Discount Type</Label>
									<Select
										value={selectedOffer?.discountType || ''}
										onValueChange={(value) => setSelectedOffer({ ...selectedOffer, discountType: value as OfferType })}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="percentage">Percentage</SelectItem>
											<SelectItem value="fixed_amount">Fixed Amount</SelectItem>
											<SelectItem value="buy_one_get_one">Buy One Get One</SelectItem>
											<SelectItem value="free_item">Free Item</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="edit-discountValue">Discount Value</Label>
									<Input
										id="edit-discountValue"
										type="number"
										value={selectedOffer?.discountValue || 0}
										onChange={(e) => setSelectedOffer({ ...selectedOffer, discountValue: Number(e.target.value) })}
									/>
								</div>
							</>
						)}
						<div className="space-y-2">
							<Label htmlFor="edit-status">Status</Label>
							<Select
								value={selectedOffer?.status || ''}
								onValueChange={(value) => setSelectedOffer({ ...selectedOffer, status: value })}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
									<SelectItem value="expired">Expired</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Search tags</Label>
							<div className="flex flex-wrap gap-2">
								{selectedOffer?.tags?.map(tag => (
									<Badge
										key={tag}
										variant={selectedOffer.tags?.includes(tag) ? 'default' : 'outline'}
										className="cursor-pointer"
										onClick={() => {
											const tags = selectedOffer.tags || [];
											if (tags.includes(tag)) {
												setSelectedOffer({ ...selectedOffer, tags: tags.filter(t => t !== tag) });
											} else {
												setSelectedOffer({ ...selectedOffer, tags: [...tags, tag] });
											}
										}}
									>
										{tag}
									</Badge>
								))}
							</div>
						</div>
						<div className="space-y-2">
							<Label>Recommended tags</Label>
							<div className="flex flex-wrap gap-2">
								{recommendedTags?.filter(tag => !selectedOffer?.tags?.includes(tag))?.map(tag => (
									<Badge
										key={tag}
										variant={selectedOffer?.tags?.includes(tag) ? 'default' : 'outline'}
										className="cursor-pointer"
										onClick={() => {
											const tags = selectedOffer.tags || [];
											if (tags.includes(tag)) {
												setSelectedOffer({ ...selectedOffer, tags: tags.filter(t => t !== tag) });
											} else {
												setSelectedOffer({ ...selectedOffer, tags: [...tags, tag] });
											}
										}}
									>
										{selectedOffer?.tags?.includes(tag) ? (
											<Check className="h-3 w-3 mr-1" />
										) : (
											<Plus className="h-3 w-3 mr-1" />
										)}
										{tag}
									</Badge>
								))}
							</div>
						</div>
					</div>
					<DialogFooter>
						<Button disabled={updatingOffer} variant="outline" onClick={() => setIsEditModalOpen(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateOffer}>
							{updatingOffer ? 'Updating...' : editingEventOffer ? 'Update Event' : 'Update Offer'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};