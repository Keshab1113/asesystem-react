import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { UserCircle, Mail, Phone, Calendar, Edit, Save, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useToast from "../../../hooks/ToastContext"
import { updateUser } from "../../../redux/slices/authSlice";

export function MyAccountPage() {
  const [isEditing, setIsEditing] = useState(false);
  const { user, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(user);
  const [editData, setEditData] = useState(user);
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUserData(editData);
        setIsEditing(false);
        dispatch(updateUser(editData));
        toast({
          title: "Profile Updated",
          description: "User updated successfully!",
          variant: "success"
        });
      } else {
        console.error("Update failed:", data.message || "Unknown error");
        toast({
          title: "Update failed",
          description: data.message,
          variant: "error"
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update error",
        description: "An error occurred while updating user data",
        variant: "error"
      });
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Account</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCircle className="h-5 w-5 mr-2" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={userData.avatar || "/admin-avatar.png"}
                  alt={userData.name}
                />
                <AvatarFallback>
                  {userData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h3 className="font-semibold text-lg">{userData.name}</h3>
                <Badge variant="default" className="mt-1">
                  {userData.role === "super_admin"
                    ? "Super Admin"
                    : userData.role}
                </Badge>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{userData.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  Joined {new Date(userData?.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({ ...editData, name: e.target.value })
                    }
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">{userData.name}</div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({ ...editData, email: e.target.value })
                    }
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    {userData.email}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({ ...editData, phone: e.target.value })
                    }
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md">
                    {userData.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Department</Label>
                {isEditing ? (
                  <Input
                    id="position"
                    value={editData.position}
                    onChange={(e) =>
                      setEditData({ ...editData, position: e.target.value })
                    }
                  />
                ) : (
                  <div className="p-2 bg-muted rounded-md max-h-10 truncate overflow-hidden whitespace-nowrap text-ellipsis">
                    {userData.position}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="p-2 bg-muted rounded-md">
                  {userData.role === "super_admin"
                    ? "Super Admin"
                    : userData.role}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Last Login</Label>
                <div className="p-2 bg-muted rounded-md">
                  {userData.last_login
                    ? new Date(userData.last_login).toLocaleString()
                    : "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">156</div>
            <div className="text-sm text-muted-foreground">Assessment Created</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">2,340</div>
            <div className="text-sm text-muted-foreground">
              Total Participants
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">89</div>
            <div className="text-sm text-muted-foreground">
              Certificates Issued
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">45</div>
            <div className="text-sm text-muted-foreground">Active Subjects</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
