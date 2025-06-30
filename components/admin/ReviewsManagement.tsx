'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  MessageSquare,
  User,
  Calendar,
  Award,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const reviewSchema = z.object({
  customer_name: z.string().min(2, 'Customer name must be at least 2 characters'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  is_featured: z.boolean(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface Review {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  is_featured: boolean;
  created_at: string;
}

export function ReviewsManagement() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;
  
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 5,
      is_featured: false,
    }
  });

  const watchRating = watch('rating');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReviews(data || []);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ReviewFormData) => {
    try {
      if (editingReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            customer_name: data.customer_name,
            rating: data.rating,
            comment: data.comment,
            is_featured: data.is_featured,
          })
          .eq('id', editingReview.id);

        if (error) throw error;

        // Update local state
        setReviews(reviews.map(review => 
          review.id === editingReview.id 
            ? { ...review, ...data }
            : review
        ));

        toast({
          title: "Review Updated",
          description: "Review has been updated successfully.",
        });

        setEditingReview(null);
      } else {
        // Create new review
        const { data: newReview, error } = await supabase
          .from('reviews')
          .insert({
            customer_name: data.customer_name,
            rating: data.rating,
            comment: data.comment,
            is_featured: data.is_featured,
          })
          .select()
          .single();

        if (error) throw error;

        // Add to local state
        setReviews([newReview, ...reviews]);

        toast({
          title: "Review Created",
          description: "New review has been created successfully.",
        });

        setShowCreateDialog(false);
      }

      reset();
    } catch (error: any) {
      toast({
        title: editingReview ? "Update Failed" : "Creation Failed",
        description: error.message || "Failed to save review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (reviewId: string, currentFeatured: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_featured: !currentFeatured })
        .eq('id', reviewId);

      if (error) throw error;

      // Update local state
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, is_featured: !currentFeatured }
          : review
      ));

      toast({
        title: "Review Updated",
        description: `Review ${!currentFeatured ? 'featured' : 'unfeatured'} successfully.`,
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update review.",
        variant: "destructive",
      });
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      // Remove from local state
      setReviews(reviews.filter(review => review.id !== reviewId));

      toast({
        title: "Review Deleted",
        description: "Review has been deleted successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete review.",
        variant: "destructive",
      });
    }
  };

  const startEditing = (review: Review) => {
    setEditingReview(review);
    setValue('customer_name', review.customer_name);
    setValue('rating', review.rating);
    setValue('comment', review.comment);
    setValue('is_featured', review.is_featured);
  };

  const cancelEditing = () => {
    setEditingReview(null);
    reset();
  };

  // Filter reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    const matchesFeatured = featuredFilter === 'all' || 
      (featuredFilter === 'featured' && review.is_featured) ||
      (featuredFilter === 'not-featured' && !review.is_featured);
    
    return matchesSearch && matchesRating && matchesFeatured;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * reviewsPerPage,
    currentPage * reviewsPerPage
  );

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive && onRatingChange ? () => onRatingChange(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const featuredCount = reviews.filter(review => review.is_featured).length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-reviews" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="all-reviews" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>All Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="featured-reviews" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Featured</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* All Reviews Tab */}
        <TabsContent value="all-reviews">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-6 w-6" />
                  <span>All Customer Reviews</span>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search and Filters */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    />
                  </div>
                  
                  <select
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                    className="bg-white/20 border-white/30 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>

                  <select
                    value={featuredFilter}
                    onChange={(e) => setFeaturedFilter(e.target.value)}
                    className="bg-white/20 border-white/30 text-white rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Reviews</option>
                    <option value="featured">Featured</option>
                    <option value="not-featured">Not Featured</option>
                  </select>

                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button className="bg-white text-orange-600 hover:bg-white/90 font-semibold">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create New Review</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                          <Label htmlFor="customer_name">Customer Name</Label>
                          <Input
                            id="customer_name"
                            {...register('customer_name')}
                            placeholder="Enter customer name"
                          />
                          {errors.customer_name && (
                            <p className="text-sm text-red-500 mt-1">{errors.customer_name.message}</p>
                          )}
                        </div>

                        <div>
                          <Label>Rating</Label>
                          <div className="mt-2">
                            {renderStars(watchRating, true, (rating) => setValue('rating', rating))}
                          </div>
                          {errors.rating && (
                            <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="comment">Review Comment</Label>
                          <Textarea
                            id="comment"
                            {...register('comment')}
                            placeholder="Enter review comment..."
                            rows={4}
                          />
                          {errors.comment && (
                            <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="is_featured"
                            checked={watch('is_featured')}
                            onCheckedChange={(checked) => setValue('is_featured', checked)}
                          />
                          <Label htmlFor="is_featured">Feature this review</Label>
                        </div>

                        <div className="flex space-x-3">
                          <Button type="submit" disabled={isSubmitting} className="flex-1">
                            {isSubmitting ? 'Creating...' : 'Create Review'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowCreateDialog(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading reviews...</p>
                </div>
              ) : paginatedReviews.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Found</h3>
                  <p className="text-gray-600 mb-6">No reviews match your current filters.</p>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Review
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {paginatedReviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white to-amber-50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {review.customer_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{review.customer_name}</h3>
                              <div className="flex items-center space-x-3 mb-2">
                                {renderStars(review.rating)}
                                <span className="text-sm text-gray-600">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {review.is_featured && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                Featured
                              </Badge>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleFeatured(review.id, review.is_featured)}
                              className={review.is_featured ? 'text-yellow-600' : 'text-gray-600'}
                            >
                              {review.is_featured ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(review)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => deleteReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * reviewsPerPage) + 1} to {Math.min(currentPage * reviewsPerPage, filteredReviews.length)} of {filteredReviews.length} reviews
                      </p>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
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

        {/* Featured Reviews Tab */}
        <TabsContent value="featured-reviews">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Star className="h-6 w-6" />
                <span>Featured Reviews</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {reviews.filter(review => review.is_featured).map((review) => (
                  <div
                    key={review.id}
                    className="border border-yellow-200 rounded-xl p-6 bg-gradient-to-r from-yellow-50 to-amber-50"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {review.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{review.customer_name}</h3>
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Star className="h-3 w-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-3 mb-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-600">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {featuredCount === 0 && (
                  <div className="text-center py-12">
                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Reviews</h3>
                    <p className="text-gray-600">Feature some reviews to showcase them prominently.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{reviews.length}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Rating</p>
                    <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Featured Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">{featuredCount}</p>
                  </div>
                  <Award className="h-8 w-8 text-amber-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">5-Star Reviews</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {reviews.filter(r => r.rating === 5).length}
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-green-500 fill-current" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rating Distribution */}
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm mt-6">
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = reviews.filter(r => r.rating === rating).length;
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 w-20">
                        <span className="text-sm font-medium">{rating}</span>
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-400 to-amber-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Review Dialog */}
      {editingReview && (
        <Dialog open={!!editingReview} onOpenChange={() => cancelEditing()}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Review</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="edit-customer_name">Customer Name</Label>
                <Input
                  id="edit-customer_name"
                  {...register('customer_name')}
                  placeholder="Enter customer name"
                />
                {errors.customer_name && (
                  <p className="text-sm text-red-500 mt-1">{errors.customer_name.message}</p>
                )}
              </div>

              <div>
                <Label>Rating</Label>
                <div className="mt-2">
                  {renderStars(watchRating, true, (rating) => setValue('rating', rating))}
                </div>
                {errors.rating && (
                  <p className="text-sm text-red-500 mt-1">{errors.rating.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-comment">Review Comment</Label>
                <Textarea
                  id="edit-comment"
                  {...register('comment')}
                  placeholder="Enter review comment..."
                  rows={4}
                />
                {errors.comment && (
                  <p className="text-sm text-red-500 mt-1">{errors.comment.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_featured"
                  checked={watch('is_featured')}
                  onCheckedChange={(checked) => setValue('is_featured', checked)}
                />
                <Label htmlFor="edit-is_featured">Feature this review</Label>
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Updating...' : 'Update Review'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelEditing}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}