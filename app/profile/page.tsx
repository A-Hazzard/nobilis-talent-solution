'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Shield, 
  Edit,
  Save,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserStore } from '@/lib/stores/userStore';
import { toast } from 'sonner';
import { PasswordStrength } from '@/components/ui/password-strength';
import { validatePassword } from '@/lib/utils/validation';




export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const userStore = useUserStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user, isAuthenticated, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };





  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
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

      // Refresh user data in the store
      await userStore.refreshUserData();
      
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordError(passwordValidation.error || 'Password does not meet requirements');
      setLoading(false);
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
        // Use the specific error message from the API response
        throw new Error(data.error || 'Failed to change password');
      }

      setPasswordSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordChange(false);
      toast.success('Password changed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
      console.error('Password change error:', error);
      
      // Clear password fields on error for security
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-muted-foreground mt-2">Manage your account information and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Profile Header Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <Button
                  variant={isEditing ? "outline" : "default"}
                  onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                  className="flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-xl">
                    {user.firstName?.charAt(0).toUpperCase()}{user.lastName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user.role === 'admin' ? 'Administrator' : 'User'}
                    </Badge>
                    <Badge variant="outline">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {user.emailVerified && (
                      <Badge variant="outline" className="text-green-600">
                        Email Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      First Name
                    </Label>
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

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Last Name
                    </Label>
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

                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
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



                  <div>
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Member Since
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(user.memberSince || user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>



                     {/* Save Button */}
           {isEditing && (
             <Card>
               <CardContent className="pt-6">
                 <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={handleCancel}>
                     Cancel
                   </Button>
                   <Button onClick={handleSave} disabled={loading}>
                     <Save className="h-4 w-4 mr-2" />
                     {loading ? 'Saving...' : 'Save Changes'}
                   </Button>
                 </div>
               </CardContent>
             </Card>
           )}

           {/* Password Change Card */}
           <Card>
             <CardHeader>
               <div className="flex items-center justify-between">
                 <CardTitle className="flex items-center gap-2">
                   <Shield className="h-5 w-5" />
                   Security Settings
                 </CardTitle>
                 <Button
                   variant={showPasswordChange ? "outline" : "default"}
                   onClick={() => setShowPasswordChange(!showPasswordChange)}
                   className="flex items-center gap-2"
                 >
                   {showPasswordChange ? (
                     <>
                       <X className="h-4 w-4" />
                       Cancel
                     </>
                   ) : (
                     <>
                       <Shield className="h-4 w-4" />
                       Change Password
                     </>
                   )}
                 </Button>
               </div>
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
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                       <Button onClick={handlePasswordChange} disabled={loading}>
                         {loading ? 'Changing...' : 'Change Password'}
                       </Button>
                     </div>
                   </div>
                 ) : (
                   <div className="text-center py-8">
                     <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                     <h3 className="text-lg font-medium mb-2">Password Security</h3>
                     <p className="text-muted-foreground mb-4">
                       Keep your account secure by regularly updating your password
                     </p>
                     <Button onClick={() => setShowPasswordChange(true)}>
                       <Shield className="h-4 w-4 mr-2" />
                       Change Password
                     </Button>
                   </div>
                 )}
               </CardContent>
             </Card>
         </div>
       </div>
     </div>
     );
}
