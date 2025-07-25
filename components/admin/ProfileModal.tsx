'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Building, Phone, Calendar, Shield } from 'lucide-react';
import type { User as UserType } from '@/shared/types/entities';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // TODO: Implement profile update functionality
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      organization: user?.organization || '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">
                {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                  <Shield className="h-3 w-3 mr-1" />
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Badge>
                <Badge variant="outline">
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Email</Label>
                    {isEditing ? (
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="mt-1"
                        disabled
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">First Name</Label>
                      {isEditing ? (
                        <Input
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{user.firstName}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Last Name</Label>
                      {isEditing ? (
                        <Input
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">{user.lastName}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Phone</Label>
                    {isEditing ? (
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.phone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Organization */}
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Organization</Label>
                    {isEditing ? (
                      <Input
                        name="organization"
                        value={formData.organization}
                        onChange={handleInputChange}
                        className="mt-1"
                        placeholder="Enter organization"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {user.organization || 'Not specified'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                {user.createdAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Member Since</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}

                {user.lastLoginAt && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <Label className="text-sm font-medium">Last Login</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 