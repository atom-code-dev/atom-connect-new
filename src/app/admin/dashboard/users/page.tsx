"use client"

import { useAuth } from "@/components/providers"
import { useRouter } from "next/navigation"
import { useEffect, useState, useCallback, useMemo } from "react"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, UserCheck, UserX, Plus } from "lucide-react"
import HexagonLoader from "@/components/ui/hexagon-loader"
import { toast } from "sonner"
import { UserRole } from "@prisma/client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserSchema } from "@/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  phone?: string
  createdAt: string
  updatedAt: string
  freelancerProfile?: {
    id: string
    name: string
    email: string
    phone?: string
    skills: string[]
    trainerType: string
    experience: string
    availability: string
    location?: string
    createdAt: string
  }
  organizationProfile?: {
    id: string
    organizationName: string
    contactMail: string
    phone?: string
    verifiedStatus: string
    companyLocation: string
    activeStatus: string
    ratings: number
    createdAt: string
  }
  adminProfile?: {
    id: string
    createdAt: string
  }
  maintainerProfile?: {
    id: string
    createdAt: string
  }
}

const roleColors = {
  FREELANCER: "bg-blue-100 text-blue-800",
  ORGANIZATION: "bg-green-100 text-green-800",
  ADMIN: "bg-purple-100 text-purple-800",
  MAINTAINER: "bg-orange-100 text-orange-800",
}

const statusColors = {
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-red-100 text-red-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  VERIFIED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

export default function AdminUsersPage() {
  const { isAuthenticated, user, status } = useAuth()
  const router = useRouter()
  
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSelectAll, setIsSelectAll] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form setup for adding user
  const form = useForm({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      phone: "",
      role: "FREELANCER" as UserRole,
    },
  })

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
      return
    }
    
    if (isAuthenticated && user?.user?.role !== "ADMIN") {
      router.push("/")
      return
    }

    if (isAuthenticated && user?.user?.role === "ADMIN") {
      fetchUsers()
    }
  }, [status, user, router, fetchUsers])

  const handleExportCSV = useCallback(() => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to export")
      return
    }

    const usersToExport = users.filter(user => selectedUsers.includes(user.id))
    
    // Create CSV content with proper escaping for commas and quotes
    const headers = ["Name", "Email", "Role", "Status", "Join Date", "Last Login", "Profile Completed"]
    const csvContent = [
      headers.join(","),
      ...usersToExport.map(user => [
        // Escape quotes and wrap in quotes if contains comma
        `"${(user.name || user.freelancerProfile?.name || user.organizationProfile?.organizationName || '').replace(/"/g, '""')}"`,
        `"${user.email.replace(/"/g, '""')}"`,
        user.role,
        `"${(user.organizationProfile?.activeStatus || user.freelancerProfile?.availability || 'ACTIVE').replace(/"/g, '""')}"`,
        `"${new Date(user.createdAt).toLocaleDateString()}"`,
        `"${new Date(user.updatedAt).toLocaleDateString()}"`,
        `"${(user.freelancerProfile || user.organizationProfile) ? "Yes" : "No"}"`
      ].join(","))
    ].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `users_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success(`Exported ${usersToExport.length} users to CSV`)
  }, [selectedUsers, users])

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.freelancerProfile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.organizationProfile?.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter
      const matchesStatus = statusFilter === "ALL" || 
                           user.organizationProfile?.activeStatus === statusFilter ||
                           user.freelancerProfile?.availability === statusFilter ||
                           (statusFilter === "ACTIVE" && (!user.organizationProfile?.activeStatus || user.organizationProfile?.activeStatus === "ACTIVE"))
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  if (false || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <HexagonLoader size={64} className="mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }


  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked)
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users to perform bulk action")
      return
    }

    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action
        })
      })

      if (!response.ok) {
        throw new Error('Failed to perform bulk action')
      }

      const actionMessages = {
        activate: `Activated ${selectedUsers.length} users`,
        deactivate: `Deactivated ${selectedUsers.length} users`,
        delete: `Deleted ${selectedUsers.length} users`,
      }

      toast.success(actionMessages[action as keyof typeof actionMessages] || "Bulk action completed")
      setSelectedUsers([])
      setIsSelectAll(false)
      fetchUsers()
    } catch (error) {
      console.error('Error performing bulk action:', error)
      toast.error('Failed to perform bulk action')
    }
  }

  const getUserStatus = (user: User) => {
    if (user.organizationProfile) {
      return user.organizationProfile.activeStatus
    }
    if (user.freelancerProfile) {
      return user.freelancerProfile.availability
    }
    return 'ACTIVE'
  }

  const getUserName = (user: User) => {
    return user.name || 
           user.freelancerProfile?.name || 
           user.organizationProfile?.organizationName || 
           'Unnamed User'
  }

  const getProfileCompleted = (user: User) => {
    return !!(user.freelancerProfile || user.organizationProfile || user.adminProfile || user.maintainerProfile)
  }

  const handleAddUser = form.handleSubmit(async (data) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create user')
      }

      toast.success('User created successfully')
      setIsDialogOpen(false)
      form.reset()
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create user')
    }
  })

  return (
    <DashboardLayout userRole={user.role} userName={user.name || "Admin"}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="text-muted-foreground">Manage all users in the system</p>
          </div>
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <div className="flex gap-2">
                <Select onValueChange={(value) => handleBulkAction(value)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activate">Activate</SelectItem>
                    <SelectItem value="deactivate">Deactivate</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {selectedUsers.length} selected
                </Badge>
              </div>
            )}
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account in the system.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="user@example.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="••••••••" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 6 characters long.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="John Doe" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="+1 234 567 8900" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="FREELANCER">Freelancer</SelectItem>
                              <SelectItem value="ORGANIZATION">Organization</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                              <SelectItem value="MAINTAINER">Maintainer</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        Create User
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{users.length}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">
                  {users.filter(u => {
                    const status = getUserStatus(u)
                    return status === 'ACTIVE' || status === 'AVAILABLE'
                  }).length}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Freelancers</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{users.filter(u => u.role === 'FREELANCER').length}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{users.filter(u => u.role === 'ORGANIZATION').length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="FREELANCER">Freelancer</SelectItem>
                  <SelectItem value="ORGANIZATION">Organization</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MAINTAINER">Maintainer</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>Manage and view all users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={isSelectAll}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all users"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                            aria-label={`Select ${getUserName(user)}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{getUserName(user)}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={roleColors[user.role]}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[getUserStatus(user)]}>
                            {getUserStatus(user)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(user.updatedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {getProfileCompleted(user) ? (
                            <Badge variant="outline" className="text-green-600">Complete</Badge>
                          ) : (
                            <Badge variant="outline" className="text-yellow-600">Incomplete</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              {getUserStatus(user) === "ACTIVE" || getUserStatus(user) === "AVAILABLE" ? (
                                <DropdownMenuItem>
                                  <UserX className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem>
                                  <UserCheck className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {!loading && filteredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users found matching your filters.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}