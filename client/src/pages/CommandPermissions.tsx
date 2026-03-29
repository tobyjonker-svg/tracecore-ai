import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Lock, Users, Shield } from "lucide-react";

interface CommandPermission {
  id: string;
  command: string;
  admin: boolean;
  manager: boolean;
  staff: boolean;
  description: string;
}

export function CommandPermissions() {
  const [permissions, setPermissions] = useState<CommandPermission[]>([
    {
      id: "1",
      command: "Add Product",
      admin: true,
      manager: true,
      staff: false,
      description: "Create new products in inventory",
    },
    {
      id: "2",
      command: "Create Order",
      admin: true,
      manager: true,
      staff: true,
      description: "Create new customer orders",
    },
    {
      id: "3",
      command: "Check Inventory",
      admin: true,
      manager: true,
      staff: true,
      description: "View current inventory levels",
    },
    {
      id: "4",
      command: "Update Status",
      admin: true,
      manager: true,
      staff: false,
      description: "Update order or production status",
    },
    {
      id: "5",
      command: "Sales Report",
      admin: true,
      manager: true,
      staff: false,
      description: "Generate sales analytics reports",
    },
    {
      id: "6",
      command: "Delete Product",
      admin: true,
      manager: false,
      staff: false,
      description: "Remove products from inventory",
    },
  ]);

  const handleTogglePermission = (
    id: string,
    role: "admin" | "manager" | "staff"
  ) => {
    setPermissions((prev) =>
      prev.map((perm) =>
        perm.id === id
          ? { ...perm, [role]: !perm[role] }
          : perm
      )
    );
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-500";
      case "manager":
        return "text-blue-500";
      case "staff":
        return "text-green-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Command Permissions
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage role-based access control for voice commands
        </p>
      </div>

      {/* Role Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Role Definitions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Admin</p>
                <p className="text-xs text-muted-foreground">
                  Full access to all commands and settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Manager</p>
                <p className="text-xs text-muted-foreground">
                  Access to operational and reporting commands
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Staff</p>
                <p className="text-xs text-muted-foreground">
                  Limited access to basic operational commands
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Command Permissions Matrix</CardTitle>
          <CardDescription>
            Configure which roles can execute each command
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-medium">Command</th>
                  <th className="text-center py-3 px-3 font-medium">Admin</th>
                  <th className="text-center py-3 px-3 font-medium">Manager</th>
                  <th className="text-center py-3 px-3 font-medium">Staff</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-medium">{perm.command}</p>
                        <p className="text-xs text-muted-foreground">
                          {perm.description}
                        </p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-3">
                      <Checkbox
                        checked={perm.admin}
                        onCheckedChange={() =>
                          handleTogglePermission(perm.id, "admin")
                        }
                      />
                    </td>
                    <td className="text-center py-3 px-3">
                      <Checkbox
                        checked={perm.manager}
                        onCheckedChange={() =>
                          handleTogglePermission(perm.id, "manager")
                        }
                      />
                    </td>
                    <td className="text-center py-3 px-3">
                      <Checkbox
                        checked={perm.staff}
                        onCheckedChange={() =>
                          handleTogglePermission(perm.id, "staff")
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Admin Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter((p) => p.admin).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {permissions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Manager Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter((p) => p.manager).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {permissions.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Staff Commands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {permissions.filter((p) => p.staff).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {permissions.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Button className="w-full">Save Permissions</Button>
    </div>
  );
}
