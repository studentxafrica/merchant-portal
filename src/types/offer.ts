export enum OfferType {
	PERCENTAGE = "percentage",
	FIXED_AMOUNT = "fixed_amount",
	BUY_ONE_GET_ONE = "buy_one_get_one",
	FREE_ITEM = "free_item"
}

/** What a student gets when they claim: a discount code, or access to an event. */
export enum OfferKind {
	DISCOUNT = "discount",
	EVENT = "event"
}

export enum UsageType {
	SINGLE_USE = "single_use",
	MULTI_USE = "multi_use",
	UNLIMITED = "unlimited",
	TIERED = "tiered"
}

export interface TierRule {
	min_usage: number;
	discount_multiplier: number;
	name: string;
}

export interface TierProgression {
	tiers: TierRule[];
}

export interface UsageAnalytics {
	total_claims: number;
	total_redemptions: number;
	unique_users: number;
	average_claims_per_user: number;
	redemption_rate: number;
	peak_usage_hours: number[];
	top_user_segments: Array<{
		segment: string;
		usage_count: number;
		percentage: number;
	}>;
}

export interface Offer {
	id: string;
	title: string;
	description: string;
	slug: string;
	coverImage: string;
	offerKind?: OfferKind;
	/** Where the event happens. Event offers only. */
	eventUrl?: string;
	discountType: OfferType;
	discountValue: number;
	currency: string;
	merchant: {
		id: string;
		name: string;
		logo: string;
		website: string;
		approved: boolean;
	};
	coupons: {
		total: number;
		claimed: number;
		redeemed: number;
	}
	status: string;
	startDate: Date;
	endDate: Date;
	termsAndConditions: string;
	// New flexible usage system fields
	usage_type?: UsageType;
	max_claims_per_user?: number;
	cooldown_period_hours?: number;
	tier_progression?: TierProgression;
	// Analytics data for merchant dashboard
	usage_analytics?: UsageAnalytics;
}