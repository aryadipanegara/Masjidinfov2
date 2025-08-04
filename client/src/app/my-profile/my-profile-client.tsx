"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { AuthService } from "@/service/auth.service";
import notify from "@/lib/notify";
import { User, Mail, Lock, LogOut, Shield, Eye, EyeOff } from "lucide-react";
import { UserService } from "@/service/users.service";
import handleErrorResponse from "@/utils/handleErrorResponse";
import useSWR from "swr";
import { useAuth } from "../providers";
import { UserDetail } from "@/types/user.types";

const fetchUserProfile = async (): Promise<UserDetail> => {
  const response = await UserService.getMe();
  return response.data;
};

export default function MyProfileClient() {
  const { logout: authLogout } = useAuth();
  const {
    data: profile,
    error,
    isLoading,
    mutate,
  } = useSWR<UserDetail>("/api/users/me", fetchUserProfile, {
    revalidateOnFocus: false,
  });

  const [updating, setUpdating] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullname: profile?.fullname || "",
    email: profile?.email || "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        fullname: profile.fullname,
        email: profile.email,
      });
    }
  }, [profile]); // Depend on profile from SWR

  const hasPassword = profile?.hasPassword ?? false;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.fullname.trim()) {
      notify.error("Full name is required");
      return;
    }
    if (!profile) return;

    let loadingToast: string | number | undefined;
    try {
      setUpdating(true);
      loadingToast = notify.loading("Updating profile...");
      await UserService.updateUser(profile.id, {
        fullname: profileForm.fullname,
      });
      notify.dismiss(loadingToast);
      notify.success("Profile updated successfully");
      await mutate(); // Revalidate SWR cache to update UI
    } catch (error) {
      if (loadingToast) notify.dismiss(loadingToast);
      handleErrorResponse(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      notify.error("Password must be at least 8 characters long");
      return;
    }
    let loadingToast: string | number | undefined;
    try {
      setUpdating(true);
      loadingToast = notify.loading("Changing password...");
      await AuthService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      notify.dismiss(loadingToast);
      notify.success("Password changed successfully");
      await mutate(); // Revalidate SWR cache to update hasPassword status if needed
    } catch (error) {
      if (loadingToast) notify.dismiss(loadingToast);
      handleErrorResponse(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notify.error("Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      notify.error("Password must be at least 8 characters long");
      return;
    }
    let loadingToast: string | number | undefined;
    try {
      setUpdating(true);
      loadingToast = notify.loading("Setting password...");
      await AuthService.setPassword(passwordForm.newPassword);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      notify.dismiss(loadingToast);
      notify.success(
        "Password set successfully! You can now login with email and password."
      );
      await mutate();
    } catch (error) {
      if (loadingToast) notify.dismiss(loadingToast);
      handleErrorResponse(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    let loadingToast: string | number | undefined;
    try {
      loadingToast = notify.loading("Logging out...");
      await AuthService.logout();
      notify.dismiss(loadingToast);
      authLogout();
      window.location.href = "/login";
    } catch {
      if (loadingToast) notify.dismiss(loadingToast);
      authLogout();
      window.location.href = "/login";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Profile not found
          </h1>
          <p className="text-gray-600 mt-2">
            Unable to load your profile information.
          </p>
          <Button onClick={() => mutate()} className="mt-4">
            {" "}
            {/* Use mutate to retry fetching */}
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={
                      profile.avatar || "/placeholder.svg?height=64&width=64"
                    }
                    alt={profile.fullname}
                  />
                  <AvatarFallback className="text-lg">
                    {profile.fullname
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-xl">{profile.fullname}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={profile.hasGoogleAccount ? "default" : "secondary"}
                >
                  {profile.hasGoogleAccount
                    ? "Google Account"
                    : "Email Account"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  {profile.role.replace("_", " ")}
                </Badge>
                {profile.isVerified && (
                  <Badge
                    variant="outline"
                    className="text-green-600 border-green-600"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {!hasPassword && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    Password Required
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p>
                  Member since:{" "}
                  {new Date(profile.createdAt).toLocaleDateString()}
                </p>
                <p>
                  Last updated:{" "}
                  {new Date(profile.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Update Profile Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Update Profile
              </CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    value={profileForm.fullname}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        fullname: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="Enter your email"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">
                    Email cannot be changed
                  </p>
                </div>
                <Button type="submit" disabled={updating} className="w-full">
                  {updating ? "Updating..." : "Update Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        {/* Password Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {hasPassword ? "Change Password" : "Set Password"}
            </CardTitle>
            <CardDescription>
              {hasPassword
                ? "Update your account password"
                : "Set a password for your Google account to enable email login"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={hasPassword ? handleChangePassword : handleSetPassword}
              className="space-y-4"
            >
              {hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      placeholder="Enter current password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Enter new password (min. 8 characters)"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Confirm new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              {!hasPassword && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">
                        Why set a password?
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Setting a password allows you to login with your email
                        address in addition to Google login, providing you with
                        more flexibility and account security.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <Button type="submit" disabled={updating} className="w-full">
                {updating
                  ? "Processing..."
                  : hasPassword
                  ? "Change Password"
                  : "Set Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
