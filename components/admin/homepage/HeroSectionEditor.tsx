'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Save, Edit, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface HeroSectionData {
  title: string;
  subtitle: string;
  cta_text: string;
  background_image?: string;
  is_active: boolean;
}

interface HeroSectionEditorProps {
  initialData?: HeroSectionData;
  onUpdate?: (data: HeroSectionData) => void;
}

export function HeroSectionEditor({ initialData, onUpdate }: HeroSectionEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [heroData, setHeroData] = useState<HeroSectionData>(
    initialData || {
      title: 'Premium Fresh Mangoes From Bangladesh',
      subtitle: 'Experience the sweetest, juiciest mangoes directly from our sustainable farms. Eco-friendly packaging, nationwide delivery.',
      cta_text: 'Shop Now',
      background_image: 'https://images.pexels.com/photos/5966630/pexels-photo-5966630.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
      is_active: true
    }
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      await adminService.updateContent('hero', heroData);
      
      toast({
        title: "Hero Section Updated",
        description: "Hero section has been updated successfully.",
      });
      
      setIsEditing(false);
      onUpdate?.(heroData);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update hero section.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setHeroData(initialData);
    }
    setIsEditing(false);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Hero Section</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHeroData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="text-white hover:bg-white/20"
            >
              {heroData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
            <div>
              <Label htmlFor="hero-title" className="text-sm font-medium text-gray-700">Main Title</Label>
              <Input
                id="hero-title"
                value={heroData.title}
                onChange={(e) => setHeroData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter hero section title"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="hero-subtitle" className="text-sm font-medium text-gray-700">Subtitle</Label>
              <Textarea
                id="hero-subtitle"
                value={heroData.subtitle}
                onChange={(e) => setHeroData(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Enter hero section subtitle"
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="hero-cta" className="text-sm font-medium text-gray-700">Call to Action Text</Label>
              <Input
                id="hero-cta"
                value={heroData.cta_text}
                onChange={(e) => setHeroData(prev => ({ ...prev, cta_text: e.target.value }))}
                placeholder="Enter CTA button text"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="hero-bg" className="text-sm font-medium text-gray-700">Background Image URL</Label>
              <Input
                id="hero-bg"
                value={heroData.background_image || ''}
                onChange={(e) => setHeroData(prev => ({ ...prev, background_image: e.target.value }))}
                placeholder="Enter background image URL"
                className="mt-2"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">Current Hero Content</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Title:</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{heroData.title}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Subtitle:</span>
                  <p className="text-gray-700 mt-1">{heroData.subtitle}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">CTA Text:</span>
                  <p className="text-blue-600 font-semibold mt-1">{heroData.cta_text}</p>
                </div>
                {heroData.background_image && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Background Image:</span>
                    <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={heroData.background_image}
                        alt="Hero background"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/5966630/pexels-photo-5966630.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Hero Section
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}