"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Upload,
  DollarSign,
  FileText,
  MapPin,
  Receipt,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useFirebase } from "@/common/context";
import {
  Status,
  SubmitterType,
  useCreateFinance,
  Category,
} from "@/common/api/finance";

// Zod schema
const reimbursementSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .min(0.01, "Amount must be greater than 0")
    .max(10000, "Amount cannot exceed $10,000"),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description cannot exceed 500 characters"),
  category: z.nativeEnum(Category, {
    required_error: "Category is required",
  }),
  street: z
    .string({
      required_error: "Street address is required",
    })
    .min(1, "Street address is required"),
  city: z
    .string({
      required_error: "City is required",
    })
    .min(1, "City is required"),
  state: z
    .string({
      required_error: "State is required",
    })
    .length(2, "Please use 2-letter state code"),
  postalCode: z
    .string({
      required_error: "ZIP code is required",
    })
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  receipt: z
    .any()
    .refine((file) => file instanceof File, "Receipt is required")
    .refine((file) => file?.size <= 5000000, "File size must be less than 5MB")
    .refine(
      (file) =>
        ["application/pdf", "image/jpeg", "image/png", "image/jpg"].includes(
          file?.type,
        ),
      "Only PDF, JPEG, and PNG files are allowed",
    ),
});

type ReimbursementFormData = z.infer<typeof reimbursementSchema>;

const categories = Object.values(Category);

const steps = [
  {
    id: 1,
    title: "Basic Information",
    description: "Enter expense details",
    icon: FileText,
  },
  {
    id: 2,
    title: "Address Details",
    description: "Where did this expense occur?",
    icon: MapPin,
  },
  {
    id: 3,
    title: "Receipt Upload",
    description: "Upload your receipt",
    icon: Receipt,
  },
];

export default function ReimbursementForm() {
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useFirebase();
  const createFinance = useCreateFinance();

  const form = useForm<ReimbursementFormData>({
    resolver: zodResolver(reimbursementSchema),
    defaultValues: {
      amount: 0,
      category: Category.Food,
      description: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      receipt: undefined,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    trigger,
    watch,
  } = form;

  const watchedValues = watch();
  const progress = ((activeStep + 1) / steps.length) * 100;

  const onSubmit = async (data: ReimbursementFormData) => {
    if (!user?.uid) {
      toast.error("You must be logged in to submit a reimbursement");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("receipt", data.receipt);

      Object.entries(data).forEach(([key, value]) => {
        if (key !== "receipt") {
          formData.append(key, String(value));
        }
      });

      formData.append("submitterType", SubmitterType.ORGANIZER);
      formData.append("submitterId", user.uid);
      formData.append("status", Status.PENDING);

      await createFinance.mutateAsync(formData);

      toast.success("Reimbursement request submitted successfully!");
      reset();
      setActiveStep(0);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit reimbursement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = getFieldsForStep(activeStep);
    const isStepValid = await trigger(fieldsToValidate);

    if (isStepValid) {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): (keyof ReimbursementFormData)[] => {
    switch (step) {
      case 0:
        return ["amount", "category", "description"];
      case 1:
        return ["street", "city", "state", "postalCode"];
      case 2:
        return ["receipt"];
      default:
        return [];
    }
  };

  const isStepComplete = (stepIndex: number) => {
    const fields = getFieldsForStep(stepIndex);
    return fields.every((field) => {
      const value = watchedValues[field];
      return value !== undefined && value !== "" && value !== 0;
    });
  };

  const StepIcon = steps[activeStep].icon;

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Submit Reimbursement Request
        </h1>
        <p className="text-muted-foreground">
          Follow the steps below to submit your expense reimbursement
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-muted-foreground">
                Step {activeStep + 1} of {steps.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isCompleted = index < activeStep || isStepComplete(index);

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center space-y-2"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : isCompleted
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-muted-foreground/30 bg-background"
                      }`}
                    >
                      {isCompleted && index < activeStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-sm font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <StepIcon className="h-5 w-5 text-primary" />
            <CardTitle>{steps[activeStep].title}</CardTitle>
          </div>
          <CardDescription>{steps[activeStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 0: Basic Information */}
            {activeStep === 0 && (
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Controller
                      name="amount"
                      control={control}
                      render={({ field }) => (
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            id="amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="pl-10"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        </div>
                      )}
                    />
                    {errors.amount && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="description"
                        placeholder="Describe your expense in detail..."
                        rows={4}
                        className="resize-none"
                      />
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {errors.description && (
                        <span className="text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {errors.description.message}
                        </span>
                      )}
                    </span>
                    <span>{watchedValues.description?.length || 0}/500</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Address Details */}
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address *</Label>
                  <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="street"
                        placeholder="123 Main Street"
                      />
                    )}
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.street.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Controller
                      name="city"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id="city" placeholder="New York" />
                      )}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Controller
                      name="state"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="state"
                          placeholder="NY"
                          maxLength={2}
                        />
                      )}
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode">ZIP Code *</Label>
                    <Controller
                      name="postalCode"
                      control={control}
                      render={({ field }) => (
                        <Input {...field} id="postalCode" placeholder="12345" />
                      )}
                    />
                    {errors.postalCode && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Receipt Upload */}
            {activeStep === 2 && (
              <div className="space-y-6">
                <Controller
                  name="receipt"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">
                            Upload Receipt
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Drag and drop your receipt here, or click to browse
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Supports PDF, JPEG, PNG files up to 5MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          className="mt-4 bg-transparent"
                          onClick={() =>
                            document.getElementById("receipt-upload")?.click()
                          }
                        >
                          Choose File
                        </Button>
                        <input
                          id="receipt-upload"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            field.onChange(file);
                          }}
                        />
                      </div>

                      {field.value && (
                        <Alert>
                          <CheckCircle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Selected file:</strong> {field.value.name} (
                            {(field.value.size / 1024 / 1024).toFixed(2)} MB)
                          </AlertDescription>
                        </Alert>
                      )}

                      {errors.receipt && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {errors.receipt.message as string}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}
                />
              </div>
            )}

            <Separator />

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={activeStep === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex gap-2">
                {activeStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {activeStep === steps.length - 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Request Summary
            </CardTitle>
            <CardDescription>
              Review your reimbursement request before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Amount</Label>
                <p className="font-medium text-lg">
                  ${watchedValues.amount?.toFixed(2)}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Category</Label>
                <Badge variant="outline">{watchedValues.category}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm">{watchedValues.description}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Address</Label>
              <p className="text-sm">
                {watchedValues.street}, {watchedValues.city},{" "}
                {watchedValues.state} {watchedValues.postalCode}
              </p>
            </div>
            {watchedValues.receipt && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Receipt</Label>
                <p className="text-sm">{watchedValues.receipt.name}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
