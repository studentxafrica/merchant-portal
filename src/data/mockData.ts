
export const mockCategories = [
  { id: '1', name: 'Food & Dining', slug: 'food-dining', offer_count: 25, merchant_count: 12 },
  { id: '2', name: 'Fashion', slug: 'fashion', offer_count: 18, merchant_count: 8 },
  { id: '3', name: 'Electronics', slug: 'electronics', offer_count: 15, merchant_count: 6 },
  { id: '4', name: 'Health & Beauty', slug: 'health-beauty', offer_count: 12, merchant_count: 5 },
  { id: '5', name: 'Entertainment', slug: 'entertainment', offer_count: 20, merchant_count: 10 },
];

export const mockMerchants = [
  {
    id: 'merchant-1',
    email: 'pizza@example.com',
    name: 'Tony\'s Pizza Palace',
    logo: null,
    website: 'https://tonysplaza.com',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    country: 'USA',
    category_id: '1',
    approved: true,
    email_verified: true,
  },
  {
    id: 'merchant-2',
    email: 'fashion@example.com',
    name: 'StyleHub Boutique',
    logo: null,
    website: 'https://stylehub.com',
    phone: '+1234567891',
    address: '456 Fashion Ave',
    city: 'Los Angeles',
    country: 'USA',
    category_id: '2',
    approved: false,
    email_verified: true,
  },
  {
    id: 'merchant-3',
    email: 'tech@example.com',
    name: 'TechGear Pro',
    logo: null,
    website: 'https://techgearpro.com',
    phone: '+1234567892',
    address: '789 Tech Blvd',
    city: 'San Francisco',
    country: 'USA',
    category_id: '3',
    approved: true,
    email_verified: true,
  }
];

export const mockOffers = [
  {
    id: 'offer-1',
    merchant_id: undefined,
    category_id: '1',
    title: '50% Off Large Pizza',
    description: 'Get 50% off any large pizza when you order online',
    slug: '50-off-large-pizza',
    cover_image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    discount_type: 'percentage',
    discount_value: 50,
    currency: 'USD',
    coupon_limit: 100,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    terms_and_conditions: 'Valid for online orders only. Cannot be combined with other offers.',
    claimed_count: 45,
    revenue_generated: 2250,
  },
  {
    id: 'offer-2',
    merchant_id: undefined,
    category_id: '1',
    title: 'Free Garlic Bread',
    description: 'Free garlic bread with any pasta order',
    slug: 'free-garlic-bread',
    cover_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    discount_type: 'free_item',
    discount_value: 0,
    currency: 'USD',
    coupon_limit: 50,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    terms_and_conditions: 'Valid with pasta orders over $15.',
    claimed_count: 23,
    revenue_generated: 1150,
  },
  {
    id: 'offer-3',
    merchant_id: 'merchant-2',
    category_id: '2',
    title: '30% Off Summer Collection',
    description: 'Get 30% off all summer clothing items',
    slug: '30-off-summer-collection',
    cover_image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
    discount_type: 'percentage',
    discount_value: 30,
    currency: 'USD',
    coupon_limit: 200,
    status: 'active',
    start_date: '2024-05-01',
    end_date: '2024-08-31',
    terms_and_conditions: 'Valid on regular priced items only.',
    claimed_count: 67,
    revenue_generated: 3350,
  }
];

export const mockCoupons = [
  {
    id: 'coupon-1',
    offer_id: 'offer-1',
    consumer_id: 'consumer-1',
    merchant_id: undefined,
    coupon_code: 'PIZZA50-ABC123',
    status: 'redeemed',
    redeemed_at: '2024-05-20T14:30:00Z',
    expiry_date: '2024-12-31T23:59:59Z',
    consumer_name: 'John Doe',
    consumer_email: 'john@student.edu',
    revenue_amount: 25.00,
  },
  {
    id: 'coupon-2',
    offer_id: 'offer-1',
    consumer_id: 'consumer-2',
    merchant_id: undefined,
    coupon_code: 'PIZZA50-DEF456',
    status: 'active',
    redeemed_at: null,
    expiry_date: '2024-12-31T23:59:59Z',
    consumer_name: 'Jane Smith',
    consumer_email: 'jane@student.edu',
    revenue_amount: 0,
  },
  {
    id: 'coupon-3',
    offer_id: 'offer-2',
    consumer_id: 'consumer-3',
    merchant_id: 'merchant-1',
    coupon_code: 'GARLIC-GHI789',
    status: 'redeemed',
    redeemed_at: '2024-05-18T19:15:00Z',
    expiry_date: '2024-06-30T23:59:59Z',
    consumer_name: 'Mike Johnson',
    consumer_email: 'mike@student.edu',
    revenue_amount: 18.50,
  }
];

export const mockStores = [
  {
    id: 'store-1',
    merchant_id: 'merchant-1',
    name: 'Downtown Location',
    location: '123 Main St, New York, NY 10001',
    contact_email: 'downtown@tonysplaza.com',
    contact_phone: '+1234567890',
    manager_name: 'Sarah Wilson',
  },
  {
    id: 'store-2',
    merchant_id: 'merchant-1',
    name: 'University Campus',
    location: '456 Campus Ave, New York, NY 10003',
    contact_email: 'campus@tonysplaza.com',
    contact_phone: '+1234567891',
    manager_name: 'Tom Rodriguez',
  }
];

export const mockRevenue = [
  {
    id: 'rev-1',
    merchant_id: 'merchant-1',
    offer_id: 'offer-1',
    coupon_id: 'coupon-1',
    amount: 25.00,
    date: '2024-05-20',
    type: 'coupon_redemption',
  },
  {
    id: 'rev-2',
    merchant_id: 'merchant-1',
    offer_id: 'offer-2',
    coupon_id: 'coupon-3',
    amount: 18.50,
    date: '2024-05-18',
    type: 'coupon_redemption',
  }
];

export const mockConsumers = [
  {
    id: "consumer1",
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    school: "State University",
    graduation_year: "2024",
    major: "Computer Science",
    // ... other fields
  },
  {
    id: "consumer2",
    first_name: "Jane",
    last_name: "Smith",
    email: "example@mail.com",
    school: "City College",
    graduation_year: "2025",
    major: "Business Administration",
    // ... other fields
  },
  {
    id: "consumer3",
    first_name: "Alice",
    last_name: "Johnson",
    email: "tex@example.com",
    school: "Tech Institute",
    graduation_year: "2023",
    major: "Information Technology",
    // ... other fields
  }
];