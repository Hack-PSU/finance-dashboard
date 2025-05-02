// components/Reimbursements/FilterDrawer.tsx
"use client";
import React from "react";
import {
  Drawer,
  IconButton,
  Checkbox,
  Stack,
  FormControlLabel,
  Button,
  TextField,
} from "@mui/material";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import { Status, Category, SubmitterType } from "@/common/api/finance/entity";

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;

  selectedSubmitterTypes: SubmitterType[];
  selectedCategories: Category[];
  selectedStatuses: Status[];

  minAmount: string;
  maxAmount: string;

  onToggleSubmitterType: (t: SubmitterType) => void;
  onToggleCategory: (c: Category) => void;
  onToggleStatus: (s: Status) => void;
  onMinAmountChange: (v: string) => void;
  onMaxAmountChange: (v: string) => void;
  onReset: () => void;
}

const niceLabel = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export function FilterDrawer({
  open,
  onClose,
  selectedSubmitterTypes,
  selectedCategories,
  selectedStatuses,
  minAmount,
  maxAmount,
  onToggleSubmitterType,
  onToggleCategory,
  onToggleStatus,
  onMinAmountChange,
  onMaxAmountChange,
  onReset,
}: FilterDrawerProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        className: "bg-white text-gray-700 w-72 p-4",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h5 className="text-xl font-bold text-[#F25C54]">Filters</h5>
        <IconButton onClick={onClose} className="text-gray-700">
          <FirstPageIcon />
        </IconButton>
      </div>
      <hr className="border-gray-200 mb-4" />

      {/* Submitter Type */}
      <section className="mb-6">
        <h6 className="font-medium mb-2">Submitter Type</h6>
        <Stack>
          {Object.values(SubmitterType).map((type) => (
            <FormControlLabel
              key={type}
              control={
                <Checkbox
                  checked={selectedSubmitterTypes.includes(type)}
                  onChange={() => onToggleSubmitterType(type)}
                  className="text-[#F25C54] checked:bg-gradient-to-r checked:from-pink-500 checked:to-orange-400"
                />
              }
              label={niceLabel(type)}
              className="text-gray-700"
            />
          ))}
        </Stack>
      </section>

      {/* Category */}
      <section className="mb-6">
        <h6 className="font-medium mb-2">Category</h6>
        <div className="max-h-52 overflow-y-auto">
          <Stack>
            {Object.values(Category).map((cat) => (
              <FormControlLabel
                key={cat}
                control={
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onChange={() => onToggleCategory(cat)}
                    className="text-[#F25C54] checked:bg-gradient-to-r checked:from-pink-500 checked:to-orange-400"
                  />
                }
                label={cat}
                className="text-gray-700"
              />
            ))}
          </Stack>
        </div>
      </section>

      {/* Status */}
      <section className="mb-6">
        <h6 className="font-medium mb-2">Status</h6>
        <Stack>
          {Object.values(Status).map((st) => (
            <FormControlLabel
              key={st}
              control={
                <Checkbox
                  checked={selectedStatuses.includes(st)}
                  onChange={() => onToggleStatus(st)}
                  className="text-[#F25C54] checked:bg-gradient-to-r checked:from-pink-500 checked:to-orange-400"
                />
              }
              label={niceLabel(st)}
              className="text-gray-700"
            />
          ))}
        </Stack>
      </section>

      {/* Amount Range */}
      <section className="mb-6">
        <h6 className="font-medium mb-2">Amount Range</h6>
        <div className="flex space-x-2">
          <TextField
            label="Min"
            variant="outlined"
            size="small"
            type="number"
            value={minAmount}
            onChange={(e) => onMinAmountChange(e.target.value)}
            inputProps={{ min: 0, step: "0.01" }}
            className="w-1/2"
            InputLabelProps={{ className: "text-gray-700" }}
            InputProps={{
              className: "text-gray-700 border border-gray-200 rounded-md",
            }}
          />
          <TextField
            label="Max"
            variant="outlined"
            size="small"
            type="number"
            value={maxAmount}
            onChange={(e) => onMaxAmountChange(e.target.value)}
            inputProps={{ min: 0, step: "0.01" }}
            className="w-1/2"
            InputLabelProps={{ className: "text-gray-700" }}
            InputProps={{
              className: "text-gray-700 border border-gray-200 rounded-md",
            }}
          />
        </div>
      </section>

      {/* Reset Button */}
      <Button
        variant="outlined"
        onClick={onReset}
        className="w-full py-2 rounded-md border-2 border-[#F25C54] text-[#F25C54] hover:bg-[#F25C54] hover:text-white transition"
      >
        Reset Filters
      </Button>
    </Drawer>
  );
}
