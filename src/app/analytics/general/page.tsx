"use client";

import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Users,
  Target,
} from "lucide-react";
import { useAllFinances } from "@/common/api/finance/hook";
import { Status, Category } from "@/common/api/finance/entity";
import { useAllOrganizers } from "@/common/api/organizer/hook";
import { useAllUsers } from "@/common/api/user/hook";
import { SubmitterType } from "@/common/api/finance/entity";

export default function OrganizationSpendingAnalytics() {
  const { data: allFinances = [], isLoading } = useAllFinances();
  const { data: allOrganizers = [] } = useAllOrganizers();
  const { data: allUsers = [] } = useAllUsers();
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const getSubmitterName = (
    submitterId: string,
    submitterType: SubmitterType,
  ) => {
    if (submitterType === SubmitterType.ORGANIZER) {
      const organizer = allOrganizers.find((org) => org.id === submitterId);
      return organizer
        ? `${organizer.firstName} ${organizer.lastName}`
        : `Organizer ${submitterId.slice(-8)}`;
    } else {
      const user = allUsers.find((user) => user.id === submitterId);
      return user
        ? `${user.firstName} ${user.lastName}`
        : `User ${submitterId.slice(-8)}`;
    }
  };

  const analytics = useMemo(() => {
    if (!allFinances.length) return null;

    // Filter by date range if provided
    let filteredFinances = allFinances;
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start).getTime();
      const endDate = new Date(dateRange.end).getTime();
      filteredFinances = allFinances.filter(
        (finance) =>
          finance.createdAt >= startDate && finance.createdAt <= endDate,
      );
    }

    const totalAmount = filteredFinances.reduce((sum, f) => sum + f.amount, 0);
    const approvedAmount = filteredFinances
      .filter((f) => f.status === Status.APPROVED)
      .reduce((sum, f) => sum + f.amount, 0);
    const pendingAmount = filteredFinances
      .filter((f) => f.status === Status.PENDING)
      .reduce((sum, f) => sum + f.amount, 0);
    const REJECTED_STATUSES = [
      Status.REJECTED_INVALID_RECEIPT,
      Status.REJECTED_WRONG_ADDRESS,
      Status.REJECTED_WRONG_DESCRIPTION,
      Status.REJECTED_INCORRECT_AMOUNT,
      Status.REJECTED_DUPLICATE_SUBMISSION,
    ];
    const rejectedAmount = filteredFinances
      .filter((f) => REJECTED_STATUSES.includes(f.status))
      .reduce((sum, f) => sum + f.amount, 0);

    const statusCounts = {
      [Status.PENDING]: filteredFinances.filter(
        (f) => f.status === Status.PENDING,
      ).length,
      [Status.APPROVED]: filteredFinances.filter(
        (f) => f.status === Status.APPROVED,
      ).length,
      rejected: filteredFinances.filter((f) => REJECTED_STATUSES.includes(f.status)).length,
      [Status.DEPOSIT]: filteredFinances.filter(
        (f) => f.status === Status.DEPOSIT,
      ).length,
    };

    // Category breakdown with more details
    const categoryBreakdown = Object.values(Category)
      .map((category) => {
        const categoryFinances = filteredFinances.filter(
          (f) => f.category === category,
        );
        const approvedInCategory = categoryFinances.filter(
          (f) => f.status === Status.APPROVED,
        );
        return {
          category,
          count: categoryFinances.length,
          amount: categoryFinances.reduce((sum, f) => sum + f.amount, 0),
          approvedAmount: approvedInCategory.reduce(
            (sum, f) => sum + f.amount,
            0,
          ),
          approvedCount: approvedInCategory.length,
          avgAmount:
            categoryFinances.length > 0
              ? categoryFinances.reduce((sum, f) => sum + f.amount, 0) /
                categoryFinances.length
              : 0,
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.amount - a.amount);

    // Monthly trend data
    const monthlyData = filteredFinances.reduce(
      (acc, finance) => {
        const date = new Date(finance.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            total: 0,
            approved: 0,
            pending: 0,
            rejected: 0,
            count: 0,
          };
        }
        acc[monthKey].total += finance.amount;
        acc[monthKey].count += 1;

        if (finance.status === Status.APPROVED)
          acc[monthKey].approved += finance.amount;
        if (finance.status === Status.PENDING)
          acc[monthKey].pending += finance.amount;
        if (REJECTED_STATUSES.includes(finance.status))
          acc[monthKey].rejected += finance.amount;

        return acc;
      },
      {} as Record<
        string,
        {
          month: string;
          total: number;
          approved: number;
          pending: number;
          rejected: number;
          count: number;
        }
      >,
    );

    const monthlyArray = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12);

    // Submitter analysis
    const submitterAnalysis = filteredFinances.reduce(
      (acc, finance) => {
        if (!acc[finance.submitterId]) {
          acc[finance.submitterId] = {
            id: finance.submitterId,
            type: finance.submitterType,
            totalAmount: 0,
            approvedAmount: 0,
            count: 0,
            approvedCount: 0,
          };
        }
        acc[finance.submitterId].totalAmount += finance.amount;
        acc[finance.submitterId].count += 1;

        if (finance.status === Status.APPROVED) {
          acc[finance.submitterId].approvedAmount += finance.amount;
          acc[finance.submitterId].approvedCount += 1;
        }

        return acc;
      },
      {} as Record<string, any>,
    );

    const topSubmitters = Object.values(submitterAnalysis)
      .sort((a: any, b: any) => b.totalAmount - a.totalAmount)
      .slice(0, 10);

    const averageAmount = totalAmount / filteredFinances.length;
    const approvalRate =
      (statusCounts[Status.APPROVED] / filteredFinances.length) * 100;
    const uniqueSubmitters = new Set(filteredFinances.map((f) => f.submitterId))
      .size;

    // Calculate trends (comparing with previous period)
    const currentPeriodStart = dateRange.start
      ? new Date(dateRange.start).getTime()
      : Date.now() - 30 * 24 * 60 * 60 * 1000;
    const currentPeriodEnd = dateRange.end
      ? new Date(dateRange.end).getTime()
      : Date.now();
    const periodLength = currentPeriodEnd - currentPeriodStart;
    const previousPeriodStart = currentPeriodStart - periodLength;
    const previousPeriodEnd = currentPeriodStart;

    const previousPeriodFinances = allFinances.filter(
      (f) =>
        f.createdAt >= previousPeriodStart && f.createdAt < previousPeriodEnd,
    );
    const previousPeriodTotal = previousPeriodFinances.reduce(
      (sum, f) => sum + f.amount,
      0,
    );
    const spendingTrend =
      previousPeriodTotal > 0
        ? ((totalAmount - previousPeriodTotal) / previousPeriodTotal) * 100
        : 0;

    return {
      totalAmount,
      approvedAmount,
      pendingAmount,
      rejectedAmount,
      statusCounts,
      categoryBreakdown,
      monthlyData: monthlyArray,
      topSubmitters,
      averageAmount,
      approvalRate,
      uniqueSubmitters,
      totalSubmissions: filteredFinances.length,
      spendingTrend,
    };
  }, [allFinances, dateRange, allOrganizers, allUsers]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No financial data available</p>
        </CardContent>
      </Card>
    );
  }

  const statusData = [
    {
      name: "Approved",
      value: analytics.statusCounts[Status.APPROVED],
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: analytics.statusCounts[Status.PENDING],
      color: "#f59e0b",
    },
    {
      name: "Rejected",
      value: analytics.statusCounts.rejected,
      color: "#ef4444",
    },
    {
      name: "Deposit",
      value: analytics.statusCounts[Status.DEPOSIT],
      color: "#3b82f6",
    },
  ].filter((item) => item.value > 0);

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Organization Spending Analytics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive overview of organizational financial data
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setDateRange({ start: "", end: "" })}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spending
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalAmount.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {analytics.spendingTrend > 0 ? (
                <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
              )}
              <span
                className={
                  analytics.spendingTrend > 0
                    ? "text-green-600"
                    : "text-red-600"
                }
              >
                {Math.abs(analytics.spendingTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Approved Amount
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${analytics.approvedAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.statusCounts[Status.APPROVED]} approved submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Submitters
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.uniqueSubmitters}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: $
              {(analytics.totalAmount / analytics.uniqueSubmitters).toFixed(0)}{" "}
              per person
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.approvalRate.toFixed(1)}%
            </div>
            <Progress value={analytics.approvalRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="submitters">Submitters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>
                  Breakdown of submission statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer
                  config={{
                    approved: { label: "Approved", color: "#22c55e" },
                    pending: { label: "Pending", color: "#f59e0b" },
                    rejected: { label: "Rejected", color: "#ef4444" },
                    deposit: { label: "Deposit", color: "#3b82f6" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="flex flex-wrap gap-2 mt-4">
                  {statusData.map((item) => (
                    <Badge
                      key={item.name}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}: {item.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Overview</CardTitle>
                <CardDescription>Total spending by month</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ChartContainer
                  config={{
                    total: { label: "Total ($)", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value) => [
                          `$${Number(value).toLocaleString()}`,
                          "Total",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="var(--color-total)"
                        fill="var(--color-total)"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>
                Detailed breakdown of spending across all categories
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer
                config={{
                  amount: { label: "Amount ($)", color: "hsl(var(--chart-2))" },
                }}
                className="h-[500px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.categoryBreakdown.slice(0, 15)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={120}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value, name) => [
                        `$${Number(value).toLocaleString()}`,
                        name,
                      ]}
                    />
                    <Bar
                      dataKey="amount"
                      fill="var(--color-amount)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Category Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each spending category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryBreakdown.slice(0, 10).map((category) => (
                  <div
                    key={category.category}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.count} submissions • Avg: $
                        {category.avgAmount.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="font-bold">
                        ${category.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        ${category.approvedAmount.toLocaleString()} approved
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
              <CardDescription>
                Spending trends by status over time
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ChartContainer
                config={{
                  approved: { label: "Approved", color: "#22c55e" },
                  pending: { label: "Pending", color: "#f59e0b" },
                  rejected: { label: "Rejected", color: "#ef4444" },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <ChartTooltip
                      content={<ChartTooltipContent />}
                      formatter={(value) => [
                        `$${Number(value).toLocaleString()}`,
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      stroke="var(--color-approved)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="pending"
                      stroke="var(--color-pending)"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      stroke="var(--color-rejected)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Submitters</CardTitle>
              <CardDescription>
                Users with highest spending requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.topSubmitters.map((submitter: any, index) => (
                  <div
                    key={submitter.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          #{index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {getSubmitterName(submitter.id, submitter.type)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {submitter.type === SubmitterType.ORGANIZER
                            ? "Organizer"
                            : "User"}{" "}
                          • {submitter.count} submissions •{" "}
                          {(
                            (submitter.approvedCount / submitter.count) *
                            100
                          ).toFixed(1)}
                          % approved
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${submitter.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-green-600">
                        ${submitter.approvedAmount.toLocaleString()} approved
                      </p>
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
