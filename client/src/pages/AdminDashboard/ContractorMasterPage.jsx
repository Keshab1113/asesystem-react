import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
  MoreVertical,
  Power,
  PhoneCall,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import useToast from "../../hooks/ToastContext";
import { useSelector } from "react-redux";
import ContractorDeleteButton from "../../components/AdminDashboard/AlertDialog";
import axios from "axios";
import { SearchableSelect } from "../../components/SearchableSelect";

export function ContractorMasterPage() {
  const [contractors, setContractors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteContractorId, setDeleteContractorId] = useState(null);
  const [isEditing, setIsEditing] = useState(null);
  const [companies, setCompanies] = useState([]);
  const { toast } = useToast();
  const updateRef = useRef(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [newContractor, setNewContractor] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    address: "",
    specialization: "",
    license_number: "",
  });
  const [newCompany, setNewCompany] = useState({
    company_name: "",
    email: "",
    phone: "",
    active: "",
    address: "",
    profile_pic: null,
  });
  const [allUsers, setAllUsers] = useState([]);

  const filteredContractors = contractors.filter((contractor) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      (contractor.name || "").toLowerCase().includes(search) ||
      (contractor.email || "").toLowerCase().includes(search) ||
      (contractor.company_name || "").toLowerCase().includes(search);

    const matchesCompany = selectedGroup
      ? contractor.company_name === selectedGroup
      : true;

    return matchesSearch && matchesCompany;
  });

  const fetchAttempts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/role/user`
      );
      if (res.data.success) {
        setAllUsers(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };
  const fetchContractor = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors`
      );
      const data = await res.json();
      if (data.success) {
        setContractors(data.data);
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
        setCompanies(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  useEffect(() => {
    fetchAttempts();
    fetchContractor();
    fetchCompanies();
  }, []);

  const handleAddCompany = async () => {
    if (!newCompany.company_name.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/companies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCompany),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchCompanies();
        toast({
          title: "Group Added",
          description: "New Group added successfully",
        });
        setNewCompany({
          company_name: "",
          email: "",
          phone: "",
          active: "",
          address: "",
          profile_pic: null,
        });
      } else {
        toast({
          title: "Group added Failed",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding contractor:", error);
      toast({
        title: "Group added Failed",
        description: "Failed to add Group",
        variant: "destructive",
      });
    }
  };

  const handleAddContractor = async () => {
    try {
      const selectedGroup = companies.find(
        (c) => c.name === newContractor.company_name
      );

      if (!selectedGroup) {
        toast({
          title: "Failed to add team",
          description: "Please select a valid company",
          variant: "destructive",
        });
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newContractor,
            company_id: selectedGroup.id,
            created_by: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Team Added",
          description: "New Team added successfully",
        });
        setContractors([
          ...contractors,
          {
            id: data.contractorId,
            ...newContractor,
            is_active: true,
            created_at: new Date().toISOString().split("T")[0],
            quizCount: 0,
          },
        ]);
        setNewContractor({
          name: "",
          email: "",
          phone: "",
          company_name: "",
          address: "",
          specialization: "",
          license_number: "",
        });
      } else {
        toast({
          title: "Team added Failed",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding Team:", error);
      toast({
        title: "Team added Failed",
        description: "Failed to add Team",
        variant: "destructive",
      });
    }
  };
  const handleUpdateContractor = async () => {
    try {
      const selectedGroup = companies.find(
        (c) => c.name === newContractor.company_name
      );

      if (!selectedGroup) {
        toast({
          title: "Failed to update Team",
          description: "Please select a valid group",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors/${isEditing}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newContractor,
            company_id: selectedGroup.id,
            created_by: user.id,
            is_active: 1,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Team Updated",
          description: "Team updated successfully",
        });

        // ✅ Update contractor in state instead of adding new
        setContractors(
          contractors.map((c) =>
            c.id === isEditing
              ? { ...c, ...newContractor, company_id: selectedGroup.id }
              : c
          )
        );

        setNewContractor({
          name: "",
          email: "",
          phone: "",
          company_name: "",
          address: "",
          specialization: "",
          license_number: "",
        });
        setIsEditing(null); // ✅ Reset edit mode
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating Team:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update Team",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContractor = async (id) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setContractors((prev) => prev.filter((c) => c.id !== id));
        setDeleteContractorId(null);
      } else {
        alert(data.message || "Failed to delete Team");
      }
    } catch (error) {
      console.error("Error deleting Team:", error);
      alert("Server error while deleting Team");
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            is_active: currentStatus ? 0 : 1,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setContractors(
          contractors.map((contractor) =>
            contractor.id === id
              ? { ...contractor, is_active: !currentStatus }
              : contractor
          )
        );

        toast({
          title: "Status Updated",
          description: `Team has been ${
            currentStatus ? "deactivated" : "activated"
          } successfully.`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Unable to update status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: "An error occurred while updating contractor status",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (id) => {
    updateRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setIsEditing(id);

    const findContractor = contractors.find(
      (contractor) => contractor.id === id
    );

    if (findContractor) {
      setNewContractor({
        name: findContractor.name || "",
        email: findContractor.email || "",
        phone: findContractor.phone || "",
        company_name: findContractor.company_name || "",
        address: findContractor.address || "",
        specialization: findContractor.specialization || "",
        license_number: findContractor.license_number || "",
      });
    }
  };

  const isFormValid = newCompany.company_name.trim() !== "";
  const isFormValid2 =
    newContractor.name.trim() !== "" && newContractor.company_name !== "";

  const filteredUsers = selectedTeam
    ? allUsers.filter(
        (user) =>
          user.controlling_team === selectedTeam && user.group === selectedGroup
      )
    : allUsers;

  const AllGroupOption = [...new Set(contractors.map((c) => c.company_name))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-bold text-foreground">Group Master</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Group
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Group Name *</Label>
                <Input
                  id="company_name"
                  placeholder="Enter Group name..."
                  value={newCompany.company_name}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      company_name: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="active">Active</Label>
                <Select
                  value={newCompany.active}
                  onValueChange={(value) =>
                    setNewCompany({
                      ...newCompany,
                      active: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={true}>Active</SelectItem>
                    <SelectItem value={false}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-phone">Phone</Label>
                <Input
                  id="contractor-phone"
                  placeholder="Enter phone number..."
                  value={newCompany.phone}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor-email">Email</Label>
                <Input
                  id="contractor-email"
                  type="email"
                  placeholder="Enter email..."
                  value={newCompany.email}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-pic">Group Logo (URL)</Label>
              <Input
                id="profile-pic"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    profile_pic_url: e.target.files[0],
                  })
                }
              />
              {newCompany.profile_pic && (
                <img
                  src={URL.createObjectURL(newCompany.profile_pic)}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover mt-2"
                />
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="contractor-address">Address</Label>
              <Textarea
                id="contractor-address"
                placeholder="Enter address..."
                value={newCompany.address}
                onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    address: e.target.value,
                  })
                }
                rows={2}
              />
            </div> */}

            <Button
              onClick={handleAddCompany}
              disabled={!isFormValid}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Group
            </Button>
          </CardContent>
        </Card>
        <Card ref={updateRef}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Add New Team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Group *</Label>
                <Select
                  value={newContractor.company_name}
                  onValueChange={(value) => {
                    setNewContractor({
                      ...newContractor,
                      company_name: value,
                    });
                    setSelectedGroup(value);
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Group" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies?.map((company) => (
                      <SelectItem value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <SearchableSelect
                  options={filteredContractors.map((c) => c.name)}
                  value={newContractor.name}
                  onChange={(val) =>
                    setNewContractor({ ...newContractor, name: val })
                  }
                  placeholder="Select or type team"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-phone">Phone</Label>
                <Input
                  id="contractor-phone"
                  placeholder="Enter phone number..."
                  value={newContractor.phone}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email..."
                  value={newContractor.email}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  placeholder="Enter license number..."
                  value={newContractor.license_number}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      license_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="Enter Your Specialization"
                  value={newContractor.specialization}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="contractor-address">Address</Label>
              <Textarea
                id="contractor-address"
                placeholder="Enter address..."
                value={newContractor.address}
                onChange={(e) =>
                  setNewContractor({
                    ...newContractor,
                    address: e.target.value,
                  })
                }
                rows={2}
              />
            </div> */}

            <Button
              onClick={isEditing ? handleUpdateContractor : handleAddContractor}
              disabled={!isFormValid2}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isEditing ? "Update Team" : "Add Team"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=" flex md:flex-row flex-col justify-between items-center">
            <CardTitle>All Teams ({filteredContractors.length})</CardTitle>
            <div className="flex gap-2 items-center md:mt-0 mt-4">
              <div className="relative max-w-40 min-w-40">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search Team..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={selectedGroup}
                onValueChange={(e) => setSelectedGroup(e)}
                className="border rounded-md p-2 text-sm"
              >
                <SelectTrigger className="max-w-40 min-w-40">
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {AllGroupOption.map((company) => (
                    <SelectItem value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[30rem] overflow-hidden overflow-y-auto">
              {filteredContractors.map((contractor) => (
                <div
                  key={contractor.id}
                  className={`p-4 border rounded-lg hover:cursor-pointer hover:border-blue-600 ${
                    contractor.name === selectedTeam &&
                    "border-2 border-slate-700"
                  }`}
                  onClick={() => {
                    setSelectedGroup(contractor.company_name);
                    setSelectedTeam(contractor.name);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2 md:flex-row flex-col">
                        <h3 className="font-semibold">{contractor.name}</h3>
                        <div className=" flex gap-2 mb-2">
                          <Badge
                            variant={
                              contractor.is_active ? "default" : "secondary"
                            }
                          >
                            {contractor.is_active ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline">
                            {contractor.quizCount || 10} quizzes
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center">
                          <Building className="h-3 w-3 mr-1" />
                          {contractor.company_name}
                        </div>
                        {contractor.email && (
                          <div className="flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {contractor.email}
                          </div>
                        )}
                        {contractor.phone && (
                          <div className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {contractor.phone}
                          </div>
                        )}
                        <div className="text-xs">
                          Joined:{" "}
                          {contractor.created_at
                            ? new Date(contractor.created_at)
                                .toISOString()
                                .split("T")[0]
                            : "Never"}
                        </div>
                      </div>
                      {contractor.address && (
                        <p className="text-xs text-muted-foreground">
                          {contractor.address}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {/* Desktop buttons */}
                      <div className="hidden sm:flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditClick(contractor.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={
                            contractor.is_active ? "destructive" : "default"
                          }
                          onClick={() =>
                            handleToggleStatus(
                              contractor.id,
                              contractor.is_active
                            )
                          }
                        >
                          {contractor.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteContractorId(contractor.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Mobile 3-dot menu */}
                      <div className="sm:hidden">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(contractor.id)}
                            >
                              <Edit className="h-3 w-3 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleToggleStatus(
                                  contractor.id,
                                  contractor.is_active
                                )
                              }
                            >
                              <Power className="h-3 w-3 mr-2" />
                              {contractor.is_active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                setDeleteContractorId(contractor.id)
                              }
                            >
                              <Trash2 className="h-3 w-3 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  {deleteContractorId === contractor.id && (
                    <ContractorDeleteButton
                      id={contractor.id}
                      onDelete={handleDeleteContractor}
                      handleCancel={() => setDeleteContractorId(null)}
                    />
                  )}
                </div>
              ))}
              {filteredContractors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No contractors found matching your criteria.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=" flex md:flex-row flex-col justify-between items-center">
            <CardTitle>All Members ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-h-[30rem] overflow-y-auto">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors flex justify-between md:flex-row flex-col`}
                >
                  <div className=" flex flex-col">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                  <div className="  flex flex-row md:justify-center justify-between items-center gap-10 ">
                    <p className=" text-xs">Profile Completed: 100%</p>
                    <div className="  flex flex-row justify-center items-center gap-2">
                      <Button>
                        <Edit className="h-5 w-5" />
                      </Button>
                      <Button className=" bg-green-800 hover:bg-green-700">
                        <PhoneCall className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
