import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import FinanceAnalyticsPage from './page';
import * as financeHooks from '@/common/api/finance'; // Import all hooks
import { FinanceEntity, Status, Category, SubmitterType } from '@/common/api/finance/entity';

// Mock the hooks
jest.mock('@/common/api/finance');
const mockedUseAllFinances = financeHooks.useAllFinances as jest.Mock;

// Mock Data
const mockFinancesData: FinanceEntity[] = [
  { id: '1', amount: 100, category: Category.TRAVEL, status: Status.APPROVED, submitterId: 'user1', submitterType: SubmitterType.USER, description: 'Flight', createdAt: new Date(), updatedAt: new Date(), receiptUrl: '' },
  { id: '2', amount: 50, category: Category.FOOD, status: Status.PENDING, submitterId: 'user2', submitterType: SubmitterType.USER, description: 'Meal', createdAt: new Date(), updatedAt: new Date(), receiptUrl: '' },
];

// Mock useRouter:
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
    usePathname: () => ('/finance/analytics') // Add a mock for usePathname
}));

describe('FinanceAnalyticsPage', () => {
  it('renders loading state initially', () => {
    mockedUseAllFinances.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<FinanceAnalyticsPage />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockedUseAllFinances.mockReturnValue({ data: null, isLoading: false, error: { message: 'Failed to fetch' } });
    render(<FinanceAnalyticsPage />);
    expect(screen.getByText(/Error fetching financial data: Failed to fetch/i)).toBeInTheDocument();
  });

  it('renders analytics components with data', () => {
    mockedUseAllFinances.mockReturnValue({ data: mockFinancesData, isLoading: false, error: null });
    render(<FinanceAnalyticsPage />);
    // Check for titles of the widgets
    expect(screen.getByText('Total Spending')).toBeInTheDocument();
    expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    expect(screen.getByText('Submission Statuses')).toBeInTheDocument();
    // Check for some data points
    expect(screen.getByText('$150.00')).toBeInTheDocument(); // Total Spending
    expect(screen.getByText('TRAVEL: $100.00')).toBeInTheDocument(); // Spending by Category
    expect(screen.getByText('APPROVED: 1')).toBeInTheDocument(); // Submission Status
  });

  it('renders correctly when no finances data is available', () => {
    mockedUseAllFinances.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<FinanceAnalyticsPage />);
    expect(screen.getByText('Total Spending')).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();
    expect(screen.getByText('No spending data by category.')).toBeInTheDocument();
    expect(screen.getByText('No submissions found.')).toBeInTheDocument();
  });
});
