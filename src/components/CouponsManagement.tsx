
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  QrCode,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Ticket,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Download
} from 'lucide-react';
import { mockCoupons, mockOffers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axios';
import { Merchant } from '@/types/user';
import { set } from 'date-fns';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import { ConfirmModal } from './confirmModal';

interface Coupon {
  id: string;
  couponCode: string;
  offer: {
    id: string;
    title: string;
    slug: string;
    coverImage: string;
    discountType: string;
    discountValue: number;
    currency: string;
  };
  consumer: {
    id: string;
    name: string;
    email: string;
  }
  redeemedAt: Date;
  expiryDate: Date;
  status: string;
  qrCode: string;
  revenueAmount?: number;
}

interface CouponsManagementProps {
  merchant: Partial<Merchant>
}

export const CouponsManagement: React.FC<CouponsManagementProps> = ({ merchant }) => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const [redeemingCoupon, setRedeemingCoupon] = useState<boolean>(false);
  const { isOpen, openModal, closeModal, modalProps } = useConfirmModal();

  const fetchCoupons = async () => {
    try {
      // Simulate API call
      const response = await axiosInstance.get('/user/merchant/coupons', {
        params: {
          merchant_id: merchant?.id,
          status: filterStatus === 'all' ? undefined : filterStatus,
          search: searchTerm
        }
      });
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to fetch coupons");
      }
      const coupons = response.data.data;
      setCoupons(coupons);
    } catch (error) {
      if (error.response.status === 404) {
        setCoupons([]);
        return;
      }
      toast({
        title: error.response.data?.message || error.message || "Error fetching coupons",
        description: error.response.data?.description || "There was an issue retrieving the coupons. Please try again later.",
        variant: `${error.response.status === 404 ? "warning" : "destructive"}`,
      });
    }
  }

  useEffect(() => {
    if (merchant) {
      fetchCoupons();
    }
  }
    , [merchant, filterStatus, searchTerm]);

  const handleRedeemCoupon = async (couponId) => {
    // alert user to confirm redemption
    // const confirmRedeem = window.confirm("Are you sure you want to redeem this coupon? This action cannot be undone.");
    // if (!confirmRedeem) return;

    if (!merchant?.isApproved) {
      toast({
        title: "Account not approved",
        description: "Your account needs to be approved to redeem coupons.",
        variant: "destructive",
      });
      return;
    }

    try {
      setRedeemingCoupon(true);
      const response = await axiosInstance.post(`/coupon/${couponId}/redeem`);
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to redeem coupon");
      }
      const coupon = response.data.data;
      console.log("Coupons", coupons)
      const updatedCoupons = coupons.map(c => c.id === coupon.id ? { ...c, ...coupon } : c);
      console.log("Updated Coupons", updatedCoupons)
      setCoupons(updatedCoupons);
      toast({
        title: "Coupon redeemed successfully",
        description: "The coupon has been marked as redeemed.",
      });
    } catch (error) {
      toast({
        title: error.response?.data?.message || "Error redeeming coupon",
        description: error.response?.message || "There was an issue redeeming the coupon. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setRedeemingCoupon(false);
    }

  };

  const handleViewDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setIsDetailModalOpen(true);
  };

  const filteredCoupons = coupons.filter(coupon => {
    const matchesStatus = filterStatus === 'all' || coupon.status === filterStatus;
    const matchesSearch = coupon?.couponCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.consumer.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCoupons = coupons.length;
  const redeemedCoupons = coupons.filter(c => c.status === 'redeemed').length;
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const totalRevenue = coupons.filter(c => c.status === 'redeemed').reduce((sum, c) => sum + (c.revenueAmount || 0), 0);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'redeemed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'redeemed':
        return 'outline';
      case 'expired':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={isOpen}
        onClose={closeModal}
        {...modalProps}
      />
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupon Management</h1>
          <p className="text-gray-600 mt-1">Track and manage student coupon redemptions</p>
        </div>
      </div>

      

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coupons</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCoupons}</div>
            <p className="text-xs text-muted-foreground">
              Issued to students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCoupons}</div>
            <p className="text-xs text-muted-foreground">
              Ready for redemption
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Redeemed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{redeemedCoupons}</div>
            <p className="text-xs text-muted-foreground">
              {totalCoupons > 0 ? Math.round((redeemedCoupons / totalCoupons) * 100) : 0}% redemption rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From redemptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by coupon code or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="redeemed">Redeemed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupon Details</CardTitle>
          <CardDescription>All coupons issued for your offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Coupon Code</th>
                  <th className="text-left p-3 font-medium">Student</th>
                  <th className="text-left p-3 font-medium">Offer</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Expiry Date</th>
                  <th className="text-left p-3 font-medium">Revenue</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-gray-500">
                      No coupons found.
                    </td>
                  </tr>
                )}
                {
                  filteredCoupons.map((coupon) => {
                    return (
                      <tr key={coupon.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-mono text-sm">{coupon.couponCode}</div>
                        </td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{coupon.consumer.name}</div>
                            <div className="text-sm text-gray-500">{coupon.consumer.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium">{coupon.offer?.title}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusColor(coupon.status)} className="flex items-center space-x-1 w-fit">
                            {getStatusIcon(coupon.status)}
                            <span className="capitalize">{coupon.status}</span>
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="text-sm">
                            {new Date(coupon.expiryDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-green-600">
                            ${coupon.revenueAmount?.toFixed(2) || '0.00'}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewDetails(coupon)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {coupon.status === 'active' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  openModal({
                                    title: "Redeem Coupon",
                                    message: (
                                      <>
                                        Are you sure you want to redeem the coupon <span className="font-mono font-semibold">{coupon.couponCode}</span>?<br />
                                        <span className="text-red-600">This action cannot be undone.</span>
                                      </>
                                    ),
                                    confirmText: "Redeem",
                                    cancelText: "Cancel",
                                    variant: "default",
                                    onConfirm: () => {
                                      closeModal();
                                      handleRedeemCoupon(coupon.id);
                                    },
                                    onClose: closeModal,
                                  });
                                }}
                                disabled={!merchant?.isApproved || redeemingCoupon}
                              >
                                {redeemingCoupon ? 'Redeeming...' : 'Redeem'}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Coupon Details</DialogTitle>
            <DialogDescription>Complete information about this coupon</DialogDescription>
          </DialogHeader>
          {selectedCoupon && (
            <div className="space-y-4">
              <div className="text-center flex justify-center items-center flex-col p-4 bg-gray-50 rounded-lg">
                <div className="h-24 w-24 aspect-square max-w-xs flex items-center justify-center">
                  <img className='w-full h-full' src={selectedCoupon.qrCode} alt={selectedCoupon.couponCode} />
                </div>
                <div className="font-mono text-lg font-bold">{selectedCoupon.couponCode}</div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student Name</label>
                  <div className="font-medium">{selectedCoupon.consumer.name}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <div className="font-medium">{selectedCoupon.consumer.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedCoupon.status)}
                    <span className="capitalize">{selectedCoupon.status}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Expiry Date</label>
                  <div className="font-medium">
                    {new Date(selectedCoupon.expiryDate).toLocaleDateString()}
                  </div>
                </div>
                {selectedCoupon.redeemedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Redeemed On</label>
                    <div className="font-medium">
                      {new Date(selectedCoupon.redeemedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Revenue Generated</label>
                  <div className="font-medium text-green-600">
                    ${selectedCoupon.revenueAmount?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                {selectedCoupon.status === 'active' && (
                  <Button
                    className="flex-1"
                    onClick={() => {
                      handleRedeemCoupon(selectedCoupon.id);
                      setIsDetailModalOpen(false);
                    }}
                    disabled={!merchant?.isApproved}
                  >
                    Mark as Redeemed
                  </Button>
                )}
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
