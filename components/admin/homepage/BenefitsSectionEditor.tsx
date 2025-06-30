'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Save, Edit, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface BenefitsSectionData {
  title: string;
  subtitle: string;
  benefits: Benefit[];
  is_active: boolean;
}

interface BenefitsSectionEditorProps {
  initialData?: BenefitsSectionData;
  onUpdate?: (data: BenefitsSectionData) => void;
}

const iconOptions = [
  { value: 'heart', label: 'Heart ❤️' },
  { value: 'award', label: 'Award 🏆' },
  { value: 'users', label: 'Users 👥' },
  { value: 'truck', label: 'Truck 🚚' },
  { value: 'leaf', label: 'Leaf 🍃' },
  { value: 'shield', label: 'Shield 🛡️' },
  { value: 'star', label: 'Star ⭐' },
  { value: 'check', label: 'Check ✅' },
];

const colorOptions = [
  { value: 'bg-red-100 text-red-600', label: 'Red' },
  { value: 'bg-emerald-100 text-emerald-600', label: 'Green' },
  { value: 'bg-blue-100 text-blue-600', label: 'Blue' },
  { value: 'bg-yellow-100 text-yellow-600', label: 'Yellow' },
  { value: 'bg-purple-100 text-purple-600', label: 'Purple' },
  { value: 'bg-orange-100 text-orange-600', label: 'Orange' },
];

export function BenefitsSectionEditor({ initialData, onUpdate }: BenefitsSectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [benefitsData, setBenefitsData] = useState<BenefitsSectionData>(
    initialData || {
      title: 'Why Choose Us?',
      subtitle: 'We\'re committed to delivering the finest mangoes with unmatched quality and service',
      benefits: [
        {
          id: '1',
          icon: 'heart',
          title: 'Always Fresh',
          description: 'Harvested daily and delivered within 24-48 hours to ensure maximum freshness and taste.',
          color: 'bg-red-100 text-red-600'
        },
        {
          id: '2',
          icon: 'award',
          title: '100% Organic',
          description: 'Grown without harmful pesticides or chemicals. Certified organic by Bangladesh Standards.',
          color: 'bg-emerald-100 text-emerald-600'
        },
        {
          id: '3',
          icon: 'users',
          title: 'Trusted Farmers',
          description: 'Working directly with experienced farmers from Rajshahi, the mango capital of Bangladesh.',
          color: 'bg-blue-100 text-blue-600'
        }
      ],
      is_active: true
    }
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      await adminService.updateContent('benefits', benefitsData);
      
      toast({
        title: "Benefits Section Updated",
        description: "Benefits section has been updated successfully.",
      });
      
      setIsEditing(false);
      onUpdate?.(benefitsData);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update benefits section.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addBenefit = () => {
    const newBenefit: Benefit = {
      id: Date.now().toString(),
      icon: 'heart',
      title: 'New Benefit',
      description: 'Benefit description',
      color: 'bg-blue-100 text-blue-600'
    };
    setBenefitsData(prev => ({
      ...prev,
      benefits: [...prev.benefits, newBenefit]
    }));
  };

  const removeBenefit = (id: string) => {
    setBenefitsData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(benefit => benefit.id !== id)
    }));
  };

  const updateBenefit = (id: string, field: keyof Benefit, value: string) => {
    setBenefitsData(prev => ({
      ...prev,
      benefits: prev.benefits.map(benefit =>
        benefit.id === id ? { ...benefit, [field]: value } : benefit
      )
    }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Award className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Benefits Section</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBenefitsData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="text-white hover:bg-white/20"
            >
              {benefitsData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="text-white hover:bg-white/20"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isEditing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="benefits-title">Section Title</Label>
                <Input
                  id="benefits-title"
                  value={benefitsData.title}
                  onChange={(e) => setBenefitsData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter section title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="benefits-subtitle">Section Subtitle</Label>
                <Input
                  id="benefits-subtitle"
                  value={benefitsData.subtitle}
                  onChange={(e) => setBenefitsData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter section subtitle"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Benefits</Label>
                <Button
                  onClick={addBenefit}
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Benefit
                </Button>
              </div>

              <div className="space-y-4">
                {benefitsData.benefits.map((benefit, index) => (
                  <div key={benefit.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">Benefit {index + 1}</span>
                      <Button
                        onClick={() => removeBenefit(benefit.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Icon</Label>
                        <Select
                          value={benefit.icon}
                          onValueChange={(value) => updateBenefit(benefit.id, 'icon', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Color</Label>
                        <Select
                          value={benefit.color}
                          onValueChange={(value) => updateBenefit(benefit.id, 'color', value)}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {colorOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Title</Label>
                        <Input
                          value={benefit.title}
                          onChange={(e) => updateBenefit(benefit.id, 'title', e.target.value)}
                          placeholder="Benefit title"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={benefit.description}
                          onChange={(e) => updateBenefit(benefit.id, 'description', e.target.value)}
                          placeholder="Benefit description"
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">Current Benefits Section</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Title:</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{benefitsData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Subtitle:</span>
                  <p className="text-gray-700 mt-1">{benefitsData.subtitle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Benefits ({benefitsData.benefits.length}):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {benefitsData.benefits.map((benefit) => (
                      <div key={benefit.id} className="bg-white p-3 rounded-lg border">
                        <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Benefits Section
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}