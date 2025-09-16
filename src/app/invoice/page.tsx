"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Trash2,
  FileText,
  Download,
  Building2,
  Hash,
  DollarSign,
  Loader2,
  RefreshCw,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { useWatch } from "react-hook-form";


// Zod schema for invoice validation
const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  date: z.string().min(1, "Date is required"),
  paymentTerms: z.string().min(1, "Payment terms are required"),

  // Sponsor information
  sponsorName: z.string().min(1, "Company name is required"),
  sponsorEmail: z.string().email("Valid email is required"),
  sponsorAddress: z.string().min(1, "Address is required"),
  sponsorCity: z.string().min(1, "City is required"),
  sponsorState: z.string().min(1, "State is required"),
  sponsorZip: z.string().min(1, "ZIP code is required"),

  // Line items
  lineItems: z
    .array(
      z.object({
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unitPrice: z.number().min(0, "Unit price must be positive"),
      }),
    )
    .min(1, "At least one line item is required"),

  // Optional notes
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

const TAX_RATE = 0.0; // 0% tax as shown in example
const PAYMENT_TERMS_OPTIONS = [
  "Due On Receipt",
  "Net 15",
  "Net 30",
  "Net 45",
  "Net 60",
];

const LINE_ITEM_PRESETS = [
  { label: "Bronze Sponsorship Package", price: 1500 },
  { label: "Silver Sponsorship Package", price: 3000 },
  { label: "Gold Sponsorship Package", price: 5000 },
  { label: "Platinum Sponsorship Package", price: 8000 },
  
  { label: "Host a Challenge", price: 2000 },
  { label: "Host a Workshop", price: 1750 },
  { label: "Keynote Speaker", price: 1250 },

  { label: "Sponsored Dinner", price: 2500 },
  { label: "Sponsored Lunch", price: 2000 },
  { label: "Ice-cream Social", price: 600 },
  { label: "Sponsored Snack", price: 400 },
];

export default function InvoiceGenerator() {
  const [isExporting, setIsExporting] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const lastFormDataRef = useRef<string>("");

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceNumber: `${new Date().getMonth() <= 6 ? "S" : "F"}${new Date().getFullYear().toString()}`,
      date: new Date().toISOString().split("T")[0],
      paymentTerms: "Due On Receipt",
      sponsorName: "",
      sponsorEmail: "",
      sponsorAddress: "",
      sponsorCity: "",
      sponsorState: "",
      sponsorZip: "",
      lineItems: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
      notes:
        'PAYMENT INFORMATION*\n\n1. Address a check to "The Pennsylvania State University" with a memo of "HackPSU#1657"\n2. Provide a brief letter (1-2 sentences) saying that you are sponsoring HackPSU and include your company address and contact information\n3. Send both the check and the letter in an enclosed envelope to: 240 HUB Robeson Center, University Park, PA 16802\n',
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lineItems",
  });

  const watchedValues = form.watch();

  // Calculate totals
  const subtotal =
    watchedValues.lineItems?.reduce((sum, item) => {
      return sum + item.quantity * item.unitPrice;
    }, 0) || 0;

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const generatePDF = async (forDownload = false) => {
    try {
      if (forDownload) setIsExporting(true);
      else setIsGeneratingPreview(true);

      // Import jsPDF dynamically to avoid SSR issues
      const jsPDF = (await import("jspdf")).default;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "in",
        format: "letter",
      });

      const pageWidth = 8.5;
      const pageHeight = 11;
      const margin = 0.75;
      const contentWidth = pageWidth - margin * 2;

      // Colors
      const darkGray = "#374151";
      const lightGray = "#6B7280";
      const black = "#000000";

      // Set font
      doc.setFont("helvetica");

      // Header - Invoice title
      doc.setFontSize(28);
      doc.setTextColor(lightGray);
      doc.text("Invoice", margin, margin + 0.5);

      let logoImage;
      try {
        logoImage = await fetch(
          "/logo.png", // Adjust path as needed
        ).then((res) =>
          res.blob().then((blob) => {
            const url = URL.createObjectURL(blob);
            return url;
          }),
        );
        doc.addImage(logoImage, "PNG", pageWidth - margin - 1, margin, 1, 1);
      } catch (error) {
        console.error("Error fetching logo image:", error);
        logoImage = null;
      }

      // From section
      doc.setFontSize(10);
      doc.setTextColor(lightGray);
      doc.text("From", margin, margin + 1.2);

      doc.setFontSize(11);
      doc.setTextColor(black);
      doc.text("HackPSU", margin, margin + 1.4);
      doc.setFontSize(9);
      doc.text("sponsorship@hackpsu.org", margin, margin + 1.6);
      doc.text("240 HUB Robeson Center", margin, margin + 1.8);
      doc.text("University Park, PA 16802", margin, margin + 2.0);

      // To section
      doc.setFontSize(10);
      doc.setTextColor(lightGray);
      doc.text("To", margin + contentWidth / 2, margin + 1.2);

      doc.setFontSize(11);
      doc.setTextColor(black);
      doc.text(
        watchedValues.sponsorName || "Company Name",
        margin + contentWidth / 2,
        margin + 1.4,
      );
      doc.setFontSize(9);
      doc.text(
        watchedValues.sponsorEmail || "contact@company.com",
        margin + contentWidth / 2,
        margin + 1.6,
      );
      doc.text(
        watchedValues.sponsorAddress || "1234 Business Ave",
        margin + contentWidth / 2,
        margin + 1.8,
      );
      doc.text(
        `${watchedValues.sponsorCity || "City"}, ${watchedValues.sponsorState || "ST"} ${watchedValues.sponsorZip || "12345"}`,
        margin + contentWidth / 2,
        margin + 2.0,
      );

      // Invoice details (Number, Date, Terms)
      const detailsY = margin + 2.7;
      doc.setFontSize(9);
      doc.setTextColor(lightGray);
      doc.text("Number", margin, detailsY);
      doc.text("Date", margin + 2.5, detailsY);
      doc.text("Terms", margin + 5, detailsY);

      doc.setFontSize(10);
      doc.setTextColor(black);
      doc.text(watchedValues.invoiceNumber, margin, detailsY + 0.2);
      doc.text(watchedValues.date, margin + 2.5, detailsY + 0.2);
      doc.text(watchedValues.paymentTerms, margin + 5, detailsY + 0.2);

      // Line items table
      const tableY = detailsY + 0.8;
      const rowHeight = 0.3;

      // Table header
      doc.setFillColor(55, 65, 81); // Dark gray
      doc.rect(margin, tableY, contentWidth, 0.4, "F");

      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("Description", margin + 0.1, tableY + 0.25);
      doc.text("Price", margin + contentWidth - 2.5, tableY + 0.25);
      doc.text("Qty", margin + contentWidth - 1.5, tableY + 0.25);
      doc.text("Amount", margin + contentWidth - 0.7, tableY + 0.25);

      // Table rows
      let currentY = tableY + 0.4;
      doc.setTextColor(darkGray);
      doc.setFontSize(9);

      watchedValues.lineItems?.forEach((item, index) => {
        if (index % 2 === 1) {
          doc.setFillColor(249, 250, 251); // Light gray for alternate rows
          doc.rect(margin, currentY, contentWidth, rowHeight, "F");
        }

        doc.text(
          item.description || "Service Description",
          margin + 0.1,
          currentY + 0.2,
        );
        doc.text(
          formatCurrency(item.unitPrice),
          margin + contentWidth - 2.5,
          currentY + 0.2,
        );
        doc.text(
          item.quantity.toString(),
          margin + contentWidth - 1.5,
          currentY + 0.2,
        );
        doc.text(
          formatCurrency(item.quantity * item.unitPrice),
          margin + contentWidth - 0.7,
          currentY + 0.2,
        );

        currentY += rowHeight;
      });

      // Totals section - aligned with table
      const totalsY = currentY + 0.3;
      const totalsX = margin + contentWidth - 0.38; // Align with Amount column

      doc.setFillColor(lightGray);

      doc.setFontSize(9);
      doc.text("Subtotal", totalsX - 2.12, totalsY);
      doc.text(formatCurrency(subtotal), totalsX + 0.22, totalsY, {
        align: "right",
      });

      doc.text(
        `Tax (${(TAX_RATE * 100).toFixed(0)}%)`,
        totalsX - 2.12,
        totalsY + 0.25,
      );
      doc.text(formatCurrency(tax), totalsX + 0.22, totalsY + 0.25, {
        align: "right",
      });

      // Total line
      doc.setLineWidth(0.01);
      doc.rect(margin + 0.02, totalsY + 0.35, contentWidth - 0.02, 0.01, "F");
      //doc.line(totalsX - 2.12, totalsY + 0.35, totalsX + 0.22, totalsY + 0.35);
      doc.setFontSize(9);
      doc.text("Total", totalsX - 2.12, totalsY + 0.55);
      doc.text(formatCurrency(total), totalsX + 0.22, totalsY + 0.55, {
        align: "right",
      });

      // Balance Due (bold)
      //doc.line(totalsX - 1.7, totalsY + 0.7, totalsX, totalsY + 0.7);
      //doc.line(totalsX - 1.7, totalsY + 0.75, totalsX, totalsY + 0.75);
      doc.setFontSize(12);
      doc.text("Balance Due", totalsX - 2.76, totalsY + 0.8);
      doc.text(formatCurrency(total), totalsX + 0.22, totalsY + 0.8, {
        align: "right",
      });

      // Notes section
      if (watchedValues.notes) {
        const notesY = totalsY + 1.5;
        //doc.line(margin, notesY, margin + contentWidth, notesY);

        doc.setFontSize(11);
        doc.setTextColor(black);
        doc.text("Notes", margin, notesY + 0.3);

        doc.setFontSize(9);
        doc.setTextColor(darkGray);

        // Split notes into lines and add them
        const notes = watchedValues.notes.split("\n");
        let noteY = notesY + 0.5;
        notes.forEach((line) => {
          if (line.trim()) {
            // If note line is too long, split it
            const maxLineWidth = contentWidth - 0.2; // Leave some margin
            const words = line.split(" ");
            let currentLine = "";
            words.forEach((word) => {
              const testLine = currentLine + (currentLine ? " " : "") + word;
              const lineWidth = doc.getTextWidth(testLine);
              if (lineWidth > maxLineWidth) {
                doc.text(currentLine, margin, noteY);
                currentLine = word;
                noteY += 0.15;
              } else {
                currentLine = testLine;
              }
            });
            doc.text(currentLine, margin, noteY);
            noteY += 0.15;
          } else {
            noteY += 0.1; // Smaller gap for empty lines
          }
        });
      }

      if (forDownload) {
        // Generate filename and download
        const filename = `HackPSU_Invoice_${watchedValues.invoiceNumber}_${watchedValues.sponsorName?.replace(/[^a-zA-Z0-9]/g, "_") || "Sponsor"}.pdf`;
        doc.save(filename);
      } else {
        // Generate blob for preview
        const pdfBlob = doc.output("blob");
        setPdfBlob(pdfBlob);

        // Clean up previous URL
        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }

        // Create new URL for preview
        const newUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(newUrl);
      }
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setIsGeneratingPreview(false);
    }
  };

  const handleExportPDF = () => {
    generatePDF(true);
  };

  const handleRefreshPreview = () => {
    generatePDF(false);
  };

  const addLineItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const removeLineItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Generate initial preview and update when form changes (with proper change detection)
  useEffect(() => {
    // Create a stable string representation of form data
    const formDataString = JSON.stringify({
      invoiceNumber: watchedValues.invoiceNumber,
      date: watchedValues.date,
      paymentTerms: watchedValues.paymentTerms,
      sponsorName: watchedValues.sponsorName,
      sponsorEmail: watchedValues.sponsorEmail,
      sponsorAddress: watchedValues.sponsorAddress,
      sponsorCity: watchedValues.sponsorCity,
      sponsorState: watchedValues.sponsorState,
      sponsorZip: watchedValues.sponsorZip,
      lineItems: watchedValues.lineItems,
      notes: watchedValues.notes,
    });

    // Only update if data actually changed
    if (formDataString !== lastFormDataRef.current) {
      lastFormDataRef.current = formDataString;

      const timeoutId = setTimeout(() => {
        generatePDF(false);
      }, 800); // Slightly shorter debounce

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues]);

  // Cleanup URLs on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // Triggers upon Line Item changes to manage freebies
  const lineItems = useWatch({ control: form.control, name: "lineItems" });

  useEffect(() => {
    const platinumSelected = lineItems.some(
      (item) => item.description === "Platinum Sponsorship Package"
    );
    const goldSelected = lineItems.some(
      (item) => item.description === "Gold Sponsorship Package"
    );

    const goldFreeItems = ["Host a Challenge"];
    const platinumFreeItems = ["Host a Challenge", "Keynote Speaker", "Host a Workshop"];

    // Remove any free items that shouldn't be there (using platinum items as list since it includes all of the freebees)
    platinumFreeItems.forEach((desc) => {
      const index = lineItems.findIndex(
        (item) => item.description === desc && item.unitPrice === 0
      );
      if (index !== -1) {
        // Only remove if it’s not part of the selected tier
        if (
          (platinumSelected && !platinumFreeItems.includes(lineItems[index].description)) ||
          (goldSelected && !goldFreeItems.includes(lineItems[index].description)) ||
          (!platinumSelected && !goldSelected)
        ) {
          remove(index);
        }
      }
    });

    // Add freebies for the selected tier
    if (platinumSelected) {
      platinumFreeItems.forEach((desc) => {
        if (!lineItems.some((item) => item.description === desc)) {
          append({ description: desc, quantity: 1, unitPrice: 0 });
        }
      });
    } else if (goldSelected) {
      goldFreeItems.forEach((desc) => {
        if (!lineItems.some((item) => item.description === desc)) {
          append({ description: desc, quantity: 1, unitPrice: 0 });
        }
      });
    }

    // Regenerate PDF after updating line items
    const timer = setTimeout(() => {
      generatePDF(false);
    }, 300); // debounce

    return () => clearTimeout(timer);
  }, [lineItems, append, remove]);


  return (
    <div className="container mx-auto max-w-7xl p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Invoice Generator
          </h1>
          <p className="text-muted-foreground">
            Create professional invoices for HackPSU sponsors
          </p>
        </div>
        <div className="flex gap-2 md:flex-row flex-col">
          <Button
            variant="outline"
            onClick={handleRefreshPreview}
            className="flex items-center gap-2"
            disabled={isGeneratingPreview}
          >
            {isGeneratingPreview ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh Preview
          </Button>
          <Button
            onClick={handleExportPDF}
            className="flex items-center gap-2"
            disabled={!form.formState.isValid || isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Panel */}
        <div className="space-y-6">
          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Controller
                    name="invoiceNumber"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="invoiceNumber"
                        placeholder="S20252"
                      />
                    )}
                  />
                  {form.formState.errors.invoiceNumber && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.invoiceNumber.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Controller
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                      <Input {...field} id="date" type="date" />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Controller
                    name="paymentTerms"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                        <SelectContent>
                          {PAYMENT_TERMS_OPTIONS.map((term) => (
                            <SelectItem key={term} value={term}>
                              {term}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sponsor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-4 w-4" />
                Sponsor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sponsorName" className="text-sm">
                    Company Name
                  </Label>
                  <Controller
                    name="sponsorName"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="sponsorName"
                        placeholder="Sponsor Company Inc."
                        className="h-8"
                      />
                    )}
                  />
                  {form.formState.errors.sponsorName && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.sponsorName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sponsorEmail" className="text-sm">
                    Email
                  </Label>
                  <Controller
                    name="sponsorEmail"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="sponsorEmail"
                        type="email"
                        placeholder="contact@company.com"
                        className="h-8"
                      />
                    )}
                  />
                  {form.formState.errors.sponsorEmail && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.sponsorEmail.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="sponsorAddress" className="text-sm">
                  Street Address
                </Label>
                <Controller
                  name="sponsorAddress"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="sponsorAddress"
                      placeholder="1234 Business Ave"
                      className="h-8"
                    />
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="sponsorCity" className="text-sm">
                    City
                  </Label>
                  <Controller
                    name="sponsorCity"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="sponsorCity"
                        placeholder="City"
                        className="h-8"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sponsorState" className="text-sm">
                    State
                  </Label>
                  <Controller
                    name="sponsorState"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="sponsorState"
                        placeholder="PA"
                        maxLength={2}
                        className="h-8"
                      />
                    )}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sponsorZip" className="text-sm">
                    ZIP
                  </Label>
                  <Controller
                    name="sponsorZip"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="sponsorZip"
                        placeholder="12345"
                        className="h-8"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Line Items
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLineItem}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">Item {index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-destructive hover:text-destructive h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-2 items-end">
                    <div className="col-span-3 space-y-1 min-w-0">
                      <Label className="text-xs">Description</Label>
                      <Controller
                        name={`lineItems.${index}.description`}
                        control={form.control}
                        render={({ field }) => {
                          const [open, setOpen] = useState(false);

                          return (
                            <Popover open={open} onOpenChange={setOpen}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  aria-expanded={open}
                                  className="h-8 justify-between text-sm font-normal w-64"
                                >
                                  <span className="truncate overflow-hidden block max-w-[15rem]">
                                    {field.value || "Select or type description..."}
                                  </span>
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-[300px] p-0">
                                <Command>
                                  <CommandInput
                                    placeholder="Search or type custom description..."
                                    value={field.value}
                                    onValueChange={(value) => {
                                      field.onChange(value);
                                    }}
                                  />
                                  <CommandList>
                                    <CommandEmpty>
                                      Type to create custom description
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {LINE_ITEM_PRESETS.map((preset) => (
                                        <CommandItem
                                          key={preset.label}
                                          onSelect={() => {
                                            field.onChange(preset.label);
                                            form.setValue(
                                              `lineItems.${index}.unitPrice`,
                                              preset.price,
                                            );
                                            setOpen(false);
                                          }}
                                        >
                                          <Check
                                            className={`mr-2 h-4 w-4 ${
                                              field.value === preset.label
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }`}
                                          />
                                          <div className="flex flex-col">
                                            <span>{preset.label}</span>
                                            <span className="text-xs text-muted-foreground">
                                              ${preset.price.toLocaleString()}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          );
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Qty</Label>
                      <Controller
                        name={`lineItems.${index}.quantity`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            min="1"
                            className="h-8 text-sm"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 1)
                            }
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Price</Label>
                      <Controller
                        name={`lineItems.${index}.unitPrice`}
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            {...field}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="3000.00"
                            className="h-8 text-sm"
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 0)
                            }
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Total</Label>
                      <div className="h-8 flex items-center text-xs font-medium text-muted-foreground">
                        {formatCurrency(
                          (watchedValues.lineItems?.[index]?.quantity || 0) *
                            (watchedValues.lineItems?.[index]?.unitPrice || 0),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
              <CardDescription>
                Additional information or payment instructions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="notes"
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    rows={8}
                    placeholder="Enter any additional notes or payment instructions..."
                    className="resize-none"
                  />
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* PDF Preview Panel */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                PDF Preview
              </CardTitle>
              <CardDescription>
                Live preview of your invoice PDF
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div
                className="border rounded-lg overflow-hidden bg-gray-100"
                style={{ height: "70vh" }}
              >
                {pdfUrl ? (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="Invoice Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      {isGeneratingPreview ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-gray-500" />
                          <p className="text-gray-500">Generating preview...</p>
                        </>
                      ) : (
                        <>
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-gray-500">
                            PDF preview will appear here
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
