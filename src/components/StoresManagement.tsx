
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  User,
  Loader,
  Loader2
} from 'lucide-react';
import { mockStores } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import axiosInstance from '@/api/axios';
import { Merchant } from '@/types/user';

interface StoreType {
  id: string;
  name: string;
  location: string;
  contactEmail: string;
  contactPhone?: string;
  managerName?: string;
}

interface StoreManagementProps {
  merchant: Merchant | null;
}

export const StoresManagement: React.FC<StoreManagementProps> = ({ merchant }) => {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const [loadingStores, setLoadingStores] = useState(false);
  const [addingStore, setAddingStore] = useState(false);
  const [deletingStore, setDeletingStore] = useState(false);

  const [newStore, setNewStore] = useState({
    name: '',
    location: '',
    contactEmail: '',
    contactPhone: '',
    managerName: ''
  });

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await axiosInstance.get('/store/merchant/all');
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to fetch stores");
      }
      const fetchedStores = response.data.data as StoreType[];
      setStores(fetchedStores);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      if (error.response && error.response.status === 404) {
        setStores([]);
        return;
      }
      toast({
        title: "Error fetching stores",
        description: "Could not load store data. Please try again later.",
        variant: "destructive",
      });

    } finally {
      setLoadingStores(false);
    }
  }

  useEffect(() => {
    if (merchant) {
      fetchStores();
    }
  }, [merchant]);

  const handleCreateStore = async () => {
    if (!merchant?.isApproved) {
      toast({
        title: "Account not approved",
        description: "Your account needs to be approved before adding stores.",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingStore(true);
      const response = await axiosInstance.post('/store/new', {
        name: newStore.name,
        location: newStore.location,
        contact_email: newStore.contactEmail,
        contact_phone: newStore.contactPhone,
        manager_name: newStore.managerName
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      if (response.status !== 201) {
        throw new Error(response.data.message || "An error occurred");
      }
      const store = response.data.data as StoreType;
      setStores([...stores, store]);
      toast({
        title: "Store added successfully",
        description: "Your new store location has been added.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: error.response.data.message || error.message || 'An error occurred',
        description: error.response.data.description || "Store could not be created due to a server error",
        variant: `${error.response.status === 404 ? "warning" : "destructive"}`
      })
    } finally {
      setIsCreateModalOpen(false);
      setAddingStore(false);
      setNewStore({
        name: '',
        location: '',
        contactEmail: '',
        contactPhone: '',
        managerName: ''
      });
    }
  };

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setNewStore(store);
    setIsEditModalOpen(true);
  };

  const handleUpdateStore = () => {
    const updatedStores = stores.map(store =>
      store.id === selectedStore.id ? { ...store, ...newStore } : store
    );
    setStores(updatedStores);
    setIsEditModalOpen(false);
    toast({
      title: "Store updated successfully",
      description: "Store information has been updated.",
    });
  };

  const handleDeleteStore = async (storeId) => {
    try {
      setDeletingStore(true);
      const response = await axiosInstance.delete(`/store/${storeId}`);
      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to delete store");
      }
      setStores(stores.filter(store => store.id !== storeId));
      toast({
        title: "Store deleted",
        description: "The store has been removed from your account.",
      });
    } catch (error) {
      console.error("Failed to delete store:", error);
      toast({
        title: error.response?.data.message || error.message || "An error occurred",
        description: error.response?.data.description || "Store could not be deleted",
        variant: "destructive",
      });
    } finally {
      setDeletingStore(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
          <p className="text-gray-600 mt-1">Manage your physical store locations</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button disabled={addingStore} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {addingStore ? 'Adding...' : 'Add New Store'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Store</DialogTitle>
              <DialogDescription>
                Add a new physical store location for coupon redemptions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                  placeholder="e.g., Downtown Location"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manager">Manager Name</Label>
                <Input
                  id="manager"
                  value={newStore.managerName}
                  onChange={(e) => setNewStore({ ...newStore, managerName: e.target.value })}
                  placeholder="Store manager name"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="location">Full Address</Label>
                <Input
                  id="location"
                  value={newStore.location}
                  onChange={(e) => setNewStore({ ...newStore, location: e.target.value })}
                  placeholder="123 Main St, City, State, ZIP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newStore.contactEmail}
                  onChange={(e) => setNewStore({ ...newStore, contactEmail: e.target.value })}
                  placeholder="store@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Contact Phone</Label>
                <Input
                  id="phone"
                  value={newStore.contactPhone}
                  onChange={(e) => setNewStore({ ...newStore, contactPhone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button type='submit' variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStore}>Add Store</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Store Locations</CardTitle>
          <Store className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stores.length}</div>
          <p className="text-xs text-muted-foreground">
            Physical locations for redemptions
          </p>
        </CardContent>
      </Card>

      {/* Stores Grid */}

      {loadingStores ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      ) : stores.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stores added yet</h3>
            <p className="text-gray-600 mb-4">
              Add your physical store locations where students can redeem coupons in person.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Store
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <Card key={store.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">{store.name}</CardTitle>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditStore(store)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={deletingStore}
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      {deletingStore ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                  <div className="text-sm text-gray-600">{store.location}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div className="text-sm text-gray-600">{store.contactEmail}</div>
                </div>

                {store.contactPhone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div className="text-sm text-gray-600">{store.contactPhone}</div>
                  </div>
                )}

                {store.managerName && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Manager:</span> {store.managerName}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Store</DialogTitle>
            <DialogDescription>Update store information.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Store Name</Label>
              <Input
                id="edit-name"
                value={newStore.name}
                onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-manager">Manager Name</Label>
              <Input
                id="edit-manager"
                value={newStore.managerName}
                onChange={(e) => setNewStore({ ...newStore, managerName: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="edit-location">Full Address</Label>
              <Input
                id="edit-location"
                value={newStore.location}
                onChange={(e) => setNewStore({ ...newStore, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Contact Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newStore.contactEmail}
                onChange={(e) => setNewStore({ ...newStore, contactEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Contact Phone</Label>
              <Input
                id="edit-phone"
                value={newStore.contactPhone}
                onChange={(e) => setNewStore({ ...newStore, contactPhone: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStore}>Update Store</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
