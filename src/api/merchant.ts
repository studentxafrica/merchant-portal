import axiosInstance from "./axios";

export const fetchMerchantDashboard = async () => {
	const response = await axiosInstance.get(`/user/merchant/dashboard`, {
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (response.status !== 200) {
		throw new Error('Failed to fetch merchant dashboard');
	}

	return response.data;
};