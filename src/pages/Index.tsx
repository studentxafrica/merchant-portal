
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { MerchantDashboard } from '@/components/MerchantDashboard';
import { CouponsManagement } from '@/components/CouponsManagement';
import { StoresManagement } from '@/components/StoresManagement';
import { Analytics } from '@/components/Analytics';
import { AccountSettings } from '@/components/AccountSettings';
import { useSelector } from 'react-redux';
import { RootState } from '@/state';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import PageUnderDevelopment from '@/components/PageUnderDevelopment';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import HelpCenter from '@/components/HelpCenter';
import { ActiveOffers } from '@/components/Offers';
import { useState } from 'react';

const Index = () => {
  const merchant = useSelector((state: RootState) => state.auth.user);
  // merchant['stores'] = [
  //   {
  //     id: '1',
  //     name: 'Main Store',
  //     location: '123 Main St, City, Country',
  //     contact: '0786276722',
  //   },
  //   {
  //     id: '2',
  //     name: 'Secondary Store',
  //     location: '456 Secondary St, City, Country',
  //     contact: '0786276723',
  //   },
  //   {
  //     id: '3',
  //     name: 'Tertiary Store',
  //     location: '789 Tertiary St, City, Country',
  //     contact: '0786276724',
  //   },
  //   {
  //     id: '4',
  //     name: 'Quaternary Store',
  //     location: '101 Quaternary St, City, Country',
  //     contact: '0786276725',
  //   },
  //   {
  //     id: '5',
  //     name: 'Quinary Store',
  //     location: '202 Quinary St, City, Country',
  //     contact: '0786276726',
  //   },
  //   {
  //     id: '6',
  //     name: 'Senary Store',
  //     location: '303 Senary St, City, Country',
  //     contact: '0786276727',
  //   },
  //   {
  //     id: '7',
  //     name: 'Septenary Store',
  //     location: '404 Septenary St, City, Country',
  //     contact: '0786276728',
  //   },
  //   {
  //     id: '8',
  //     name: 'Octonary Store',
  //     location: '505 Octonary St, City, Country',
  //     contact: '0786276729',
  //   },
  //   {
  //     id: '9',
  //     name: 'Nonary Store',
  //     location: '606 Nonary St, City, Country',
  //     contact: '0786276730',
  //   },
  //   {
  //     id: '10',
  //     name: 'Denary Store',
  //     location: '707 Denary St, City, Country',
  //     contact: '0786276731',
  //   },

  // ]
  const isAuthenticated = !!merchant;
  if (!isAuthenticated && window.location.pathname !== '/login') {
    window.location.href = '/login';
    return null; // Prevent rendering until redirection
  }

  const [activeTab, setActiveTab] = useState(window.location.pathname);
  const navigate = useNavigate();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    navigate(tab);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header merchant={merchant} />
      {/* Approval Status */}
      {!merchant?.isApproved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="px-4 py-1">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-sm text-yellow-800">Account Pending Approval</p>
                <p className="text-xs text-yellow-600">
                  Some features are limited until your account is approved by our team.
                  <a className='text-xs text-blue-500' href="/settings">View progress</a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <div className="flex">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

        <main className="flex-1 p-6 h-[calc(100vh-4rem)] overflow-y-auto">
          <Routes>
            <Route path="/" element={<MerchantDashboard merchant={merchant} />} />
            <Route path="/offers" element={<ActiveOffers merchant={merchant} />} />
            <Route path="/coupons" element={<CouponsManagement merchant={merchant} />} />
            <Route path="/stores" element={<StoresManagement merchant={merchant} />} />
            <Route path="/analytics" element={<Analytics merchant={merchant} />} />
            <Route path="/settings" element={<AccountSettings merchant={merchant} />} />

            {/* Merchant Management */}

            {/* Under Development */}
            <Route path="/messages" element={<PageUnderDevelopment />} />
            <Route path="/earnings" element={<PageUnderDevelopment />} />
            <Route path="/reviews" element={<PageUnderDevelopment />} />
            <Route path="/help" element={<HelpCenter merchant={merchant} />} />

            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Index;
