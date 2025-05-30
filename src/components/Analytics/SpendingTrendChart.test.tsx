import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SpendingTrendChart } from './SpendingTrendChart';
import { FinanceEntity, Category, Status, SubmitterType } from '@/common/api/finance/entity';
import { format, subDays, addDays, parseISO } from 'date-fns';

// Mock Recharts to avoid complex rendering issues in tests if necessary,
// or to spy on props passed to chart components.
// For now, we'll try without extensive mocking of Recharts itself.
// jest.mock('recharts', () => ({
//   ...jest.requireActual('recharts'),
//   ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
//   LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
//   // Mock other specific components if needed
// }));


const mockFinancesData: FinanceEntity[] = [
  { id: '1', amount: 100, category: Category.FOOD, status: Status.APPROVED, submitterId: 'u1', submitterType: SubmitterType.USER, description: 'd1', createdAt: subDays(new Date(), 5), updatedAt: new Date(), receiptUrl: '' },
  { id: '2', amount: 200, category: Category.TRAVEL, status: Status.APPROVED, submitterId: 'u2', submitterType: SubmitterType.USER, description: 'd2', createdAt: subDays(new Date(), 15), updatedAt: new Date(), receiptUrl: '' },
  { id: '3', amount: 50, category: Category.OTHER, status: Status.PENDING, submitterId: 'u3', submitterType: SubmitterType.USER, description: 'd3', createdAt: subDays(new Date(), 25), updatedAt: new Date(), receiptUrl: '' },
];

// Helper to format date for input fields
const formatDateForInput = (date: Date) => format(date, 'yyyy-MM-dd');

describe('SpendingTrendChart', () => {
  it('renders the chart title and date pickers', () => {
    render(<SpendingTrendChart finances={mockFinancesData} />);
    expect(screen.getByText('Spending Trends')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  it('displays data when finances are within the default date range', () => {
    // Assuming default range includes the last month, which should include mockFinancesData[0]
    const recentFinance: FinanceEntity[] = [
         { id: '1', amount: 100, category: Category.FOOD, status: Status.APPROVED, submitterId: 'u1', submitterType: SubmitterType.USER, description: 'd1', createdAt: subDays(new Date(), 2), updatedAt: new Date(), receiptUrl: '' }
    ];
    render(<SpendingTrendChart finances={recentFinance} />);
    // Check if a LineChart element or a known child (like a legend) is rendered.
    // This might require adding test-ids or more specific queries if Recharts output is complex.
    // For now, let's check that "No spending data" is NOT shown.
    expect(screen.queryByText('No spending data for the selected period.')).not.toBeInTheDocument();
  });

  it('shows "No spending data" message when no finances are in selected range', () => {
    const oldFinances: FinanceEntity[] = [
      { id: '1', amount: 100, category: Category.FOOD, status: Status.APPROVED, submitterId: 'u1', submitterType: SubmitterType.USER, description: 'd1', createdAt: subDays(new Date(), 300), updatedAt: new Date(), receiptUrl: '' }
    ];
    render(<SpendingTrendChart finances={oldFinances} />);
     // Default range is last month, so oldFinances should be out of range.
     // The component initializes startDate to startOfMonth(new Date()), so data from 300 days ago will be out of range.
    expect(screen.getByText('No spending data for the selected period.')).toBeInTheDocument();
  });

  it('filters data based on date changes', async () => {
    render(<SpendingTrendChart finances={mockFinancesData} />);

    // Initially, item from 5 days ago should be there, so no "no data" message
     expect(screen.queryByText('No spending data for the selected period.')).not.toBeInTheDocument();

    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');

    // Change dates to a range where no mock data exists
    // Our mock data is 5, 15, 25 days ago.
    // Let's set a range for 30-35 days ago.
    fireEvent.change(startDateInput, { target: { value: formatDateForInput(subDays(new Date(), 35)) } });
    fireEvent.change(endDateInput, { target: { value: formatDateForInput(subDays(new Date(), 30)) } });

    expect(await screen.findByText('No spending data for the selected period.')).toBeInTheDocument();

    // Change dates to include the item from 15 days ago
    fireEvent.change(startDateInput, { target: { value: formatDateForInput(subDays(new Date(), 20)) } });
    fireEvent.change(endDateInput, { target: { value: formatDateForInput(subDays(new Date(), 10)) } });

    // We need to ensure the "No spending data" message is GONE or an element from the chart is present.
    // Since directly inspecting chart data is complex, we'll check that the "no data" message is not there.
    // Using await findBy... can be flaky if the absence of an element is the success condition.
    // A more robust way would be to assert the presence of the chart, or spy on data passed to it.
    // For now, we'll use queryByText for absence.
    // It might take a moment for the component to re-render with the new data.
    await screen.findByText((content, element) => !content.includes('No spending data for the selected period.')); // Wait for the chart to potentially render
    expect(screen.queryByText('No spending data for the selected period.')).not.toBeInTheDocument();


  });
});
