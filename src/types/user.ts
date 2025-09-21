import { Store } from "./store";

export enum VerificationStatus {
	PENDING = "pending",
	VERIFIED = "verified",
	REJECTED = "rejected"
}

export enum UserRole {
	STUDENT = "consumer",
	PROVIDER = "merchant",
	ADMIN = "admin"
}

export type User = {
	id: string;
	role: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Consumer extends User {
	first_name: string;
	last_name: string;
	studentId?: string;
	university?: string;
	verificationStatus: VerificationStatus;
	savedCoupons: string[];
}

export interface Merchant extends User {
	name: string;
	logo?: string;
	website?: string;
	city?: string;
	country?: string;
	zipCode?: string;
	isApproved?: boolean;
	emailVerified?: boolean;
	rating?: number;
	categories: string[];
	stores?: Store[];
}