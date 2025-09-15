"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Status, Category, SubmitterType } from "@/common/api/finance/entity";
import {
  useAllFinances,
  useUpdateFinanceStatus,
} from "@/common/api/finance/hook";
import { FinanceEntity } from "@/common/api/finance/entity";
import { useAllUsers } from "@/common/api/user/hook";
import { useAllOrganizers } from "@/common/api/organizer/hook";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Filter,
  Search,
  Edit,
  ExternalLink,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Fuse from "fuse.js"

type SortOrder = "asc" | "desc";

interface SubmitterCellProps {
  id: string;
  type: SubmitterType;
}

function SubmitterCell({ id, type }: SubmitterCellProps) {
  const { data: allUsers = [] } = useAllUsers();
  const { data: allOrganizers = [] } = useAllOrganizers();

  const getName = () => {
    if (type === SubmitterType.USER) {
      const user = allUsers.find((u) => u.id === id);
      return user
        ? `${user.firstName} ${user.lastName}`
        : `User ${id.slice(-8)}`;
    } else {
      const organizer = allOrganizers.find((o) => o.id === id);
      return organizer
        ? `${organizer.firstName} ${organizer.lastName}`
        : `Organizer ${id.slice(-8)}`;
    }
  };

  return (
    <div className="flex flex-col">
      <span className="font-medium">{getName()}</span>
      <span className="text-xs text-muted-foreground">
        {type === SubmitterType.USER ? "User" : "Organizer"}
      </span>
    </div>
  );
}

interface StatusCellProps {
  status: Status;
  onChange?: (newStatus: Status) => void;
}

function StatusCell({ status, onChange }: StatusCellProps) {
  const getStatusColor = (status: Status) => {
    switch (status) {
      case Status.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case Status.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case Status.REJECTED_INVALID_RECEIPT:
      case Status.REJECTED_WRONG_ADDRESS:
      case Status.REJECTED_WRONG_DESCRIPTION:
      case Status.REJECTED_INCORRECT_AMOUNT:
      case Status.REJECTED_DUPLICATE_SUBMISSION:
        return "bg-red-100 text-red-800 border-red-200";
      case Status.DEPOSIT:
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Select
      value={status}
      onValueChange={(value) => onChange?.(value as Status)}
    >
      <SelectTrigger className="w-32">
        <SelectValue>
          <Badge variant="outline" className={getStatusColor(status)}>
            {status}
          </Badge>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={Status.APPROVED}>
          <Badge variant="outline" className={getStatusColor(Status.APPROVED)}>
            Approved
          </Badge>
        </SelectItem>
        <SelectItem value={Status.PENDING}>
          <Badge variant="outline" className={getStatusColor(Status.PENDING)}>
            Pending
          </Badge>
        </SelectItem>
        <SelectItem value={Status.REJECTED_INVALID_RECEIPT}>
          <Badge variant="outline" className={getStatusColor(Status.REJECTED_INVALID_RECEIPT)}>
            Invalid Receipt
          </Badge>
        </SelectItem>
        <SelectItem value={Status.REJECTED_WRONG_ADDRESS}>
          <Badge variant="outline" className={getStatusColor(Status.REJECTED_WRONG_ADDRESS)}>
            Wrong Address
          </Badge>
        </SelectItem>
        <SelectItem value={Status.REJECTED_WRONG_DESCRIPTION}>
          <Badge variant="outline" className={getStatusColor(Status.REJECTED_WRONG_DESCRIPTION)}>
            Wrong Description
          </Badge>
        </SelectItem>
        <SelectItem value={Status.REJECTED_INCORRECT_AMOUNT}>
          <Badge variant="outline" className={getStatusColor(Status.REJECTED_INCORRECT_AMOUNT)}>
            Incorrect Amount
          </Badge>
        </SelectItem>
        <SelectItem value={Status.REJECTED_DUPLICATE_SUBMISSION}>
          <Badge variant="outline" className={getStatusColor(Status.REJECTED_DUPLICATE_SUBMISSION)}>
            Duplicate Submission
          </Badge>
        </SelectItem>
        <SelectItem value={Status.DEPOSIT}>
          <Badge variant="outline" className={getStatusColor(Status.DEPOSIT)}>
            Deposit
          </Badge>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default function ReimbursementsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof FinanceEntity | null>(
    null,
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [selectedSubmitterTypes, setSelectedSubmitterTypes] = useState<
    SubmitterType[]
  >([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<Status[]>([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const { data: allUsers = [] } = useAllUsers();
  const { data: allOrganizers = [] } = useAllOrganizers();

  const { data: finances = [], error } = useAllFinances();
  const updateMutation = useUpdateFinanceStatus();

  // Fuse.js config
    const fuseOptions = {
    keys: [
      {
        name: 'submitterName',
        getFn: (finance: FinanceEntity) => {
          if (finance.submitterType === SubmitterType.USER) {
            const user = allUsers.find((u) => u.id === finance.submitterId);
            return user ? `${user.firstName} ${user.lastName}` : "";
          } else {
            const organizer = allOrganizers.find((o) => o.id === finance.submitterId);
            return organizer ? `${organizer.firstName} ${organizer.lastName}` : "";
          }
        }
      },
      'description'
    ],
    threshold: 0.4, // 0.0 = exact match, 1.0 = match anything
    includeScore: true,
    minMatchCharLength: 2
  };

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch reimbursements");
    }
  }, [error]);

  const handleStatusUpdate = (id: string, newStatus: Status) => {
    updateMutation.mutate(
      { id, data: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${newStatus}`);
        },
        onError: (error: Error) => {
          toast.error(error.message);
        },
      },
    );
  };

  const handleSort = (column: keyof FinanceEntity) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

    const filteredAndSortedData = useMemo(() => {
    let filtered = finances;

    // Apply fuzzy search if there's a search term
    if (searchTerm) {
      const fuse = new Fuse(finances, fuseOptions);
      const searchResults = fuse.search(searchTerm);
      filtered = searchResults.map(result => result.item);
    }

    // Apply other filters
    filtered = filtered.filter((finance) => {
      // Type filter
      const typeMatch =
        selectedSubmitterTypes.length === 0 ||
        selectedSubmitterTypes.includes(finance.submitterType);

      // Category filter
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(finance.category);

      // Status filter
      const statusMatch =
        selectedStatuses.length === 0 ||
        selectedStatuses.includes(finance.status);

      // Amount filters
      const minMatch =
        !minAmount || finance.amount >= Number.parseFloat(minAmount);
      const maxMatch =
        !maxAmount || finance.amount <= Number.parseFloat(maxAmount);

      return typeMatch && categoryMatch && statusMatch && minMatch && maxMatch;
    });

    // Sort
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();
        if (aStr < bStr) return sortOrder === "asc" ? -1 : 1;
        if (aStr > bStr) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [
    finances,
    searchTerm,
    selectedSubmitterTypes,
    selectedCategories,
    selectedStatuses,
    minAmount,
    maxAmount,
    sortColumn,
    sortOrder,
    allUsers,
    allOrganizers,
  ]);

  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedData.slice(start, start + rowsPerPage);
  }, [filteredAndSortedData, page, rowsPerPage]);

  const toggleSubmitterType = (type: SubmitterType) => {
    setSelectedSubmitterTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const toggleStatus = (status: Status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const resetFilters = () => {
    setSelectedSubmitterTypes([]);
    setSelectedCategories([]);
    setSelectedStatuses([]);
    setMinAmount("");
    setMaxAmount("");
    setSearchTerm("");
  };

  const SortableHeader = ({
    column,
    children,
  }: {
    column: keyof FinanceEntity;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-semibold text-left justify-start"
      onClick={() => handleSort(column)}
    >
      {children}
      {sortColumn === column &&
        (sortOrder === "asc" ? (
          <ChevronUp className="ml-1 h-4 w-4" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4" />
        ))}
    </Button>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reimbursements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-80"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {(selectedSubmitterTypes.length +
                    selectedCategories.length +
                    selectedStatuses.length >
                    0 ||
                    minAmount ||
                    maxAmount) && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedSubmitterTypes.length +
                        selectedCategories.length +
                        selectedStatuses.length +
                        (minAmount ? 1 : 0) +
                        (maxAmount ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto">
                <SheetHeader className="flex-shrink-0">
                  <SheetTitle>Filter Reimbursements</SheetTitle>
                  <SheetDescription>
                    Apply filters to narrow down the results
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6 mt-6 pb-6">
                  {/* Submitter Type Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Submitter Type
                    </Label>
                    <div className="space-y-2">
                      {Object.values(SubmitterType).map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedSubmitterTypes.includes(type)}
                            onCheckedChange={() => toggleSubmitterType(type)}
                          />
                          <Label htmlFor={`type-${type}`} className="text-sm">
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Status Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="space-y-2">
                      {Object.values(Status).map((status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Category Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Categories</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.values(Category).map((category) => (
                        <div
                          key={category}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`category-${category}`}
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => toggleCategory(category)}
                          />
                          <Label
                            htmlFor={`category-${category}`}
                            className="text-sm"
                          >
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Amount Range Filter */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Amount Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor="min-amount"
                          className="text-xs text-muted-foreground"
                        >
                          Min Amount
                        </Label>
                        <Input
                          id="min-amount"
                          type="number"
                          placeholder="0"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label
                          id="max-amount"
                          className="text-xs text-muted-foreground"
                        >
                          Max Amount
                        </Label>
                        <Input
                          id="max-amount"
                          type="number"
                          placeholder="1000"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="w-full bg-transparent"
                  >
                    Reset Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <SortableHeader column="submitterId">
                      Submitter
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="amount">Amount</SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="description">
                      Description
                    </SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="category">Category</SortableHeader>
                  </TableHead>
                  <TableHead>
                    <SortableHeader column="status">Status</SortableHeader>
                  </TableHead>
                  <TableHead>Receipt</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((finance) => (
                    <TableRow key={finance.id}>
                      <TableCell>
                        <SubmitterCell
                          id={finance.submitterId}
                          type={finance.submitterType}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        ${finance.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {finance.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{finance.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusCell
                          status={finance.status}
                          onChange={(status) =>
                            handleStatusUpdate(finance.id, status)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {finance.receiptUrl ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={finance.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/finance/${finance.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No reimbursements found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {page * rowsPerPage + 1} to{" "}
              {Math.min((page + 1) * rowsPerPage, filteredAndSortedData.length)}{" "}
              of {filteredAndSortedData.length} results
            </div>
            <div className="flex items-center space-x-2">
              <Select
                value={rowsPerPage.toString()}
                onValueChange={(value) => setRowsPerPage(Number(value))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={
                  (page + 1) * rowsPerPage >= filteredAndSortedData.length
                }
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
