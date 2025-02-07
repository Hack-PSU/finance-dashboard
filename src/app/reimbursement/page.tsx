"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { z } from "zod";
import { useFirebase } from "@/common/context";
import {
  Status,
  SubmitterType,
  useCreateFinance,
  Category,
} from "@/common/api/finance";

// Custom styled component for visually hiding the file input
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

// ----- 1) Define the zod schema using z.nativeEnum for category -----
const reimbursementSchema = z.object({
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .min(0.01, "Amount must be greater than 0"),
  description: z
    .string({
      required_error: "Description is required",
    })
    .min(5, "Description must be at least 5 characters"),
  // category must be one of the Category enum values
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
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code"),
  receipt: z
    .any()
    .refine((file) => file instanceof File, "Receipt is required"),
});

type ReimbursementFormData = z.infer<typeof reimbursementSchema>;

// ----- 2) Generate dropdown options from the Category enum -----
const categories = Object.values(Category);

// A simple step array for the Stepper
const steps = ["Basic Information", "Address Details", "Receipt Upload"];

export default function ReimbursementPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { user } = useFirebase();

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
  } = useForm<ReimbursementFormData>({
    resolver: async (data) => {
      try {
        const validatedData = await reimbursementSchema.parseAsync(data);
        return { values: validatedData, errors: {} };
      } catch (error) {
        if (error instanceof z.ZodError) {
          const formattedErrors: Record<string, { message: string }> = {};
          error.errors.forEach((err) => {
            if (err.path && err.path.length > 0) {
              formattedErrors[err.path[0]] = { message: err.message };
            }
          });
          return { values: {}, errors: formattedErrors };
        }
        return { values: {}, errors: { _: { message: "Validation failed" } } };
      }
    },
    // ----- 3) Provide a valid default value for category -----
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

  // Use the updated create finance hook (which accepts FormData)
  const createFinance = useCreateFinance();

  const onSubmit = async (data: ReimbursementFormData) => {
    if (!user?.uid) {
      setSubmitError("User must be logged in to submit reimbursement");
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Always build a FormData instance since receipt is required
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

      setSubmitSuccess(true);
      reset();
      setActiveStep(0);
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to submit reimbursement. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h4" gutterBottom align="center">
            Submit Reimbursement Request
          </Typography>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Reimbursement request submitted successfully!
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 0: Basic Information */}
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="amount"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Amount"
                        type="number"
                        fullWidth
                        error={!!errors.amount}
                        helperText={errors.amount?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                        }}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="category"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        select
                        label="Category"
                        fullWidth
                        error={!!errors.category}
                        helperText={errors.category?.message}
                      >
                        {categories.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        multiline
                        rows={4}
                        fullWidth
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 1: Address Details */}
            {activeStep === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="street"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Street Address"
                        fullWidth
                        error={!!errors.street}
                        helperText={errors.street?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="City"
                        fullWidth
                        error={!!errors.city}
                        helperText={errors.city?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="State"
                        fullWidth
                        error={!!errors.state}
                        helperText={errors.state?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Controller
                    name="postalCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="ZIP Code"
                        fullWidth
                        error={!!errors.postalCode}
                        helperText={errors.postalCode?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* Step 2: Receipt Upload */}
            {activeStep === 2 && (
              <Controller
                name="receipt"
                control={control}
                render={({ field }) => (
                  <Box sx={{ textAlign: "center", py: 3 }}>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUpload />}
                      sx={{ mb: 2 }}
                    >
                      Upload Receipt
                      <VisuallyHiddenInput
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          field.onChange(file);
                        }}
                      />
                    </Button>
                    {field.value && (
                      <Typography variant="body2" color="text.secondary">
                        Selected file: {field.value.name}
                      </Typography>
                    )}
                    {errors.receipt && (
                      <Typography variant="body2" color="error">
                        {errors.receipt.message as string}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            )}

            {/* Navigation buttons */}
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>

              <Box sx={{ display: "flex", gap: 2 }}>
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    type="button"
                  >
                    Next
                  </Button>
                )}
                {activeStep === steps.length - 1 && (
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    color="primary"
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                )}
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}
