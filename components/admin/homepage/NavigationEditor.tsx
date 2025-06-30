'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigation, Save, Edit, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface NavigationLink {
  id: string;
  name: string;
  href: string;
  order: number;
}

interface NavigationData {
  brand_name: string;
  brand_logo?: string;
  links: NavigationLink[];
  is_active: boolean;
}

interface NavigationEditorProps {
  initialData?: NavigationData;
  onUpdate?: (data: NavigationData) => void;
}

export function NavigationEditor({ initialData, onUpdate }: NavigationEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [navData, setNavData] = useState<NavigationData>(
    initialData || {
      brand_name: 'Mango Harvest BD',
      brand_logo: '',
      links: [
        { id: '1', name: 'How We Harvest', href: '#harvest', order: 1 },
        { id: '2', name: 'Packaging', href: '#packaging', order: 2 },
        { id: '3', name: 'Packages', href: '#packages', order: 3 },
        { id: '4', name: 'Reviews', href: '#reviews', order: 4 },
      ],
      is_active: true
    }
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      await adminService.updateContent('navigation', navData);
      
      toast({
        title: "Navigation Updated",
        description: "Navigation has been updated successfully.",
      });
      
      setIsEditing(false);
      onUpdate?.(navData);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update navigation.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLink = () => {
    const newLink: NavigationLink = {
      id: Date.now().toString(),
      name: 'New Link',
      href: '#new',
      order: navData.links.length + 1
    };
    setNavData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const removeLink = (id: string) => {
    setNavData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const updateLink = (id: string, field: keyof NavigationLink, value: string | number) => {
    setNavData(prev => ({
      ...prev,
      links: prev.links.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const moveLink = (id: string, direction: 'up' | 'down') => {
    const currentIndex = navData.links.findIndex(link => link.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === navData.links.length - 1)
    ) {
      return;
    }

    const newLinks = [...navData.links];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newLinks[currentIndex], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[currentIndex]];
    
    // Update order numbers
    newLinks.forEach((link, index) => {
      link.order = index + 1;
    });

    setNavData(prev => ({ ...prev, links: newLinks }));
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Navigation className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Navigation Menu</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNavData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="text-white hover:bg-white/20"
            >
              {navData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
                <Label htmlFor="brand-name">Brand Name</Label>
                <Input
                  id="brand-name"
                  value={navData.brand_name}
                  onChange={(e) => setNavData(prev => ({ ...prev, brand_name: e.target.value }))}
                  placeholder="Enter brand name"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="brand-logo">Brand Logo URL (Optional)</Label>
                <Input
                  id="brand-logo"
                  value={navData.brand_logo || ''}
                  onChange={(e) => setNavData(prev => ({ ...prev, brand_logo: e.target.value }))}
                  placeholder="Enter logo URL"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Navigation Links</Label>
                <Button
                  onClick={addLink}
                  size="sm"
                  className="bg-indigo-500 hover:bg-indigo-600"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-3">
                {navData.links
                  .sort((a, b) => a.order - b.order)
                  .map((link, index) => (
                    <div key={link.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">Link {index + 1}</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => moveLink(link.id, 'up')}
                            size="sm"
                            variant="outline"
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            onClick={() => moveLink(link.id, 'down')}
                            size="sm"
                            variant="outline"
                            disabled={index === navData.links.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            onClick={() => removeLink(link.id)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Link Text</Label>
                          <Input
                            value={link.name}
                            onChange={(e) => updateLink(link.id, 'name', e.target.value)}
                            placeholder="Link text"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Link URL</Label>
                          <Input
                            value={link.href}
                            onChange={(e) => updateLink(link.id, 'href', e.target.value)}
                            placeholder="Link URL (e.g., #section or /page)"
                            className="mt-1"
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
                className="bg-indigo-500 hover:bg-indigo-600"
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
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">Current Navigation</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Brand Name:</span>
                  <p className="text-lg font-bold text-gray-900 mt-1">{navData.brand_name}</p>
                </div>
                {navData.brand_logo && (
                  <div>
                    <span className="text-sm font-medium text-gray-600">Brand Logo:</span>
                    <div className="mt-2 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={navData.brand_logo}
                        alt="Brand logo"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-sm font-medium text-gray-600">Navigation Links ({navData.links.length}):</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {navData.links
                      .sort((a, b) => a.order - b.order)
                      .map((link) => (
                        <div key={link.id} className="bg-white px-3 py-2 rounded-lg border text-sm">
                          <span className="font-medium">{link.name}</span>
                          <span className="text-gray-500 ml-2">({link.href})</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-indigo-500 hover:bg-indigo-600"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Navigation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}