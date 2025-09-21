import { Offer } from "./offer";
import { Consumer } from "./user";

export enum CouponStatus {
  ACTIVE = "active",
  EXPIRED = "expired",
  REDEEMED = "redeemed",
  INACTIVE = "inactive"
}

export interface Coupon {
	code: string;
	qrCode: string;
	expiryDate: string;
	status: CouponStatus;
	redeemed: boolean;
	redeemedAt: string | null;
	offer: Offer;
	consumer: Consumer;
}