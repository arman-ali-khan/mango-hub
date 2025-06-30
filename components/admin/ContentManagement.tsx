'use client';
import React from "react"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  FileText, 
  Navigation, 
  Image, 
  Star, 
  MessageSquare, 
  Settings,
  Save,
  Plus,
  Trash2,
  Edit,
  Eye,
  Globe,
  Layout,
  Package,
  Users,
  Award,
  Truck,
  Heart,
  Leaf,
  Shield,
  Recycle,
  Thermometer,
  TreePine,
  Sunrise,
  PackageCheck,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface ContentSection {
  id: string;
  section: string;
  content: any;
  is_active: boolean;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

interface NewSectionData {
  name: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  is_active: boolean;
}

const sectionTypes = [
  { id: 'hero', name: 'Hero Section', icon: Globe },
  { id: 'features', name: 'Features Grid', icon: Layout },
  { id: 'benefits', name: 'Benefits Section', icon: Award },
  { id: 'process', name: 'Process Steps', icon: Package },
  { id: 'testimonials', name: 'Customer Reviews', icon: Users },
  { id: 'cta', name: 'Call to Action', icon: MessageSquare },
];

const iconOptions = [
  { id: 'heart', name: 'Heart', icon: Heart },
  { id: 'award', name: 'Award', icon: Award },
  { id: 'users', name: 'Users', icon: Users },
  { id: 'truck', name: 'Truck', icon: Truck },
  { id: 'leaf', name: 'Leaf', icon: Leaf },
  { id: 'shield', name: 'Shield', icon: Shield },
  { id: 'recycle', name: 'Recycle', icon: Recycle },
  { id: 'thermometer', name: 'Thermometer', icon: Thermometer },
  { id: 'tree-pine', name: 'Tree Pine', icon: TreePine },
  { id: 'sunrise', name: 'Sunrise', icon: Sunrise },
  { id: 'package-check', name: 'Package Check', icon: PackageCheck },
  { id: 'package', name: 'Package', icon: Package },
];

export function ContentManagement() {
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newSection, setNewSection] = useState<NewSectionData>({
    name: '',
    type: '',
    title: '',
    description: '',
    icon: 'heart',
    order: 1,
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchContentSections();
  }, []);

  const fetchContentSections = async () => {
    try {
      setLoading(true);
      const sections = await adminService.getContentManagement();
      setContentSections(sections);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch content sections.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (section: ContentSection) => {
    setEditingSection(section.section);
    setEditContent(section.content);
  };

  const saveContent = async (sectionName: string) => {
    try {
      await adminService.updateContent(sectionName, editContent);
      
      // Update local state
      setContentSections(sections => 
        sections.map(section => 
          section.section === sectionName 
            ? { ...section, content: editContent, updated_at: new Date().toISOString() }
            : section
        )
      );

      setEditingSection(null);
      setEditContent({});
      
      toast({
        title: "Content Updated",
        description: "Content section has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update content.",
        variant: "destructive",
      });
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditContent({});
  };

  const createNewSection = async () => {
    try {
      if (!newSection.name || !newSection.type || !newSection.title) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      const sectionContent = {
        type: newSection.type,
        title: newSection.title,
        description: newSection.description,
        icon: newSection.icon,
        order: newSection.order,
        is_active: newSection.is_active,
        created_at: new Date().toISOString()
      };

      await adminService.updateContent(newSection.name, sectionContent);
      
      // Add to local state
      const newContentSection: ContentSection = {
        id: `temp-${Date.now()}`,
        section: newSection.name,
        content: sectionContent,
        is_active: newSection.is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setContentSections(sections => [...sections, newContentSection]);
      
      // Reset form
      setNewSection({
        name: '',
        type: '',
        title: '',
        description: '',
        icon: 'heart',
        order: 1,
        is_active: true
      });
      
      setShowCreateDialog(false);
      
      toast({
        title: "Section Created",
        description: "New homepage section has been created successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create section.",
        variant: "destructive",
      });
    }
  };

  const deleteSection = async (sectionName: string) => {
    try {
      // Mark as inactive instead of deleting
      const section = contentSections.find(s => s.section === sectionName);
      if (section) {
        await adminService.updateContent(sectionName, { ...section.content, is_active: false });
        
        setContentSections(sections => 
          sections.map(s => 
            s.section === sectionName 
              ? { ...s, is_active: false }
              : s
          )
        );
        
        toast({
          title: "Section Deactivated",
          description: "Section has been deactivated successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Deactivation Failed",
        description: error.message || "Failed to deactivate section.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading content sections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="homepage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white shadow-lg rounded-xl p-1">
          <TabsTrigger value="homepage" className="flex items-center space-x-2">
            <Layout className="h-4 w-4" />
            <span>Homepage</span>
          </TabsTrigger>
          <TabsTrigger value="hero" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Hero</span>
          </TabsTrigger>
          <TabsTrigger value="navigation" className="flex items-center space-x-2">
            <Navigation className="h-4 w-4" />
            <span>Navigation</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="flex items-center space-x-2">
            <Star className="h-4 w-4" />
            <span>Reviews</span>
          </TabsTrigger>
          <TabsTrigger value="footer" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Footer</span>
          </TabsTrigger>
        </TabsList>

        {/* Homepage Sections Management */}
        <TabsContent value="homepage">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Layout className="h-6 w-6" />
                  <span>Homepage Sections</span>
                </div>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-emerald-600 hover:bg-white/90 font-semibold">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Section
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create New Homepage Section</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="section-name">Section Name *</Label>
                          <Input
                            id="section-name"
                            value={newSection.name}
                            onChange={(e) => setNewSection({...newSection, name: e.target.value})}
                            placeholder="e.g., benefits-section"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section-type">Section Type *</Label>
                          <Select
                            value={newSection.type}
                            onValueChange={(value) => setNewSection({...newSection, type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {sectionTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center space-x-2">
                                    <type.icon className="h-4 w-4" />
                                    <span>{type.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="section-title">Section Title *</Label>
                        <Input
                          id="section-title"
                          value={newSection.title}
                          onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                          placeholder="e.g., Why Choose Us?"
                        />
                      </div>

                      <div>
                        <Label htmlFor="section-description">Description</Label>
                        <Textarea
                          id="section-description"
                          value={newSection.description}
                          onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                          placeholder="Section description..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="section-icon">Icon</Label>
                          <Select
                            value={newSection.icon}
                            onValueChange={(value) => setNewSection({...newSection, icon: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {iconOptions.map((icon) => (
                                <SelectItem key={icon.id} value={icon.id}>
                                  <div className="flex items-center space-x-2">
                                    <icon.icon className="h-4 w-4" />
                                    <span>{icon.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="section-order">Display Order</Label>
                          <Input
                            id="section-order"
                            type="number"
                            value={newSection.order}
                            onChange={(e) => setNewSection({...newSection, order: parseInt(e.target.value) || 1})}
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="section-active"
                          checked={newSection.is_active}
                          onCheckedChange={(checked) => setNewSection({...newSection, is_active: checked})}
                        />
                        <Label htmlFor="section-active">Active</Label>
                      </div>

                      <div className="flex space-x-3">
                        <Button onClick={createNewSection} className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Section
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCreateDialog(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {contentSections
                  .filter(section => !['hero', 'navigation', 'footer'].includes(section.section))
                  .map(section => (
                    <div key={section.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white">
                            {section.content.icon && iconOptions.find(icon => icon.id === section.content.icon) ? (
                              React.createElement(iconOptions.find(icon => icon.id === section.content.icon)!.icon, { className: "h-6 w-6" })
                            ) : (
                              <FileText className="h-6 w-6" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">{section.content.title || section.section}</h3>
                            <p className="text-sm text-gray-600">Type: {section.content.type || 'Custom'}</p>
                            <p className="text-xs text-gray-500">
                              Last updated: {new Date(section.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={section.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {section.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEditing(section)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => deleteSection(section.section)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {section.content.description && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <p className="text-sm text-gray-700">{section.content.description}</p>
                        </div>
                      )}

                      {editingSection === section.section && (
                        <div className="border-t pt-4 mt-4 space-y-4">
                          <div>
                            <Label>Section Title</Label>
                            <Input
                              value={editContent.title || ''}
                              onChange={(e) => setEditContent({...editContent, title: e.target.value})}
                              placeholder="Section title"
                            />
                          </div>
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={editContent.description || ''}
                              onChange={(e) => setEditContent({...editContent, description: e.target.value})}
                              placeholder="Section description"
                              rows={3}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Icon</Label>
                              <Select
                                value={editContent.icon || 'heart'}
                                onValueChange={(value) => setEditContent({...editContent, icon: value})}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {iconOptions.map((icon) => (
                                    <SelectItem key={icon.id} value={icon.id}>
                                      <div className="flex items-center space-x-2">
                                        <icon.icon className="h-4 w-4" />
                                        <span>{icon.name}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Display Order</Label>
                              <Input
                                type="number"
                                value={editContent.order || 1}
                                onChange={(e) => setEditContent({...editContent, order: parseInt(e.target.value) || 1})}
                                min="1"
                              />
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={editContent.is_active !== false}
                              onCheckedChange={(checked) => setEditContent({...editContent, is_active: checked})}
                            />
                            <Label>Active</Label>
                          </div>
                          <div className="flex space-x-3">
                            <Button onClick={() => saveContent(section.section)}>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </Button>
                            <Button variant="outline" onClick={cancelEditing}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                {contentSections.filter(section => !['hero', 'navigation', 'footer'].includes(section.section)).length === 0 && (
                  <div className="text-center py-12">
                    <Layout className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Custom Sections</h3>
                    <p className="text-gray-600 mb-6">Create your first homepage section to get started</p>
                    <Button onClick={() => setShowCreateDialog(true)} className="bg-emerald-500 hover:bg-emerald-600">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Section
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero Section Management */}
        <TabsContent value="hero">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Globe className="h-6 w-6" />
                <span>Hero Section</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {contentSections
                .filter(section => section.section === 'hero')
                .map(section => (
                  <div key={section.id} className="space-y-4">
                    {editingSection === 'hero' ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Main Title</Label>
                          <Input
                            value={editContent.title || ''}
                            onChange={(e) => setEditContent({...editContent, title: e.target.value})}
                            placeholder="Hero section title"
                          />
                        </div>
                        <div>
                          <Label>Subtitle</Label>
                          <Textarea
                            value={editContent.subtitle || ''}
                            onChange={(e) => setEditContent({...editContent, subtitle: e.target.value})}
                            placeholder="Hero section subtitle"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Call to Action Text</Label>
                          <Input
                            value={editContent.cta_text || ''}
                            onChange={(e) => setEditContent({...editContent, cta_text: e.target.value})}
                            placeholder="Button text"
                          />
                        </div>
                        <div className="flex space-x-3">
                          <Button onClick={() => saveContent('hero')}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-2">Current Hero Content</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Title:</strong> {section.content.title}</p>
                            <p><strong>Subtitle:</strong> {section.content.subtitle}</p>
                            <p><strong>CTA Text:</strong> {section.content.cta_text}</p>
                          </div>
                        </div>
                        <Button onClick={() => startEditing(section)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Hero Section
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Management */}
        <TabsContent value="navigation">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Navigation className="h-6 w-6" />
                <span>Navigation Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {contentSections
                .filter(section => section.section === 'navigation')
                .map(section => (
                  <div key={section.id} className="space-y-4">
                    {editingSection === 'navigation' ? (
                      <div className="space-y-4">
                        <Label>Navigation Links (JSON Format)</Label>
                        <Textarea
                          value={JSON.stringify(editContent, null, 2)}
                          onChange={(e) => {
                            try {
                              setEditContent(JSON.parse(e.target.value));
                            } catch (error) {
                              // Invalid JSON, keep the text for editing
                            }
                          }}
                          rows={10}
                          className="font-mono text-sm"
                        />
                        <div className="flex space-x-3">
                          <Button onClick={() => saveContent('navigation')}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-3">Current Navigation Links</h3>
                          <div className="space-y-2">
                            {section.content.links?.map((link: any, index: number) => (
                              <div key={index} className="flex items-center space-x-3 text-sm">
                                <Badge variant="outline">{link.name}</Badge>
                                <span className="text-gray-600">{link.href}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <Button onClick={() => startEditing(section)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Navigation
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reviews Management */}
        <TabsContent value="reviews">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Star className="h-6 w-6" />
                <span>Customer Reviews</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews Management</h3>
                <p className="text-gray-600 mb-6">Manage customer reviews and testimonials</p>
                <div className="flex justify-center space-x-4">
                  <Button className="bg-amber-500 hover:bg-amber-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review
                  </Button>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Reviews
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Management */}
        <TabsContent value="footer">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center space-x-3">
                <Settings className="h-6 w-6" />
                <span>Footer Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {contentSections
                .filter(section => section.section === 'footer')
                .map(section => (
                  <div key={section.id} className="space-y-4">
                    {editingSection === 'footer' ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Company Information</Label>
                          <Textarea
                            value={editContent.company_info || ''}
                            onChange={(e) => setEditContent({...editContent, company_info: e.target.value})}
                            placeholder="Company description"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label>Phone</Label>
                            <Input
                              value={editContent.contact?.phone || ''}
                              onChange={(e) => setEditContent({
                                ...editContent, 
                                contact: {...editContent.contact, phone: e.target.value}
                              })}
                              placeholder="Phone number"
                            />
                          </div>
                          <div>
                            <Label>Email</Label>
                            <Input
                              value={editContent.contact?.email || ''}
                              onChange={(e) => setEditContent({
                                ...editContent, 
                                contact: {...editContent.contact, email: e.target.value}
                              })}
                              placeholder="Email address"
                            />
                          </div>
                          <div>
                            <Label>Address</Label>
                            <Input
                              value={editContent.contact?.address || ''}
                              onChange={(e) => setEditContent({
                                ...editContent, 
                                contact: {...editContent.contact, address: e.target.value}
                              })}
                              placeholder="Address"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button onClick={() => saveContent('footer')}>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={cancelEditing}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-gray-900 mb-3">Current Footer Content</h3>
                          <div className="space-y-2 text-sm">
                            <p><strong>Company Info:</strong> {section.content.company_info}</p>
                            <p><strong>Phone:</strong> {section.content.contact?.phone}</p>
                            <p><strong>Email:</strong> {section.content.contact?.email}</p>
                            <p><strong>Address:</strong> {section.content.contact?.address}</p>
                          </div>
                        </div>
                        <Button onClick={() => startEditing(section)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Footer
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}