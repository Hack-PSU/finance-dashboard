import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TotalSpending, SpendingByCategory, SubmissionStatusCounts } from './FinanceAnalyticsWidgets';
import { FinanceEntity, Status, Category, SubmitterType } from '@/common/api/finance/entity';

// Mock Data
const mockFinances: FinanceEntity[] = [
  { id: '1', amount: 100, category: Category.TRAVEL, status: Status.APPROVED, submitterId: 'user1', submitterType: SubmitterType.USER, description: 'Flight ticket', createdAt: new Date(), updatedAt: new Date(), receiptUrl: '' },
  { id: '2', amount: 50, category: Category.FOOD, status: Status.PENDING, submitterId: 'user2', submitterType: SubmitterType.USER, description: 'Lunch', createdAt: new Date(), updatedAt: new Date(), receiptUrl: '' },
  { id: '3', amount: 200, category: Category.TRAVEL, status: Status.REJECTED, submitterId: 'user3', submitterType: SubmitterType.USER, description: 'Hotel', createdAt: new Date(), updatedAt: new Date(), receiptUrl: '' },
  { id: '4', amount: 75, category: Category.OTHER, status: Status.APPROVED, submitterId: 'user4', submitterType: SubmitterType.USER, description: 'Supplies', createdAt: new Date(), updatedAt: new Date(), receiptUrl: '' },
];

describe('FinanceAnalyticsWidgets', () => {
  describe('TotalSpending', () => {
    it('renders total spending correctly', () => {
      render(<TotalSpending finances={mockFinances} />);
      expect(screen.getByText('$425.00')).toBeInTheDocument();
    });

    it('renders $0.00 for no finances', () => {
      render(<TotalSpending finances={[]} />);
      expect(screen.getByText('$0.00')).toBeInTheDocument();
    });
  });

  describe('SpendingByCategory', () => {
    it('renders spending by category correctly', () => {
      render(<SpendingByCategory finances={mockFinances} />);
      expect(screen.getByText('TRAVEL: $300.00')).toBeInTheDocument();
      expect(screen.getByText('FOOD: $50.00')).toBeInTheDocument();
      expect(screen.getByText('OTHER: $75.00')).toBeInTheDocument();
    });

    it('renders message for no data', () => {
      render(<SpendingByCategory finances={[]} />);
      expect(screen.getByText('No spending data by category.')).toBeInTheDocument();
    });
  });

  describe('SubmissionStatusCounts', () => {
    it('renders submission status counts correctly', () => {
      render(<SubmissionStatusCounts finances={mockFinances} />);
      expect(screen.getByText('APPROVED: 2')).toBeInTheDocument();
      expect(screen.getByText('PENDING: 1')).toBeInTheDocument();
      expect(screen.getByText('REJECTED: 1')).toBeInTheDocument();
    });

    it('renders message for no data', () => {
      render(<SubmissionStatusCounts finances={[]} />);
      expect(screen.getByText('No submissions found.')).toBeInTheDocument();
    });
  });
});
