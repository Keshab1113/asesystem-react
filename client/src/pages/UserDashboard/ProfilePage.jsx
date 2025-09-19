import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Mail,
  Building,
  Award as IdCard,
  MonitorCog,
  UsersRound,
  Edit,
  Save,
  X,
  Trophy,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  FileText,
  Phone,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import { Slider } from "@/components/ui/slider";
import Cropper from "react-easy-crop";
import useToast from "../../hooks/ToastContext";
import { useDispatch, useSelector } from "react-redux";
import { updateUser } from "../../redux/slices/authSlice";
import { SearchableSelect } from "../../components/SearchableSelect";
import ProfilePicture from "../../components/ProfilePicture/ProfilePicture";

// Mock assessment history data
const mockAssessmentHistory = [
  {
    id: 1,
    title: "JavaScript Fundamentals",
    category: "Programming",
    completedDate: "2024-01-15",
    score: 92,
    passed: true,
    passingScore: 70,
    duration: 45,
    attempts: 1,
  },
  {
    id: 2,
    title: "React Components & Props",
    category: "Programming",
    completedDate: "2024-01-10",
    score: 78,
    passed: true,
    passingScore: 75,
    duration: 60,
    attempts: 2,
  },
  {
    id: 3,
    title: "Database Design Principles",
    category: "Database",
    completedDate: "2024-01-03",
    score: 85,
    passed: true,
    passingScore: 80,
    duration: 90,
    attempts: 2,
  },
  {
    id: 4,
    title: "API Development Best Practices",
    category: "Backend",
    completedDate: "2023-11-28",
    score: 92,
    passed: true,
    passingScore: 75,
    duration: 75,
    attempts: 1,
  },
  {
    id: 5,
    title: "Security Fundamentals",
    category: "Security",
    completedDate: "2023-10-24",
    score: 72,
    passed: false,
    passingScore: 80,
    duration: 60,
    attempts: 3,
  },
  {
    id: 6,
    title: "CSS Grid and Flexbox",
    category: "Frontend",
    completedDate: "2023-09-15",
    score: 88,
    passed: true,
    passingScore: 70,
    duration: 50,
    attempts: 1,
  },
];



export default function ProfilePage() {
  const { token, user } = useSelector((state) => state.auth);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(user);
  const [editData, setEditData] = useState(user);
  const dispatch = useDispatch();
  const [groups, setGroups] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const handleSave = async () => {
    setIsLoading(true);
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
      setIsEditing(false);

      if (response.ok) {
        setUserData(editData);
        dispatch(updateUser(editData));
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
          variant: "success"
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Unknown error",
          variant: "error"
        });
      }
    } catch (error) {
      console.log("UserProfile page error: ", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData(userData);
    setIsEditing(false);
  };

  const fetchContractor = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors`
      );
      const data = await res.json();
      if (data.success) {
        setTeams(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  const fetchCompanies = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/companies`
      );
      const data = await res.json();
      if (data.success) {
        setGroups(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  useEffect(() => {
    fetchContractor();
    fetchCompanies();
  }, []);

  const filteredContractors = teams.filter((contractor) => {
    const matchesCompany = selectedGroup
      ? contractor.company_name === selectedGroup
      : true;

    return matchesCompany;
  });

  // Calculate statistics
  const totalAssessments = mockAssessmentHistory.length;
  const passedAssessments = mockAssessmentHistory.filter(
    (a) => a.passed
  ).length;
  const averageScore = Math.round(
    mockAssessmentHistory.reduce((sum, a) => sum + a.score, 0) /
      totalAssessments
  );
  const passRate = Math.round((passedAssessments / totalAssessments) * 100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("profile.title")}
        </h1>
        <p className="text-muted-foreground">{t("profile.description")}</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="personal">
            {t("profile.personalInfo")}
          </TabsTrigger>
          <TabsTrigger value="history">
            {t("profile.assessmentHistory")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          {/* Profile Picture Section */}
          <ProfilePicture />

          {/* Personal Details Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t("profile.personalDetails")}
                  </CardTitle>
                  <CardDescription>
                    {t("profile.contactDetails")}
                  </CardDescription>
                </div>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("profile.fullName")}</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editData.name}
                      className=" h-12"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{editData?.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">{t("profile.position")}</Label>
                  {isEditing ? (
                    <Input
                      id="position"
                      value={editData.position}
                      className=" h-12"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          position: e.target.value,
                        })
                      }
                      placeholder="Enter your position"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md ">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate overflow-hidden whitespace-nowrap max-w-[94%]">
                        {editData?.position}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="group">{t("profile.group")}</Label>
                  {isEditing ? (
                    <Select
                      value={editData.group}
                      onValueChange={(value) => {
                        setEditData({
                          ...editData,
                          group: value,
                        });
                        setSelectedGroup(value);
                      }}
                    >
                      <SelectTrigger id="group" className=" w-full min-h-12">
                        <SelectValue placeholder="Select your group" />
                      </SelectTrigger>
                      <SelectContent>
                        {groups?.map((grp) => (
                          <SelectItem key={grp.name} value={grp.name}>
                            {grp.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <UsersRound className="w-4 h-4 text-muted-foreground" />
                      <span>{editData?.group}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="controlling_team">
                    {t("profile.controlling_team")}
                  </Label>
                  {isEditing ? (
                    <SearchableSelect
                      options={filteredContractors.map((c) => c.name)}
                      value={editData.controlling_team}
                      onChange={(val) =>
                        setEditData((prev) => ({
                          ...prev,
                          controlling_team: val,
                        }))
                      }
                      placeholder="Select or type team"
                      customClass={"max-h-12 h-12"}
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <MonitorCog className="w-4 h-4 text-muted-foreground" />
                      <span>{editData?.controlling_team}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee_id">
                    {t("profile.employee_id")}
                  </Label>
                  {isEditing ? (
                    <Input
                      id="employee_id"
                      value={editData.employee_id}
                      className=" h-12"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          employee_id: e.target.value,
                        })
                      }
                      placeholder="Enter your employee ID"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <IdCard className="w-4 h-4 text-muted-foreground" />
                      <span>{editData?.employee_id}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_id">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="employee_id"
                      value={editData.phone}
                      className=" h-12"
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your employee ID"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{editData?.phone}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Work Location</Label>

                  {isEditing ? (
                    <Select
                      value={editData.location}
                      onValueChange={(value) =>
                        setEditData((prev) => ({
                          ...prev,
                          location: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full min-h-12">
                        <SelectValue placeholder="Select Work Location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Rig Based Employee (ROE)">
                          Rig Based Employee (ROE)
                        </SelectItem>
                        <SelectItem value="Office Based Employee">
                          Office Based Employee
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{editData.location}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("auth.emailAddress")}</Label>
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>{editData?.email}</span>
                  </div>
                  {isEditing && (
                    <p className="text-xs text-muted-foreground">
                      {t("profile.emailCannotChange")}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {t("profile.accountInfo")}
                  </span>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("profile.memberSince")}
                    </span>
                    <span>
                      {userData.created_at
                        ? new Date(userData.created_at).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("profile.lastLogin")}
                    </span>
                    <span>
                      {userData.last_login
                        ? new Date(userData.last_login).toLocaleString()
                        : "Never"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("profile.accountStatus")}
                    </span>
                    <Badge variant="default">
                      {userData.is_active === 1
                        ? t("profile.active")
                        : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("profile.totalAssessments")}
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAssessments}</div>
                <p className="text-xs text-muted-foreground">
                  {t("profile.completedAssessments")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("profile.passRate")}
                </CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{passRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {passedAssessments} {t("profile.passed")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("dashboard.averageScore")}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {t("profile.overallPerformance")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("profile.bestScore")}
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.max(...mockAssessmentHistory.map((a) => a.score))}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("profile.personalBest")}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Assessment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                {t("profile.assessmentHistory")}
              </CardTitle>
              <CardDescription>{t("profile.completeHistory")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAssessmentHistory.map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    {/* Left: Info */}
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted shrink-0">
                        {assessment.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-base sm:text-lg">
                          {assessment.title}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                          <span>{assessment.category}</span>
                          <span>•</span>
                          <span>
                            {new Date(
                              assessment.completedDate
                            ).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>{assessment.duration} min</span>
                          <span>•</span>
                          <span>
                            {assessment.attempts} attempt
                            {assessment.attempts > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Score + Status */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-center sm:text-right">
                      <div>
                        <div
                          className={`text-lg sm:text-xl font-bold ${
                            assessment.passed
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {assessment.score}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t("profile.required")} {assessment.passingScore}%
                        </div>
                      </div>
                      <Badge
                        variant={assessment.passed ? "default" : "destructive"}
                        className="self-center sm:self-auto"
                      >
                        {assessment.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
