'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Package, Save, Edit, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface PackageItem {
  id: string;
  name: string;
  weight: string;
  price: number;
  originalPrice: number;
  description: string;
  features: string[];
  image: string;
  popular: boolean;
}

interface PackagesSectionData {
  title: string;
  subtitle: string;
  packages: PackageItem[];
  is_active: boolean;
}

interface PackagesSectionEditorProps {
  initialData?: PackagesSectionData;
  onUpdate?: (data: PackagesSectionData) => void;
}

export function PackagesSectionEditor({ initialData, onUpdate }: PackagesSectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [packagesData, setPackagesData] = useState<PackagesSectionData>(
    initialData || {
      title: 'Choose Your Package',
      subtitle: 'Select the perfect mango package for your needs. All packages include premium quality mangoes with our freshness guarantee.',
      packages: [
        {
          id: '1',
          name: '5KG Premium Pack',
          weight: '5KG',
          price: 1200,
          originalPrice: 1500,
          description: 'Perfect for small families',
          features: ['15-20 premium mangoes', 'Eco-friendly packaging', 'Same day delivery in Dhaka', 'Freshness guarantee'],
          image: 'https://images.pexels.com/photos/8844113/pexels-photo-8844113.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
          popular: false
        },
        {
          id: '2',
          name: '10KG Family Pack',
          weight: '10KG',
          price: 2200,
          originalPrice: 2800,
          description: 'Most popular choice',
          features: ['30-40 premium mangoes', 'Premium eco-packaging', 'Free delivery nationwide', 'Quality assurance', 'Bonus: 5 extra mangoes'],
          image: 'https://images.pexels.com/photos/5947081/pexels-photo-5947081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
          popular: true
        },
        {
          id: '3',
          name: '20KG Bulk Pack',
          weight: '20KG',
          price: 4000,
          originalPrice: 5200,
          description: 'Best value for events',
          features: ['60-80 premium mangoes', 'Bulk packaging solution', 'Express delivery', 'Corporate discount available', 'Free storage tips guide'],
          image: 'https://images.pexels.com/photos/1132047/pexels-photo-1132047.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
          popular: false
        }
      ],
      is_active: true
    }
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      await adminService.updateContent('packages', packagesData);
      
      toast({
        title: "Packages Section Updated",
        description: "Packages section has been updated successfully.",
      });
      
      setIsEditing(false);
      onUpdate?.(packagesData);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update packages section.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addPackage = () => {
    const newPackage: PackageItem = {
      id: Date.now().toString(),
      name: 'New Package',
      weight: '5KG',
      price: 1000,
      originalPrice: 1200,
      description: 'Package description',
      features: ['Feature 1', 'Feature 2'],
      image: 'https://images.pexels.com/photos/5947081/pexels-photo-5947081.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop',
      popular: false
    };
    setPackagesData(prev => ({
      ...prev,
      packages: [...prev.packages, newPackage]
    }));
  };

  const removePackage = (id: string) => {
    setPackagesData(prev => ({
      ...prev,
      packages: prev.packages.filter(pkg => pkg.id !== id)
    }));
  };

  const updatePackage = (id: string, field: keyof PackageItem, value: any) => {
    setPackagesData(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === id ? { ...pkg, [field]: value } : pkg
      )
    }));
  };

  const updatePackageFeature = (packageId: string, featureIndex: number, value: string) => {
    setPackagesData(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === packageId
          ? {
              ...pkg,
              features: pkg.features.map((feature, index) =>
                index === featureIndex ? value : feature
              )
            }
          : pkg
      )
    }));
  };

  const addPackageFeature = (packageId: string) => {
    setPackagesData(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === packageId
          ? { ...pkg, features: [...pkg.features, 'New feature'] }
          : pkg
      )
    }));
  };

  const removePackageFeature = (packageId: string, featureIndex: number) => {
    setPackagesData(prev => ({
      ...prev,
      packages: prev.packages.map(pkg =>
        pkg.id === packageId
          ? {
              ...pkg,
              features: pkg.features.filter((_, index) => index !== featureIndex)
            }
          : pkg
      )
    }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Package className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Packages Section</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPackagesData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="text-white hover:bg-white/20"
            >
              {packagesData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                <Label htmlFor="packages-title">Section Title</Label>
                <Input
                  id="packages-title"
                  value={packagesData.title}
                  onChange={(e) => setPackagesData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter section title"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="packages-subtitle">Section Subtitle</Label>
                <Textarea
                  id="packages-subtitle"
                  value={packagesData.subtitle}
                  onChange={(e) => setPackagesData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Enter section subtitle"
                  className="mt-2"
                  rows={2}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Packages</Label>
                <Button
                  onClick={addPackage}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Package
                </Button>
              </div>

              <div className="space-y-6">
                {packagesData.packages.map((pkg, index) => (
                  <div key={pkg.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-medium text-gray-900">Package {index + 1}</span>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={pkg.popular}
                            onCheckedChange={(checked) => updatePackage(pkg.id, 'popular', checked)}
                          />
                          <Label className="text-sm">Popular</Label>
                        </div>
                        <Button
                          onClick={() => removePackage(pkg.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label>Package Name</Label>
                        <Input
                          value={pkg.name}
                          onChange={(e) => updatePackage(pkg.id, 'name', e.target.value)}
                          placeholder="Package name"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Weight</Label>
                        <Input
                          value={pkg.weight}
                          onChange={(e) => updatePackage(pkg.id, 'weight', e.target.value)}
                          placeholder="Package weight"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Input
                          value={pkg.description}
                          onChange={(e) => updatePackage(pkg.id, 'description', e.target.value)}
                          placeholder="Package description"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Price (৳)</Label>
                        <Input
                          type="number"
                          value={pkg.price}
                          onChange={(e) => updatePackage(pkg.id, 'price', parseInt(e.target.value) || 0)}
                          placeholder="Current price"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Original Price (৳)</Label>
                        <Input
                          type="number"
                          value={pkg.originalPrice}
                          onChange={(e) => updatePackage(pkg.id, 'originalPrice', parseInt(e.target.value) || 0)}
                          placeholder="Original price"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label>Image URL</Label>
                        <Input
                          value={pkg.image}
                          onChange={(e) => updatePackage(pkg.id, 'image', e.target.value)}
                          placeholder="Image URL"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Features</Label>
                        <Button
                          onClick={() => addPackageFeature(pkg.id)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Feature
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {pkg.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center space-x-2">
                            <Input
                              value={feature}
                              onChange={(e) => updatePackageFeature(pkg.id, featureIndex, e.target.value)}
                              placeholder="Feature description"
                              className="flex-1"
                            />
                            <Button
                              onClick={() => removePackageFeature(pkg.id, featureIndex)}
                              size="sm"
                              variant="outline"
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
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
                className="bg-orange-500 hover:bg-orange-600"
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
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">Current Packages Section</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Title:</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{packagesData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Subtitle:</span>
                  <p className="text-gray-700 mt-1">{packagesData.subtitle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Packages ({packagesData.packages.length}):</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
                    {packagesData.packages.map((pkg) => (
                      <div key={pkg.id} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          {pkg.popular && (
                            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">Popular</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <p className="text-sm font-medium text-orange-600 mt-1">৳{pkg.price} (was ৳{pkg.originalPrice})</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-orange-500 hover:bg-orange-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Packages Section
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}