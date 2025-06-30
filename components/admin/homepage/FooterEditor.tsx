'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Save, Edit, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { adminService } from '@/lib/adminService';

interface FooterLink {
  id: string;
  name: string;
  href: string;
  category: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
}

interface FooterData {
  company_info: string;
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  links: FooterLink[];
  social_links: SocialLink[];
  copyright_text: string;
  is_active: boolean;
}

interface FooterEditorProps {
  initialData?: FooterData;
  onUpdate?: (data: FooterData) => void;
}

const linkCategories = [
  'Quick Links',
  'Customer Service',
  'Company',
  'Legal'
];

const socialPlatforms = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

export function FooterEditor({ initialData, onUpdate }: FooterEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [footerData, setFooterData] = useState<FooterData>(
    initialData || {
      company_info: 'Premium fresh mangoes directly from Bangladeshi farms. Committed to quality, freshness, and customer satisfaction.',
      contact: {
        phone: '+880 1XXX-XXXXXX',
        email: 'info@mangoharvestbd.com',
        address: 'Rajshahi, Bangladesh\nMango Capital of Bangladesh'
      },
      links: [
        { id: '1', name: 'How We Harvest', href: '#harvest', category: 'Quick Links' },
        { id: '2', name: 'Packaging Process', href: '#packaging', category: 'Quick Links' },
        { id: '3', name: 'Mango Packages', href: '#packages', category: 'Quick Links' },
        { id: '4', name: 'Place Order', href: '/order', category: 'Quick Links' },
        { id: '5', name: 'My Account', href: '/profile', category: 'Customer Service' },
        { id: '6', name: 'Track Order', href: '/track', category: 'Customer Service' },
        { id: '7', name: 'FAQ', href: '/faq', category: 'Customer Service' },
        { id: '8', name: 'Support', href: '/support', category: 'Customer Service' },
      ],
      social_links: [
        { id: '1', platform: 'facebook', url: 'https://facebook.com/mangoharvestbd', icon: '📘' },
        { id: '2', platform: 'instagram', url: 'https://instagram.com/mangoharvestbd', icon: '📷' },
      ],
      copyright_text: '© 2024 Mango Harvest BD. All rights reserved.',
      is_active: true
    }
  );
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      await adminService.updateContent('footer', footerData);
      
      toast({
        title: "Footer Updated",
        description: "Footer has been updated successfully.",
      });
      
      setIsEditing(false);
      onUpdate?.(footerData);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update footer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addLink = () => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      name: 'New Link',
      href: '/new',
      category: 'Quick Links'
    };
    setFooterData(prev => ({
      ...prev,
      links: [...prev.links, newLink]
    }));
  };

  const removeLink = (id: string) => {
    setFooterData(prev => ({
      ...prev,
      links: prev.links.filter(link => link.id !== id)
    }));
  };

  const updateLink = (id: string, field: keyof FooterLink, value: string) => {
    setFooterData(prev => ({
      ...prev,
      links: prev.links.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const addSocialLink = () => {
    const newSocialLink: SocialLink = {
      id: Date.now().toString(),
      platform: 'facebook',
      url: 'https://facebook.com/',
      icon: '📘'
    };
    setFooterData(prev => ({
      ...prev,
      social_links: [...prev.social_links, newSocialLink]
    }));
  };

  const removeSocialLink = (id: string) => {
    setFooterData(prev => ({
      ...prev,
      social_links: prev.social_links.filter(link => link.id !== id)
    }));
  };

  const updateSocialLink = (id: string, field: keyof SocialLink, value: string) => {
    setFooterData(prev => ({
      ...prev,
      social_links: prev.social_links.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const groupedLinks = footerData.links.reduce((acc, link) => {
    if (!acc[link.category]) {
      acc[link.category] = [];
    }
    acc[link.category].push(link);
    return acc;
  }, {} as Record<string, FooterLink[]>);

  return (
    <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-t-lg">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold">Footer Content</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFooterData(prev => ({ ...prev, is_active: !prev.is_active }))}
              className="text-white hover:bg-white/20"
            >
              {footerData.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
          <div className="space-y-8">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
              <div>
                <Label htmlFor="company-info">Company Description</Label>
                <Textarea
                  id="company-info"
                  value={footerData.company_info}
                  onChange={(e) => setFooterData(prev => ({ ...prev, company_info: e.target.value }))}
                  placeholder="Enter company description"
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={footerData.contact.phone}
                    onChange={(e) => setFooterData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="Phone number"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    value={footerData.contact.email}
                    onChange={(e) => setFooterData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="Email address"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="contact-address">Address</Label>
                  <Textarea
                    id="contact-address"
                    value={footerData.contact.address}
                    onChange={(e) => setFooterData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, address: e.target.value }
                    }))}
                    placeholder="Address"
                    className="mt-2"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Footer Links</h3>
                <Button
                  onClick={addLink}
                  size="sm"
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>

              <div className="space-y-3">
                {footerData.links.map((link) => (
                  <div key={link.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">Footer Link</span>
                      <Button
                        onClick={() => removeLink(link.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          placeholder="Link URL"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <select
                          value={link.category}
                          onChange={(e) => updateLink(link.id, 'category', e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          {linkCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
                <Button
                  onClick={addSocialLink}
                  size="sm"
                  className="bg-gray-600 hover:bg-gray-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Social Link
                </Button>
              </div>

              <div className="space-y-3">
                {footerData.social_links.map((social) => (
                  <div key={social.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-gray-900">Social Link</span>
                      <Button
                        onClick={() => removeSocialLink(social.id)}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Platform</Label>
                        <select
                          value={social.platform}
                          onChange={(e) => {
                            const platform = socialPlatforms.find(p => p.value === e.target.value);
                            updateSocialLink(social.id, 'platform', e.target.value);
                            if (platform) {
                              updateSocialLink(social.id, 'icon', platform.icon);
                            }
                          }}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                        >
                          {socialPlatforms.map((platform) => (
                            <option key={platform.value} value={platform.value}>
                              {platform.icon} {platform.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input
                          value={social.url}
                          onChange={(e) => updateSocialLink(social.id, 'url', e.target.value)}
                          placeholder="Social media URL"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Copyright</h3>
              <div>
                <Label htmlFor="copyright">Copyright Text</Label>
                <Input
                  id="copyright"
                  value={footerData.copyright_text}
                  onChange={(e) => setFooterData(prev => ({ ...prev, copyright_text: e.target.value }))}
                  placeholder="Copyright text"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-gray-600 hover:bg-gray-700"
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
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-4">Current Footer Content</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Company Info:</span>
                  <p className="text-gray-700 mt-1">{footerData.company_info}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Phone:</span>
                    <p className="text-gray-700">{footerData.contact.phone}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-gray-700">{footerData.contact.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Address:</span>
                    <p className="text-gray-700 whitespace-pre-line">{footerData.contact.address}</p>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Footer Links by Category:</span>
                  <div className="mt-2 space-y-2">
                    {Object.entries(groupedLinks).map(([category, links]) => (
                      <div key={category} className="bg-white p-3 rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {links.map((link) => (
                            <span key={link.id} className="text-sm bg-gray-100 px-2 py-1 rounded">
                              {link.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Social Links:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {footerData.social_links.map((social) => (
                      <span key={social.id} className="text-sm bg-white px-3 py-2 rounded border">
                        {social.icon} {social.platform}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Copyright:</span>
                  <p className="text-gray-700 mt-1">{footerData.copyright_text}</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Footer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}