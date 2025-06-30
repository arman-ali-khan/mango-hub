'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AnalyticsCharts } from '@/components/admin/AnalyticsCharts';
import { ReviewsManagement } from '@/components/admin/ReviewsManagement';
import { HomepageManager } from '@/components/admin/homepage/HomepageManager';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MessageSquare,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings,
  Shield,
  FileText,
  Warehouse,
  Star,
  Layout
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { adminService } from '@/lib/adminService';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  totalPackages: number;
  lowStockPackages: number;
  dailyOrders: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
  orderStatusDistribution: Record<string, number>;
  topPackages: Array<{
    package_id: string;
    total_quantity: number;
    total_revenue: number;
  }>;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  package_id: string;
  quantity: number;
  total_amount: number;
  payment_method: string;
  transaction_id: string;
  status: 'pending' | 'verified' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  comments?: Array<{
    id: string;
    comment: string;
    admin_name: string;
    created_at: string;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  is_admin: boolean;
  created_at: string;
}

interface PackageData {
  id: string;
  name: string;
  weight: string;
  price: number;
  description: string;
  image_url: string;
  is_active: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  seasonal_available: boolean;
  season_start?: string;
  season_end?: string;
  created_at: string;
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  verified: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800 border-purple-200',
  user: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalPackages: 0,
    lowStockPackages: 0,
    dailyOrders: [],
    orderStatusDistribution: {},
    topPackages: [],
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [packages, setPackages] = useState<PackageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  
  // Pagination states
  const [ordersPage, setOrdersPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const ordersPerPage = 10;
  const usersPerPage = 15;
  
  // Comment states
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [orderComments, setOrderComments] = useState<Record<string, any[]>>({});
  
  // Role change states
  const [roleChangeUser, setRoleChangeUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState('');
  const [roleChangeReason, setRoleChangeReason] = useState('');

  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      router.push('/auth');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [statsData, usersData, ordersData, packagesData] = await Promise.all([
        adminService.getDashboardStats(),
        authService.getAllProfiles(),
        authService.getAllOrders(),
        adminService.getAllPackages(),
      ]);

      setStats(statsData || {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        totalPackages: 0,
        lowStockPackages: 0,
        dailyOrders: [],
        orderStatusDistribution: {},
        topPackages: [],
      });
      setUsers(usersData || []);
      setOrders(ordersData || []);
      setPackages(packagesData || []);
    } catch (error: any) {
      console.error('Dashboard data fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await authService.updateOrderStatus(orderId, newStatus);

      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ));

      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update order status.",
        variant: "destructive",
      });
    }
  };

  const addOrderComment = async (orderId: string) => {
    if (!newComment.trim()) return;

    try {
      await adminService.addOrderComment(orderId, newComment.trim());
      
      // Refresh comments for this order
      const comments = await adminService.getOrderComments(orderId);
      setOrderComments(prev => ({ ...prev, [orderId]: comments }));
      
      setNewComment('');
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the order.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to Add Comment",
        description: error.message || "Could not add comment.",
        variant: "destructive",
      });
    }
  };

  const loadOrderComments = async (orderId: string) => {
    try {
      const comments = await adminService.getOrderComments(orderId);
      setOrderComments(prev => ({ ...prev, [orderId]: comments }));
    } catch (error: any) {
      console.error('Failed to load comments:', error);
    }
  };

  const changeUserRole = async () => {
    if (!roleChangeUser || !newRole) return;

    try {
      await adminService.changeUserRole(roleChangeUser, newRole, roleChangeReason);
      
      // Update local state
      setUsers(users.map(user => 
        user.id === roleChangeUser 
          ? { ...user, is_admin: newRole === 'admin' }
          : user
      ));

      setRoleChangeUser(null);
      setNewRole('');
      setRoleChangeReason('');
      
      toast({
        title: "Role Updated",
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error: any) {
      toast({
        title: "Role Change Failed",
        description: error.message || "Failed to change user role.",
        variant: "destructive",
      });
    }
  };

  // Filter and paginate data
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
      (roleFilter === 'admin' && user.is_admin) ||
      (roleFilter === 'user' && !user.is_admin);
    
    return matchesSearch && matchesRole;
  });

  // Pagination calculations
  const totalOrdersPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const totalUsersPages = Math.ceil(filteredUsers.length / usersPerPage);
  
  const paginatedOrders = filteredOrders.slice(
    (ordersPage - 1) * ordersPerPage,
    ordersPage * ordersPerPage
  );
  
  const paginatedUsers = filteredUsers.slice(
    (usersPage - 1) * usersPerPage,
    usersPage * usersPerPage
  );

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Admin <span className="text-indigo-600">Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600">
              Comprehensive business management and analytics
            </p>
          </motion.div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold">{stats.totalUsers}</p>
                      <p className="text-blue-100 text-xs mt-1">Registered customers</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Total Orders</p>
                      <p className="text-3xl font-bold">{stats.totalOrders}</p>
                      <p className="text-emerald-100 text-xs mt-1">All time orders</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <ShoppingCart className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-amber-500 to-orange-500 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-3xl font-bold">৳{stats.totalRevenue.toLocaleString()}</p>
                      <p className="text-orange-100 text-xs mt-1">Lifetime earnings</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Pending Orders</p>
                      <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                      <p className="text-purple-100 text-xs mt-1">Needs attention</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-100 text-sm font-medium">Active Packages</p>
                      <p className="text-3xl font-bold">{stats.totalPackages}</p>
                    </div>
                    <Package className="h-6 w-6 text-teal-100" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Low Stock Alert</p>
                      <p className="text-3xl font-bold">{stats.lowStockPackages}</p>
                    </div>
                    <AlertTriangle className="h-6 w-6 text-red-100" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-indigo-100 text-sm font-medium">Avg Order Value</p>
                      <p className="text-3xl font-bold">
                        ৳{stats.totalOrders > 0 ? Math.round(stats.totalRevenue / stats.totalOrders) : 0}
                      </p>
                    </div>
                    <TrendingUp className="h-6 w-6 text-indigo-100" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="shadow-xl border-0 bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-100 text-sm font-medium">Today's Orders</p>
                      <p className="text-3xl font-bold">
                        {stats.dailyOrders?.[0]?.count || 0}
                      </p>
                    </div>
                    <Calendar className="h-6 w-6 text-pink-100" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 bg-white shadow-lg rounded-xl p-1">
                <TabsTrigger value="orders" className="flex items-center space-x-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>Orders</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="packages" className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Packages</span>
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center space-x-2">
                  <Star className="h-4 w-4" />
                  <span>Reviews</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="homepage" className="flex items-center space-x-2">
                  <Layout className="h-4 w-4" />
                  <span>Homepage</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              {/* Orders Management Tab */}
              <TabsContent value="orders">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="h-6 w-6" />
                        <span>Orders Management</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                          />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-40 bg-white/20 border-white/30 text-white">
                            <SelectValue placeholder="Filter by status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading orders...</p>
                      </div>
                    ) : paginatedOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders Found</h3>
                        <p className="text-gray-600">No orders match your current filters.</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {paginatedOrders.map((order) => (
                            <div
                              key={order.id}
                              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div>
                                  <p className="font-semibold text-lg text-gray-900">Order #{order.id.slice(-8)}</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(order.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge className={`${statusColors[order.status]} border font-semibold`}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                  <Select
                                    value={order.status}
                                    onValueChange={(value) => updateOrderStatus(order.id, value)}
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pending">Pending</SelectItem>
                                      <SelectItem value="verified">Verified</SelectItem>
                                      <SelectItem value="shipped">Shipped</SelectItem>
                                      <SelectItem value="delivered">Delivered</SelectItem>
                                      <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedOrder(selectedOrder === order.id ? null : order.id);
                                      if (selectedOrder !== order.id) {
                                        loadOrderComments(order.id);
                                      }
                                    }}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Comments
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-blue-600 font-medium">Customer</p>
                                  <p className="font-semibold text-gray-900">{order.customer_name}</p>
                                  <p className="text-xs text-gray-500">{order.customer_email}</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-lg">
                                  <p className="text-emerald-600 font-medium">Package</p>
                                  <p className="font-semibold text-gray-900">{order.package_id}</p>
                                  <p className="text-xs text-gray-500">Qty: {order.quantity}</p>
                                </div>
                                <div className="bg-amber-50 p-3 rounded-lg">
                                  <p className="text-amber-600 font-medium">Amount</p>
                                  <p className="font-semibold text-emerald-600 text-lg">৳{order.total_amount}</p>
                                  <p className="text-xs text-gray-500 capitalize">{order.payment_method}</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <p className="text-purple-600 font-medium">Transaction</p>
                                  <p className="font-mono text-xs bg-gray-100 p-1 rounded">
                                    {order.transaction_id}
                                  </p>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <p className="text-gray-600 font-medium text-sm">Shipping Address:</p>
                                <p className="font-medium text-gray-900">{order.shipping_address}</p>
                              </div>

                              {/* Comments Section */}
                              {selectedOrder === order.id && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="border-t pt-4 mt-4"
                                >
                                  <h4 className="font-semibold text-gray-900 mb-3">Order Comments</h4>
                                  
                                  {/* Add Comment */}
                                  <div className="flex space-x-3 mb-4">
                                    <Textarea
                                      placeholder="Add a comment about this order..."
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      className="flex-1"
                                      rows={2}
                                    />
                                    <Button
                                      onClick={() => addOrderComment(order.id)}
                                      disabled={!newComment.trim()}
                                      className="bg-indigo-500 hover:bg-indigo-600"
                                    >
                                      Add Comment
                                    </Button>
                                  </div>

                                  {/* Comments List */}
                                  <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {orderComments[order.id]?.map((comment) => (
                                      <div key={comment.id} className="bg-white p-3 rounded-lg border">
                                        <div className="flex justify-between items-start mb-2">
                                          <span className="font-medium text-gray-900">{comment.admin_name}</span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(comment.created_at).toLocaleString()}
                                          </span>
                                        </div>
                                        <p className="text-gray-700">{comment.comment}</p>
                                      </div>
                                    )) || (
                                      <p className="text-gray-500 text-center py-4">No comments yet</p>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Orders Pagination */}
                        {totalOrdersPages > 1 && (
                          <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                              Showing {((ordersPage - 1) * ordersPerPage) + 1} to {Math.min(ordersPage * ordersPerPage, filteredOrders.length)} of {filteredOrders.length} orders
                            </p>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrdersPage(Math.max(1, ordersPage - 1))}
                                disabled={ordersPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {ordersPage} of {totalOrdersPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOrdersPage(Math.min(totalOrdersPages, ordersPage + 1))}
                                disabled={ordersPage === totalOrdersPages}
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Management Tab */}
              <TabsContent value="users">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Users className="h-6 w-6" />
                        <span>Users Management</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                          />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                          <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {loading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading users...</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {paginatedUsers.map((user) => (
                            <div
                              key={user.id}
                              className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-gray-50"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                  <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-3 rounded-full text-white">
                                    <Users className="h-6 w-6" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-lg text-gray-900">{user.name}</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                    <p className="text-xs text-gray-500">
                                      Joined: {new Date(user.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <Badge className={`${roleColors[user.is_admin ? 'admin' : 'user']} border font-semibold`}>
                                    {user.is_admin ? 'Admin' : 'User'}
                                  </Badge>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setRoleChangeUser(user.id);
                                      setNewRole(user.is_admin ? 'user' : 'admin');
                                    }}
                                    className="flex items-center space-x-2"
                                  >
                                    <Shield className="h-4 w-4" />
                                    <span>Change Role</span>
                                  </Button>
                                </div>
                              </div>
                              
                              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <p className="text-blue-600 font-medium">Phone</p>
                                  <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                  <p className="text-purple-600 font-medium">Address</p>
                                  <p className="text-gray-900">{user.address || 'Not provided'}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Users Pagination */}
                        {totalUsersPages > 1 && (
                          <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-gray-600">
                              Showing {((usersPage - 1) * usersPerPage) + 1} to {Math.min(usersPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length} users
                            </p>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                                disabled={usersPage === 1}
                              >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                              </Button>
                              <span className="text-sm text-gray-600">
                                Page {usersPage} of {totalUsersPages}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setUsersPage(Math.min(totalUsersPages, usersPage + 1))}
                                disabled={usersPage === totalUsersPages}
                              >
                                Next
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Package Management Tab */}
              <TabsContent value="packages">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Package className="h-6 w-6" />
                        <span>Package Management</span>
                      </div>
                      <Link href="/admin/packages/create">
                        <Button className="bg-white text-orange-600 hover:bg-white/90 font-semibold">
                          <Plus className="h-4  w-4 mr-2" />
                          Create Package
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {packages.length === 0 ? (
                      <div className="text-center py-12">
                        <Warehouse className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Found</h3>
                        <p className="text-gray-600 mb-4">Create your first mango package to get started</p>
                        <Link href="/admin/packages/create">
                          <Button className="bg-amber-500 hover:bg-amber-600">
                            <Plus className="h-4 w-4 mr-2" />
                            Create First Package
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                          <div key={pkg.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                            <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                              <img
                                src={pkg.image_url}
                                alt={pkg.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5947081/pexels-photo-5947081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                                }}
                              />
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg text-gray-900">{pkg.name}</h3>
                                <Badge className={pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                  {pkg.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600">Weight</p>
                                  <p className="font-semibold">{pkg.weight}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Price</p>
                                  <p className="font-semibold text-emerald-600">৳{pkg.price}</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Stock</p>
                                  <p className={`font-semibold ${pkg.stock_quantity <= pkg.low_stock_threshold ? 'text-red-600' : 'text-gray-900'}`}>
                                    {pkg.stock_quantity}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Seasonal</p>
                                  <p className="font-semibold">{pkg.seasonal_available ? 'Year Round' : 'Seasonal'}</p>
                                </div>
                              </div>
                              
                              <p className="text-gray-600 text-sm line-clamp-2">{pkg.description}</p>
                              
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Reviews Management Tab */}
              <TabsContent value="reviews">
                <ReviewsManagement />
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics">
                <AnalyticsCharts stats={stats} />
              </TabsContent>

              {/* Homepage Management Tab */}
              <TabsContent value="homepage">
                <HomepageManager />
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
                    <CardTitle className="flex items-center space-x-3">
                      <Settings className="h-6 w-6" />
                      <span>System Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">System Settings</h3>
                      <p className="text-gray-600">Configure system preferences and administrative settings</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>

      {/* Role Change Modal */}
      {roleChangeUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-semibold mb-4">Change User Role</h3>
            <div className="space-y-4">
              <div>
                <Label>New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Reason (Optional)</Label>
                <Textarea
                  placeholder="Reason for role change..."
                  value={roleChangeReason}
                  onChange={(e) => setRoleChangeReason(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <Button onClick={changeUserRole} className="flex-1">
                  Confirm Change
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRoleChangeUser(null);
                    setNewRole('');
                    setRoleChangeReason('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}