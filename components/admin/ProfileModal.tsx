'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import type { User as UserType } from '@/shared/types/entities';
import { PasswordStrength } from '@/components/ui/password-strength';
import { validatePassword } from '@/lib/utils/validation';
import { toast } from 'sonner';



type ProfileModalProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
};

export default function ProfileModal({ isOpen, onClose, user }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };





  const handleSave = async () => {
    setIsLoading(true);
    
    // Debug: Log what we're sending
    console.log('Saving formData:', formData);
    
    try {
      const response = await fetch('/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Close modal and refresh user data
      setIsEditing(false);
      onClose();
      
      // Show success message
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || ''
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    setIsLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || 'Password does not meet requirements');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      alert('Password changed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordError(errorMessage);
      alert(errorMessage);
      console.error('Password change error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" style={{ zIndex: 99999 }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!user ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No user data available</p>
              <p className="text-xs text-gray-500 mt-2">Debug: User is null or undefined</p>
              <p className="text-xs text-gray-500">This usually means you're not logged in or the user data hasn't loaded yet.</p>
              <Button variant="outline" onClick={onClose} className="mt-4">
                Close
              </Button>
            </div>
          ) : (
            <>
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

                                         {/* Account Info */}
                     {user.memberSince && (
                       <div className="flex items-center gap-3">
                         <Calendar className="h-4 w-4 text-muted-foreground" />
                         <div className="flex-1">
                           <Label className="text-sm font-medium">Member Since</Label>
                           <p className="text-sm text-muted-foreground mt-1">
                             {new Date(user.memberSince).toLocaleDateString('en-US', {
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
                     <Button onClick={handleSave} disabled={isLoading}>
                       {isLoading ? 'Saving...' : 'Save Changes'}
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

               {/* Password Change Section */}
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {showPasswordChange ? (
                    <div className="space-y-4">
                      {passwordError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-sm text-red-600">{passwordError}</p>
                        </div>
                      )}
                      {passwordSuccess && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                          <p className="text-sm text-green-600">{passwordSuccess}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="currentPassword" className="text-sm font-medium">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter your current password"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="newPassword" className="text-sm font-medium">
                            New Password
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="mt-1"
                            placeholder="Enter new password"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Must be at least 8 characters long
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="mt-1"
                            placeholder="Confirm new password"
                          />
                                                 </div>
                       </div>
                       
                       {/* Password strength indicator */}
                       <PasswordStrength password={passwordData.newPassword} />
                       
                       <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowPasswordChange(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handlePasswordChange} disabled={isLoading}>
                          {isLoading ? 'Changing...' : 'Change Password'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <h3 className="text-sm font-medium mb-1">Password Security</h3>
                      <p className="text-xs text-muted-foreground mb-3">
                        Keep your account secure by regularly updating your password
                      </p>
                      <Button size="sm" onClick={() => setShowPasswordChange(true)}>
                        <Shield className="h-3 w-3 mr-1" />
                        Change Password
                      </Button>
                    </div>
                  )}
                </CardContent>
                             </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 