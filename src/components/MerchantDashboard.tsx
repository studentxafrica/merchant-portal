import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  Tag,
  Ticket,
  Users,
  TrendingUp,
  TrendingDown,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  PieChart as PieChartIcon,
  MapPin,
  School,
  GraduationCap,
  Calendar,
  BarChart2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Pie, Cell, PieChart } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { fetchMerchantDashboard } from '@/api/merchant';

export const MerchantDashboard = ({ merchant }) => {
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['merchantDashboard'],
    queryFn: () => fetchMerchantDashboard(),
    enabled: !!merchant,
    refetchOnWindowFocus: false
  });

  console.log('Merchant prop:', merchant);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (isError) return <div>Error loading dashboard data</div>;
  if (!dashboardData) return null;

  // Extract data from response
  const {
    keyMetrics,
    offerPerformance,
    customerSegmentation,
    redemptionTimeline,
    discountEffectiveness
  } = dashboardData;

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Coupon Platform - Merchant Dashboard</title>
        <meta name="description" content="Track your coupon performance and customer engagement" />
      </Helmet>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Performance Dashboard</h1>
          <p className="text-gray-600 mt-1">Analytics for {merchant?.name}'s coupon campaigns</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={() => navigate('/offers')}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Offer
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.activeOffers}</div>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.totalOffers} total offers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coupons Issued</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.totalCoupons}</div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span><CheckCircle className="h-3 w-3 inline mr-1 text-green-500" /> {keyMetrics.redeemedCoupons} redeemed</span>
              <span><Clock className="h-3 w-3 inline mr-1 text-yellow-500" /> {keyMetrics.activeCoupons} active</span>
              <span><AlertCircle className="h-3 w-3 inline mr-1 text-gray-500" /> {keyMetrics.expiredCoupons} expired</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.redemptionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Industry average: 65-75%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{keyMetrics.uniqueCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {keyMetrics.repeatCustomers} repeat customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offer Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Offer Performance</CardTitle>
            <CardDescription>Your top performing coupon offers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {offerPerformance.slice(0, 5).map((offer) => (
                <div key={offer.id} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="font-medium">{offer.title}</span>
                    <span className="text-sm text-gray-600">
                      {offer.discountValue}{offer.discountType === 'percentage' ? '%' : '$'} off • {offer.redeemed}/{offer.total} redeemed
                    </span>
                  </div>
                  <Progress value={offer.redemptionRate} className="h-2" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/offers')}>
              <Eye className="h-4 w-4 mr-2" />
              View All Offers
            </Button>
          </CardContent>
        </Card>

        {/* Customer Segmentation */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segmentation</CardTitle>
            <CardDescription>Top schools using your coupons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={customerSegmentation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {customerSegmentation.map((_, index: number) => (
                      <Cell
                        key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(name, value) => [name, value]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Secondary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Redemption Patterns */}
        <Card>
          <CardHeader>
            <CardTitle>Redemption Patterns</CardTitle>
            <CardDescription>When customers redeem coupons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={redemptionTimeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip formatter={(value) => [value, 'Redemptions']} />
                  <Bar dataKey="redemptions" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Discount Type Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Discount Effectiveness</CardTitle>
            <CardDescription>Redemption rates by discount type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discountEffectiveness}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Redemption Rate']} />
                  <Bar dataKey="redemptionRate" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};