'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Layout, Globe, Award, Package, Navigation, Settings, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { HeroSectionEditor } from './HeroSectionEditor';
import { BenefitsSectionEditor } from './BenefitsSectionEditor';
import { PackagesSectionEditor } from './PackagesSectionEditor';
import { NavigationEditor } from './NavigationEditor';
import { FooterEditor } from './FooterEditor';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface SectionStatus {
  name: string;
  is_active: boolean;
  last_updated: string;
}

export function HomepageManager() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sectionsStatus, setSectionsStatus] = useState<Record<string, SectionStatus>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSectionsStatus();
  }, []);

  const fetchSectionsStatus = async () => {
    try {
      setLoading(true);
      const contentSections = await adminService.getContentManagement();
      
      const statusMap: Record<string, SectionStatus> = {};
      contentSections.forEach(section => {
        statusMap[section.section] = {
          name: section.section,
          is_active: section.is_active,
          last_updated: section.updated_at
        };
      });

      setSectionsStatus(statusMap);
    } catch (error: any) {
      console.error('Failed to fetch sections status:', error);
      toast({
        title: "Error",
        description: "Failed to fetch sections status.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshSections = async () => {
    setRefreshing(true);
    await fetchSectionsStatus();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Homepage sections status updated.",
    });
  };

  const handleSectionUpdate = (sectionName: string, data: any) => {
    setSectionsStatus(prev => ({
      ...prev,
      [sectionName]: {
        name: sectionName,
        is_active: data.is_active ?? true,
        last_updated: new Date().toISOString()
      }
    }));
  };

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case 'hero': return Globe;
      case 'benefits': return Award;
      case 'packages': return Package;
      case 'navigation': return Navigation;
      case 'footer': return Settings;
      default: return Layout;
    }
  };

  const getSectionDisplayName = (sectionName: string) => {
    switch (sectionName) {
      case 'hero': return 'Hero Section';
      case 'benefits': return 'Benefits Section';
      case 'packages': return 'Packages Section';
      case 'navigation': return 'Navigation Menu';
      case 'footer': return 'Footer Content';
      default: return sectionName.charAt(0).toUpperCase() + sectionName.slice(1);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading homepage sections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-t-lg">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Layout className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-semibold">Homepage Management</span>
            </div>
            <Button
              onClick={refreshSections}
              disabled={refreshing}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(sectionsStatus).map(([sectionName, status]) => {
              const IconComponent = getSectionIcon(sectionName);
              return (
                <div key={sectionName} className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <IconComponent className="h-4 w-4 text-indigo-600" />
                      </div>
                      <span className="font-medium text-gray-900">{getSectionDisplayName(sectionName)}</span>
                    </div>
                    <Badge className={status.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {status.is_active ? (
                        <><Eye className="h-3 w-3 mr-1" />Active</>
                      ) : (
                        <><EyeOff className="h-3 w-3 mr-1" />Inactive</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(status.last_updated).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section Editors */}
      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="hero" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Hero</span>
          </TabsTrigger>
          <TabsTrigger value="benefits" className="flex items-center space-x-2">
            <Award className="h-4 w-4" />
            <span>Benefits</span>
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Packages</span>
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center space-x-2">
            <Navigation className="h-4 w-4" />
            <span>Navigation</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Footer</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <HeroSectionEditor onUpdate={(data) => handleSectionUpdate('hero', data)} />
        </TabsContent>

        <TabsContent value="benefits">
          <BenefitsSectionEditor onUpdate={(data) => handleSectionUpdate('benefits', data)} />
        </TabsContent>

        <TabsContent value="packages">
          <PackagesSectionEditor onUpdate={(data) => handleSectionUpdate('packages', data)} />
        </TabsContent>

        <TabsContent value="navigation">
          <NavigationEditor onUpdate={(data) => handleSectionUpdate('navigation', data)} />
        </TabsContent>

        <TabsContent value="footer">
          <FooterEditor onUpdate={(data) => handleSectionUpdate('footer', data)} />
        </TabsContent>
      </Tabs>
    </div>
  );
}