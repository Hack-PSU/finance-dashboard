"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useFinance, usePatchFinance } from "@/common/api/finance/hook";
import { FinanceEntity, Category, Status } from "@/common/api/finance/entity";
import { useAllUsers } from "@/common/api/user/hook";
import { useAllOrganizers } from "@/common/api/organizer/hook";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  ExternalLink,
  Save,
  User,
  Calendar,
  MapPin,
  DollarSign,
  FileText,
} from "lucide-react";

type EditableFields = Pick<
  FinanceEntity,
  | "amount"
  | "description"
  | "category"
  | "street"
  | "city"
  | "state"
  | "postalCode"
>;

export default function FinancePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // unwrap the promise:
  const { id } = React.use(params);

  const router = useRouter();
  const { data: finance, isLoading, error } = useFinance(id);
  const { data: allUsers = [] } = useAllUsers();
  const { data: allOrganizers = [] } = useAllOrganizers();
  const patchMutation = usePatchFinance();

  const [form, setForm] = useState<EditableFields>({
    amount: 0,
    description: "",
    category: Category.TelephoneRental,
    street: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form
  useEffect(() => {
    if (finance) {
      const { amount, description, category, street, city, state, postalCode } =
        finance;
      setForm({
        amount,
        description,
        category,
        street,
        city,
        state,
        postalCode,
      });
    }
  }, [finance]);

  const getSubmitterName = () => {
    if (!finance) return "";

    if (finance.submitterType === "USER") {
      const user = allUsers.find((u) => u.id === finance.submitterId);
      return user
        ? `${user.firstName} ${user.lastName}`
        : `User ${finance.submitterId.slice(-8)}`;
    } else {
      const organizer = allOrganizers.find((o) => o.id === finance.submitterId);
      return organizer
        ? `${organizer.firstName} ${organizer.lastName}`
        : `Organizer ${finance.submitterId.slice(-8)}`;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case Status.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case Status.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case Status.DEPOSIT:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !finance) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-4">Error loading reimbursement</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleFieldChange = <K extends keyof EditableFields>(
    field: K,
    value: EditableFields[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const changedFields: Partial<EditableFields> = {};

    // Only include fields that have actually changed
    Object.keys(form).forEach((key) => {
      const field = key as keyof EditableFields;
      if (form[field] !== finance[field]) {
        // @ts-ignore
        changedFields[field] = form[field];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      toast.info("No changes to save");
      return;
    }

    patchMutation.mutate(
      { id: finance.id, data: changedFields },
      {
        onSuccess: () => {
          toast.success("Reimbursement updated successfully");
          setHasChanges(false);
        },
        onError: (error: Error) => {
          toast.error(error.message || "Failed to update reimbursement");
        },
      },
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Reimbursement Details
            </h1>
            <p className="text-muted-foreground">ID: {finance.id}</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || patchMutation.isPending}
        >
          <Save className="h-4 w-4 mr-2" />
          {patchMutation.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        handleFieldChange(
                          "amount",
                          Number.parseFloat(e.target.value) || 0,
                        )
                      }
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) =>
                      handleFieldChange("category", value as Category)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(Category).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    handleFieldChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={form.street}
                  onChange={(e) => handleFieldChange("street", e.target.value)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => handleFieldChange("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => handleFieldChange("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={form.postalCode}
                    onChange={(e) =>
                      handleFieldChange("postalCode", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Submitter */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Request Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(finance.status)} w-fit`}
                >
                  {finance.status}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Submitted By</Label>
                <div className="text-sm">
                  <p className="font-medium">{getSubmitterName()}</p>
                  <p className="text-muted-foreground">
                    {finance.submitterType}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Hackathon ID</Label>
                <p className="text-sm font-mono">{finance.hackathonId}</p>
              </div>
            </CardContent>
          </Card>

          {/* Receipt & Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Additional Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {finance.receiptUrl && (
                <>
                  <div className="space-y-2">
                    <Label>Receipt</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="w-full bg-transparent"
                    >
                      <a
                        href={finance.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Receipt
                      </a>
                    </Button>
                  </div>
                  <Separator />
                </>
              )}
              <div className="space-y-2">
                <Label>Created At</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(finance.createdAt).toLocaleString()}
                </p>
              </div>
              {finance.updatedBy && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Last Updated By</Label>
                    <p className="text-sm text-muted-foreground">
                      {finance.updatedBy}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
