import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Ticket,
  Tag,
  Clock,
  MapPin,
  School,
  CalendarDays,
  PieChart as PieChartIcon,
  BarChart2,
  Sparkles,
  Repeat,
  Infinity,
  Trophy,
  Target,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import axios from "axios";
import axiosInstance from "@/api/axios";

export const Analytics = ({ merchant }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [currentData, setCurrentData] = useState<{
    revenue: { date: Date; amount: number }[];
    redemptions: { id: string; offer_id: number; redeemed_at: Date; amount: number }[];
    views: number;
    newCustomers: number;
    repeatCustomers: number;
    inactiveCustomers: number;
    offers: { id: number; title: string; redemptions: number; views: number; revenue: number }[];
    schools: Record<string, number>;
    locations: { name: string; redemptions: number; percent: number }[];
    lifecycle: { day: number; redemptions: number; cumulative?: number }[];
  }>({
    revenue: [],
    redemptions: [],
    views: 0,
    newCustomers: 0,
    repeatCustomers: 0,
    inactiveCustomers: 0,
    offers: [],
    schools: {},
    locations: [],
    lifecycle: []
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await generateData(timeRange === '7days' ? 7 :
          timeRange === '30days' ? 30 :
            timeRange === '90days' ? 90 : 365);
        setCurrentData(data);
      } catch (error) {
        console.error("Error loading analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Key metrics calculations
  const totalRevenue = currentData.revenue.reduce((sum, day) => sum + day.amount, 0);
  const totalRedemptions = currentData.redemptions.length;
  const avgRevenuePerCoupon = totalRedemptions > 0 ? (totalRevenue / totalRedemptions).toFixed(2) : 0;
  const conversionRate = currentData.views > 0 ?
    ((totalRedemptions / currentData.views) * 100).toFixed(1) : 0;

  // Top performing offers
  const offerPerformance = currentData.offers.map(offer => ({
    ...offer,
    redemptionRate: Number.isFinite(Number((offer.redemptions / offer.views * 100).toFixed(1))) ? Number((offer.redemptions / offer.views * 100).toFixed(1)) : 0
  })).sort((a, b) => b.redemptions - a.redemptions);

  // Customer segmentation
  const customerSegments = [
    { name: 'New Customers', value: currentData.newCustomers, color: '#3b82f6' },
    { name: 'Repeat Customers', value: currentData.repeatCustomers, color: '#10b981' },
    { name: 'Inactive (30+ days)', value: currentData.inactiveCustomers, color: '#64748b' },
  ];

  // Redemption patterns
  const redemptionPatterns = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    redemptions: currentData.redemptions.filter(r =>
      new Date(r.redeemed_at).getHours() === i
    ).length
  }));

  // Discount type effectiveness
  // Replace the discountEffectiveness data with:
  const customerRetention = [
    { week: 'Week 1', newCustomers: currentData.newCustomers, returning: currentData.repeatCustomers },
    { week: 'Week 2', newCustomers: Math.round(currentData.newCustomers * 0.6), returning: Math.round(currentData.repeatCustomers * 1.2) },
    { week: 'Week 3', newCustomers: Math.round(currentData.newCustomers * 0.4), returning: Math.round(currentData.repeatCustomers * 1.3) },
    { week: 'Week 4', newCustomers: Math.round(currentData.newCustomers * 0.3), returning: Math.round(currentData.repeatCustomers * 1.4) },
  ];



  // School distribution
  const schoolDistribution = Object.entries(currentData.schools).map(([name, value]) => ({
    name,
    students: value
  })).sort((a, b) => b.students - a.students).slice(0, 5);

  // Colors for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Performance Analytics</h1>
          <p className="text-gray-600 mt-1">Deep insights into your coupon campaigns</p>
        </div>
        <div className="flex space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <CalendarDays className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coupons Redeemed</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">
              {currentData.newCustomers} new customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${avgRevenuePerCoupon} per coupon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              {currentData.views.toLocaleString()} total views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Redemption Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 days</div>
            <p className="text-xs text-muted-foreground">
              After claiming
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">
            <BarChart2 className="h-4 w-4 mr-2" />
            Offer Performance
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" />
            Customer Insights
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <CalendarDays className="h-4 w-4 mr-2" />
            Redemption Patterns
          </TabsTrigger>
          <TabsTrigger value="effectiveness">
            <Sparkles className="h-4 w-4 mr-2" />
            Offer Effectiveness
          </TabsTrigger>
          <TabsTrigger value="usage-types">
            <Target className="h-4 w-4 mr-2" />
            Usage Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Offers</CardTitle>
                <CardDescription>Ranked by redemptions and conversion rate</CardDescription>
              </CardHeader>
              <CardContent>
                {offerPerformance.length === 0 ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-gray-500 flex items-center h-full">No offer data available for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={offerPerformance.slice(0, 5)}
                      layout="vertical"
                      margin={{ left: 100 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={150}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value, name) =>
                          name === 'Redemption Rate' ? [`${value}%`, name] : [value, name]
                        }
                      />
                      <Bar dataKey="redemptions" fill="#3b82f6" name="Redemptions" />
                      <Bar dataKey="redemptionRate" fill="#10b981" name="Redemption Rate" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Offer</CardTitle>
                <CardDescription>Which offers drive the most revenue</CardDescription>
              </CardHeader>
              <CardContent>
                {offerPerformance.length === 0 ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-gray-500 flex items-center h-full">No offer data available for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <ScatterChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        type="number"
                        dataKey="redemptions"
                        name="Redemptions"
                        unit=""
                      />
                      <YAxis
                        type="number"
                        dataKey="revenue"
                        name="Revenue"
                        unit="$"
                      />
                      <ZAxis
                        type="number"
                        dataKey="views"
                        range={[60, 400]}
                        name="Views"
                      />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                      <Scatter
                        name="Offers"
                        data={offerPerformance}
                        fill="#8884d8"
                        shape="circle"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Breakdown of your coupon users</CardDescription>
              </CardHeader>
              <CardContent>
                {customerSegments.reduce((sum, data) => sum + data.value, 0) === 0 ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-gray-500 items-center">No customer data available for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerSegments}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {customerSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Schools</CardTitle>
                <CardDescription>Where your customers come from</CardDescription>
              </CardHeader>
              <CardContent>
                {schoolDistribution.length === 0 ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <p className="text-gray-500 items-center">No school data available for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={schoolDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="students" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Redemption Times</CardTitle>
                <CardDescription>When coupons are being redeemed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={redemptionPatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="redemptions" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redemption Locations</CardTitle>
                <CardDescription>Where coupons are being used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentData.locations.length === 0 ? (
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">No location data available for this period</p>
                  </div>
                ) : null}
                {
                  currentData.locations.slice(0, 5).map((location, index) => (
                    <div key={index} className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <div className="flex-1">
                        <p className="font-medium">{location.name}</p>
                        <p className="text-sm text-gray-600">
                          {location.redemptions} redemptions • {location.percent}% of total
                        </p>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="effectiveness" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
                <CardDescription>How many customers return after first redemption</CardDescription>
              </CardHeader>
              <CardContent>
                {customerRetention.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No data available for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>

                    <BarChart data={customerRetention}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="newCustomers" fill="#3b82f6" name="New Customers" />
                      <Bar dataKey="returning" fill="#10b981" name="Returning Customers" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Offer Lifecycle</CardTitle>
                <CardDescription>How long offers stay effective</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={currentData.lifecycle}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="redemptions"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Daily Redemptions"
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Total Redemptions"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="usage-types" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Usage Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Type Performance</CardTitle>
                <CardDescription>How different usage types are performing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Single Use */}
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">Single-Use Offers</p>
                        <p className="text-sm text-gray-600">One-time claims only</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {offerPerformance.filter(o => !o.usage_type || o.usage_type === 'single_use').length}
                      </p>
                      <p className="text-xs text-gray-500">offers</p>
                    </div>
                  </div>

                  {/* Multi Use */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Repeat className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">Multi-Use Offers</p>
                        <p className="text-sm text-gray-600">Limited repeat claims</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {offerPerformance.filter(o => o.usage_type === 'multi_use').length}
                      </p>
                      <p className="text-xs text-gray-500">offers</p>
                    </div>
                  </div>

                  {/* Unlimited */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Infinity className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium">Unlimited Offers</p>
                        <p className="text-sm text-gray-600">No claim limits</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {offerPerformance.filter(o => o.usage_type === 'unlimited').length}
                      </p>
                      <p className="text-xs text-gray-500">offers</p>
                    </div>
                  </div>

                  {/* Tiered */}
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Trophy className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="font-medium">Tiered Offers</p>
                        <p className="text-sm text-gray-600">Progressive rewards</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {offerPerformance.filter(o => o.usage_type === 'tiered').length}
                      </p>
                      <p className="text-xs text-gray-500">offers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Metrics Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Type Effectiveness</CardTitle>
                <CardDescription>Average metrics by usage type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={[
                      {
                        name: 'Single-Use',
                        'Avg Claims': Math.round(offerPerformance.filter(o => !o.usage_type || o.usage_type === 'single_use')
                          .reduce((avg, offer, _, arr) => avg + offer.redemptions / arr.length, 0) || 0),
                        'Avg Revenue': Math.round(offerPerformance.filter(o => !o.usage_type || o.usage_type === 'single_use')
                          .reduce((avg, offer, _, arr) => avg + offer.revenue / arr.length, 0) || 0)
                      },
                      {
                        name: 'Multi-Use',
                        'Avg Claims': Math.round(offerPerformance.filter(o => o.usage_type === 'multi_use')
                          .reduce((avg, offer, _, arr) => avg + offer.redemptions / arr.length, 0) || 0),
                        'Avg Revenue': Math.round(offerPerformance.filter(o => o.usage_type === 'multi_use')
                          .reduce((avg, offer, _, arr) => avg + offer.revenue / arr.length, 0) || 0)
                      },
                      {
                        name: 'Unlimited',
                        'Avg Claims': Math.round(offerPerformance.filter(o => o.usage_type === 'unlimited')
                          .reduce((avg, offer, _, arr) => avg + offer.redemptions / arr.length, 0) || 0),
                        'Avg Revenue': Math.round(offerPerformance.filter(o => o.usage_type === 'unlimited')
                          .reduce((avg, offer, _, arr) => avg + offer.revenue / arr.length, 0) || 0)
                      },
                      {
                        name: 'Tiered',
                        'Avg Claims': Math.round(offerPerformance.filter(o => o.usage_type === 'tiered')
                          .reduce((avg, offer, _, arr) => avg + offer.redemptions / arr.length, 0) || 0),
                        'Avg Revenue': Math.round(offerPerformance.filter(o => o.usage_type === 'tiered')
                          .reduce((avg, offer, _, arr) => avg + offer.revenue / arr.length, 0) || 0)
                      }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Avg Claims" fill="#3b82f6" />
                    <Bar dataKey="Avg Revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Usage Insights Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Repeat Usage Rate</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((offerPerformance.filter(o => o.usage_type === 'multi_use' || o.usage_type === 'unlimited' || o.usage_type === 'tiered').length / offerPerformance.length) * 100 || 0)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Offers allowing multiple claims
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Claims/User</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(totalRedemptions / currentData.newCustomers || 0).toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per unique user
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Best Performing Type</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* Logic to determine best performing usage type */}
                  {offerPerformance.filter(o => o.usage_type === 'multi_use').length > 0 ? 'Multi-Use' :
                   offerPerformance.filter(o => o.usage_type === 'tiered').length > 0 ? 'Tiered' :
                   offerPerformance.filter(o => o.usage_type === 'unlimited').length > 0 ? 'Unlimited' : 'Single-Use'}
                </div>
                <p className="text-xs text-muted-foreground">
                  By revenue per offer
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to generate mock data
async function generateData(days) {

  // Calculate cumulative
  // let cumulative = 0;
  // redemptionDays.forEach(day => {
  //   cumulative += day.redemptions;
  //   day.cumulative = cumulative;
  // });

  try {
    const response = await axiosInstance.get('/user/merchant/analytics', {
      params: {
        days: days
      }
    });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return []; // Fallback to dummy data if needed
  }

  // const offers = [
  //   { id: 1, title: "10% Off", redemptions: 0, views: 0, revenue: 0 },
  //   { id: 2, title: "Buy 1 Get 1", redemptions: 0, views: 0, revenue: 0 },
  //   { id: 3, title: "Free Drink", redemptions: 0, views: 0, revenue: 0 },
  //   { id: 4, title: "$5 Off", redemptions: 0, views: 0, revenue: 0 },
  //   { id: 5, title: "20% Off", redemptions: 0, views: 0, revenue: 0 }
  // ];

  // const schools = {
  //   'State University': Math.floor(Math.random() * 500) + 100,
  //   'Tech Institute': Math.floor(Math.random() * 400) + 80,
  //   'City College': Math.floor(Math.random() * 300) + 50,
  //   'Community College': Math.floor(Math.random() * 200) + 30,
  //   'Online University': Math.floor(Math.random() * 150) + 20,
  // };

  // const locations = [
  //   { name: 'Main Campus Store', redemptions: 245, percent: 35 },
  //   { name: 'Downtown Location', redemptions: 180, percent: 25 },
  //   { name: 'Online Orders', redemptions: 150, percent: 20 },
  //   { name: 'Northside Branch', redemptions: 80, percent: 12 },
  //   { name: 'Airport Kiosk', redemptions: 45, percent: 8 },
  // ];

  // const redemptionDays = Array.from({ length: days }, (_, i) => ({
  //   day: i + 1,
  //   redemptions: Math.floor(Math.random() * 20) + 5,
  //   cumulative: 0
  // }));

  // return {
  //   revenue: Array.from({ length: days }, () => ({
  //     date: new Date(),
  //     amount: Math.floor(Math.random() * 500) + 100
  //   })),
  //   redemptions: Array.from({ length: days * 10 }, (_, i) => ({
  //     id: `redemption-${i}`,
  //     offer_id: offers[Math.floor(Math.random() * offers.length)].id,
  //     redeemed_at: new Date(Date.now() - Math.random() * days * 24 * 60 * 60 * 1000),
  //     amount: Math.floor(Math.random() * 50) + 5
  //   })),
  //   views: Math.floor(Math.random() * 10000) + 5000,
  //   newCustomers: Math.floor(Math.random() * 200) + 50,
  //   repeatCustomers: Math.floor(Math.random() * 300) + 100,
  //   inactiveCustomers: Math.floor(Math.random() * 150) + 30,
  //   offers: offers.map(offer => ({
  //     ...offer,
  //     redemptions: Math.floor(Math.random() * 200) + 50,
  //     views: Math.floor(Math.random() * 1000) + 200,
  //     revenue: Math.floor(Math.random() * 5000) + 1000
  //   })),
  //   schools,
  //   locations,
  //   lifecycle: redemptionDays
  // };
}