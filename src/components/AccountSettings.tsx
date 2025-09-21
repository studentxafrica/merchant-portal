
import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  User,
  Building,
  Bell,
  Shield,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Upload,
  Save
} from 'lucide-react';
import { mockCategories } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { setCurrentUser } from '@/state/auth';
import axiosInstance from '@/api/axios';
import { useDispatch } from 'react-redux';
import { log, profile } from 'console';

export const AccountSettings = ({ merchant }) => {
  const [profileData, setProfileData] = useState({
    name: merchant?.name || '',
    email: merchant?.email || '',
    website: merchant?.website || '',
    phone: merchant?.phone || '',
    address: merchant?.address || '',
    city: merchant?.city || '',
    country: merchant?.country || '',
    logo: merchant?.logo || '',
    preferredCurrency: merchant?.preferredCurrency || '',
    category_id: merchant?.category_id || '',
    category: merchant?.category || { id: '', name: '' },
    bio: '',
  });
  const [logoImage, setLogoImage] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [savingLogo, setSavingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const [notifications, setNotifications] = useState({
    emailOffers: true,
    emailRedemptions: true,
    emailWeeklyReports: false,
    pushNotifications: true,
  });

  const { toast } = useToast();
  const dispatch = useDispatch();
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingLogo, setUpdatingLogo] = useState(false);
  const [updatingBusinessInfo, setUpdatingBusinessInfo] = useState(false);
  const [updatingPreferences, setUpdatingPreferences] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfileInformation = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('email', profileData.email);
    formData.append('website', profileData.website);
    formData.append('phone', profileData.phone);

    try {
      setUpdatingProfile(true);
      const response = await axiosInstance.put('/user/merchant/profile', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Error updating profile');
      }
      const updatedMerchant = response.data.data;
      setProfileData({
        ...profileData,
        name: updatedMerchant.name,
        email: updatedMerchant.email,
        website: updatedMerchant.website,
        phone: updatedMerchant.phone,
        preferredCurrency: updatedMerchant.preferredCurrency,
      });
      dispatch(setCurrentUser({
        user: updatedMerchant,
        role: 'merchant',
      }));
      toast({
        title: "Profile updated successfully",
        description: "Your profile information has been updated.",
      });

    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "Error updating profile",
        description: error.response.data?.description || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingProfile(false);
    }
  }

  const handleUpdateLogoImage = async (file: File) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      setSavingLogo(true);
      const response = await axiosInstance.put('/user/merchant/profile', {
        logo: logoPreview,
      },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Error updating logo');
      }
      const updatedMerchant = response.data.data;
      setProfileData({
        ...profileData,
        logo: updatedMerchant.logo,
      });
      dispatch(setCurrentUser({
        user: updatedMerchant,
        role: 'merchant',
      }));
      console.log('Logo updated successfully:', updatedMerchant, merchant);
      toast({
        title: "Logo updated successfully",
        description: "Your logo has been updated.",
      });

    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "Error updating logo",
        description: error.response.data?.description || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSavingLogo(false);
      setLogoPreview(null);
      setLogoImage(null);
    }
  }

  const handleUpdateBusinessInformation = async () => {
    const formData = new FormData();
    formData.append('address', profileData.address);
    formData.append('city', profileData.city);
    formData.append('country', profileData.country);
    formData.append('preferred_currency', profileData.preferredCurrency);
    formData.append('category_id', profileData.category_id);

    try {
      setUpdatingBusinessInfo(true);
      const response = await axiosInstance.put('/user/merchant/profile', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Error updating business information');
      }
      const updatedMerchant = response.data.data;
      setProfileData({
        ...profileData,
        address: updatedMerchant.address,
        city: updatedMerchant.city,
        country: updatedMerchant.country,
        preferredCurrency: updatedMerchant.preferred_currency,
        category_id: updatedMerchant.category_id,
        category: updatedMerchant.category,
      });
      dispatch(setCurrentUser({
        user: updatedMerchant,
        role: 'merchant',
      }));
      toast({
        title: "Business information updated successfully",
        description: "Your business information has been updated.",
        variant: "success",
      });

    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "Error updating business information",
        description: error.response.data?.description || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingBusinessInfo(false);
    }
  }

  const handleUpdateAccountPreferences = async () => {
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "All fields are required",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please ensure your new passwords match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingPassword(true);
      const response = await axiosInstance.put('/user/merchant/profile/password', {
        oldPassword: currentPassword,
        password: newPassword,
      });

      if (response.status !== 200) {
        throw new Error(response.data.message || 'Error updating password');
      }

      toast({
        title: "Password updated successfully",
        description: "Your password has been updated.",
        variant: "success",
      });

    } catch (error) {
      toast({
        title: error.response.data?.message || error.message || "Error updating password",
        description: error.response.data?.description || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account information and preferences</p>
        </div>
      </div>

      {/* Account Status */}
      <Card className={`border-2 ${merchant?.isApproved ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">

              <div>
                <h3 className={`font-medium ${merchant?.isApproved ? 'text-green-800' : 'text-yellow-800'}`}>
                  Account Status: {merchant?.isApproved ? 'Approved' : 'Pending Approval'}
                </h3>
                {!merchant?.isApproved && (
                  <div>
                    <p className={`text-sm ${merchant?.isApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                      <h1 className="flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
                        <span>Tips to fast track approval:</span>
                      </h1>
                      <ul className="list-disc pl-5 mt-1">
                        <li>Ensure your business and profile information is complete</li>
                        <li>Verify your email address</li>
                        <li>Upload a high-quality logo</li>
                      </ul>
                    </p>
                  </div>
                )}
              </div>
            </div>
            {merchant?.isApproved && (
              <Badge variant="outline" className="text-green-700 border-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="business">Business Info</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>
                Update your public profile information that students will see.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20 border-2 border-gray-200">
                  <AvatarImage src={logoPreview || merchant?.logo} />
                  <AvatarFallback className="text-lg">{merchant?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  {savingLogo ? (
                    <p className="text-sm text-gray-500">Saving...</p>
                  ) : logoPreview ? (
                    // Remove, revert or save logo
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" onClick={(e) => {
                        e.preventDefault();
                        setLogoPreview(null);
                        setLogoImage(null);
                        if (logoInputRef.current) {
                          logoInputRef.current.value = "";
                        }
                      }}>
                        Remove
                      </Button>
                      <Button variant="ghost" onClick={() => handleUpdateLogoImage(logoImage)}>
                        Save
                      </Button>
                    </div>
                  ) : (
                    <Label htmlFor="logo-upload" className="cursor-pointer flex items-center space-x-2 bg-gray-100 p-2 rounded-md w-auto">
                      <Upload className="h-5 w-5 text-gray-500" />
                      <span>Change Logo</span>
                    </Label>
                  )}

                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    ref={logoInputRef}
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setLogoImage(file);
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setLogoPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG or SVG. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                  {!merchant?.emailVerified && (
                    <p className="mt-1 px-2 py-1 rounded-lg text-yellow-700 border border-yellow-200 text-xs">
                      Email not verified. Please check your inbox for verification instructions.
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type='tel'
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Business Description</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={3}
                  placeholder="Tell students about your business..."
                />
              </div>

              <Button
                disabled={updatingProfile}
                onClick={handleUpdateProfileInformation}>
                <Save className="h-4 w-4 mr-2" />
                {updatingProfile ? 'Updating...' : 'Save Profile Info'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <span>Business Information</span>
              </CardTitle>
              <CardDescription>
                Manage your business details and location information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="space-y-2">
                <Label htmlFor="category">Business Category</Label>
                <Select value={profileData.category.name} onValueChange={(value) => setProfileData({ ...profileData, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Preferred Currency</Label>
                  <Select value={profileData.preferredCurrency || window.navigator.language.split('-')[1] || 'USD'} defaultValue={window.navigator.language.split('-')[1] || 'USD'} onValueChange={(value) => setProfileData({ ...profileData, preferredCurrency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Common currencies in alphabetical order */}
                      <SelectItem value="AED">UAE Dirham (AED)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      <SelectItem value="BRL">Brazilian Real (BRL)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                      <SelectItem value="DKK">Danish Krone (DKK)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="HKD">Hong Kong Dollar (HKD)</SelectItem>
                      <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                      <SelectItem value="KES">Kenyan Shilling (KES)</SelectItem>
                      <SelectItem value="KRW">South Korean Won (KRW)</SelectItem>
                      <SelectItem value="MXN">Mexican Peso (MXN)</SelectItem>
                      <SelectItem value="NOK">Norwegian Krone (NOK)</SelectItem>
                      <SelectItem value="NZD">New Zealand Dollar (NZD)</SelectItem>
                      <SelectItem value="RUB">Russian Ruble (RUB)</SelectItem>
                      <SelectItem value="SEK">Swedish Krona (SEK)</SelectItem>
                      <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="ZAR">South African Rand (ZAR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button disabled={updatingBusinessInfo} onClick={handleUpdateBusinessInformation}>
                <Save className="h-4 w-4 mr-2" />
                {updatingBusinessInfo ? "Saving..." : "Save Business Info"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about your account activity.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-offers">New Offer Activities</Label>
                    <p className="text-sm text-gray-500">Get notified when students interact with your offers</p>
                  </div>
                  <Switch
                    id="email-offers"
                    checked={notifications.emailOffers}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailOffers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-redemptions">Coupon Redemptions</Label>
                    <p className="text-sm text-gray-500">Get notified when coupons are redeemed</p>
                  </div>
                  <Switch
                    id="email-redemptions"
                    checked={notifications.emailRedemptions}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailRedemptions: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-reports">Weekly Reports</Label>
                    <p className="text-sm text-gray-500">Receive weekly performance summaries</p>
                  </div>
                  <Switch
                    id="weekly-reports"
                    checked={notifications.emailWeeklyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailWeeklyReports: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive browser push notifications</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>
              </div>

              <Button onClick={handleUpdateAccountPreferences}>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Settings</span>
              </CardTitle>
              <CardDescription>
                Manage your account security and password settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input onChange={(e) => setCurrentPassword(e.target.value)} id="current-password" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input onChange={(e) => setNewPassword(e.target.value)} id="new-password" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input onChange={(e) => setConfirmPassword(e.target.value)} id="confirm-password" type="password" className="mt-1" />
                </div>
                <Button onClick={() => handleUpdatePassword()}>{updatingPassword ? 'Updating...' : 'Update Password'}</Button>

              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Add an extra layer of security to your account with 2FA.
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Login Sessions</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Manage and monitor your active login sessions.
                </p>
                <Button variant="outline">View Active Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
