"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAllFinances } from "@/common/api/finance/hook";
import { Status, Category } from "@/common/api/finance/entity";
import { useFirebase } from "@/common/context";

export default function ProfileAnalytics() {
  const { user } = useFirebase();
  const { data: allFinances = [], isLoading } = useAllFinances();

  const userFinances = useMemo(
    () => allFinances.filter((finance) => finance.submitterId === user?.uid),
    [allFinances, user?.uid],
  );

  const analytics = useMemo(() => {
    if (!userFinances.length) return null;

    const totalAmount = userFinances.reduce((sum, f) => sum + f.amount, 0);
    const approvedAmount = userFinances
      .filter((f) => f.status === Status.APPROVED)
      .reduce((sum, f) => sum + f.amount, 0);
    const pendingAmount = userFinances
      .filter((f) => f.status === Status.PENDING)
      .reduce((sum, f) => sum + f.amount, 0);
    const REJECTED_STATUSES = [
      Status.REJECTED_INVALID_RECEIPT,
      Status.REJECTED_WRONG_ADDRESS,
      Status.REJECTED_WRONG_DESCRIPTION,
      Status.REJECTED_INCORRECT_AMOUNT,
      Status.REJECTED_DUPLICATE_SUBMISSION,
    ];
    const rejectedAmount = userFinances
      .filter((f) => REJECTED_STATUSES.includes(f.status))
      .reduce((sum, f) => sum + f.amount, 0);

    const statusCounts = {
      [Status.PENDING]: userFinances.filter((f) => f.status === Status.PENDING)
        .length,
      [Status.APPROVED]: userFinances.filter(
        (f) => f.status === Status.APPROVED,
      ).length,
      rejected: userFinances.filter((f) => REJECTED_STATUSES.includes(f.status)).length,
      [Status.DEPOSIT]: userFinances.filter((f) => f.status === Status.DEPOSIT)
        .length,
    };

    const categoryBreakdown = Object.values(Category)
      .map((category) => {
        const categoryFinances = userFinances.filter(
          (f) => f.category === category,
        );
        return {
          category,
          count: categoryFinances.length,
          amount: categoryFinances.reduce((sum, f) => sum + f.amount, 0),
        };
      })
      .filter((item) => item.count > 0)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    const monthlyData = userFinances.reduce(
      (acc, finance) => {
        const date = new Date(finance.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthKey, amount: 0, count: 0 };
        }
        acc[monthKey].amount += finance.amount;
        acc[monthKey].count += 1;
        return acc;
      },
      {} as Record<string, { month: string; amount: number; count: number }>,
    );

    const monthlyArray = Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);

    const averageAmount = totalAmount / userFinances.length;
    const approvalRate =
      (statusCounts[Status.APPROVED] / userFinances.length) * 100;

    return {
      totalAmount,
      approvedAmount,
      pendingAmount,
      rejectedAmount,
      statusCounts,
      categoryBreakdown,
      monthlyData: monthlyArray,
      averageAmount,
      approvalRate,
      totalSubmissions: userFinances.length,
    };
  }, [userFinances]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Please log in to view your analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
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
          <p className="text-muted-foreground">
            No reimbursement data available
          </p>
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
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requested
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalSubmissions} submissions
            </p>
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
              {analytics.statusCounts[Status.APPROVED]} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              ${analytics.pendingAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.statusCounts[Status.PENDING]} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.approvalRate.toFixed(1)}%
            </div>
            <Progress value={analytics.approvalRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of your reimbursement statuses
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

        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Spending Trend</CardTitle>
            <CardDescription>
              Your reimbursement requests over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer
              config={{
                amount: { label: "Amount ($)", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={analytics.monthlyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
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
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Top Spending Categories</CardTitle>
          <CardDescription>
            Your most frequent reimbursement categories
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <ChartContainer
            config={{
              amount: { label: "Amount ($)", color: "hsl(var(--chart-2))" },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analytics.categoryBreakdown}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 10 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    `$${Number(value).toLocaleString()}`,
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

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Average Request
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.averageAmount.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Most Used Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold truncate">
              {analytics.categoryBreakdown[0]?.category || "N/A"}
            </div>
            <p className="text-sm text-muted-foreground">
              {analytics.categoryBreakdown[0]?.count || 0} requests
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
