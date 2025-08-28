# HackPSU Finance Dashboard

A comprehensive web application for managing financial submissions, reimbursements, and analytics for HackPSU events. Built for internal hackathon organizers to streamline financial operations and provide detailed spending insights.

## Project Overview

The HackPSU Finance Dashboard serves as a centralized platform for managing all financial aspects of HackPSU hackathon events. It enables organizers to process reimbursement requests, track spending across multiple categories, and analyze financial data through detailed analytics dashboards.

**Target Users**: HackPSU organizers and administrative staff
**Primary Use Cases**:

- Processing and approving reimbursement requests
- Tracking expenses across 80+ predefined categories
- Analyzing spending patterns and trends
- Managing submissions from both users and organizers
- Generating comprehensive financial reports

**Key Capabilities**:

- Real-time financial data management with Firebase integration
- Advanced filtering and search functionality
- Interactive analytics with charts and visualizations
- Status-based workflow management (Pending, Approved, Rejected, Deposit)
- Receipt management and validation
- Multi-user role support (Users vs Organizers)

## Tech Stack

### Core Framework

- **Next.js** - React framework with App Router for server-side rendering and optimized performance
- **React** - Component-based UI library for building interactive interfaces
- **TypeScript** - Type-safe development with enhanced developer experience

### Styling & UI Components

- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - High-quality, accessible React components built on Radix UI primitives
- **Material-UI** - Additional UI components for complex interactions and theming
- **Emotion** - CSS-in-JS library for dynamic styling and theme management
- **Lucide React** - Comprehensive icon library for consistent visual elements

### Authentication & Backend Integration

- **Firebase** - Backend-as-a-Service providing authentication, database, and storage
- **JWT Decode** - JSON Web Token parsing for authentication state management
- **Axios** - HTTP client for API communications with comprehensive error handling

### Form Handling & Validation

- **React Hook Form** - Performant form library with minimal re-renders
- **Yup** - Schema validation for form data integrity
- **Zod** - TypeScript-first schema validation for runtime type checking

### Analytics & Monitoring

- **PostHog** - Product analytics and user behavior tracking
- **Vercel Analytics** - Performance monitoring and web vitals tracking
- **Recharts** - Data visualization library for financial charts and graphs

### Development Tools

- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting for consistent style
- **TanStack Query** - Server state management with caching and synchronization

## Architecture & Design Decisions

### App Router Structure

- Utilizes Next.js 15 App Router for file-based routing and enhanced performance
- Server-side rendering for improved SEO and faster initial page loads
- API integration through custom hooks and providers for clean separation of concerns

### Authentication Strategy

- Firebase Authentication with JWT token management
- Role-based access control distinguishing between Users and Organizers
- AuthGuard component for protected route management

### State Management

- TanStack Query for server state management and caching
- React Context for global UI state (layout, theme, authentication)
- Local state with React hooks for component-specific interactions

### Styling Architecture

- Tailwind CSS with custom design system configuration
- CSS variables for dynamic theming support
- Component composition pattern with shadcn/ui for consistency
- Material-UI integration for complex components requiring advanced functionality

### Performance Optimizations

- Lazy loading for analytics charts and complex visualizations
- Pagination for large data sets in finance tables
- Optimistic updates for status changes with proper error handling
- Memoization of expensive calculations in analytics components

## Getting Started

### Prerequisites

- Node.js (recommended version specified in package.json)
- Yarn package manager
- Firebase project with configured environment variables

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Configure environment variables:
   - Copy `.env.example` to `.env.local`
   - Add Firebase configuration values
   - Set API base URL for backend services

4. Start the development server:
   ```bash
   yarn dev
   ```

### Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build production-ready application
- `yarn start` - Start production server
- `yarn lint` - Run ESLint for code quality checks
- `yarn format` - Format code using Prettier

### Environment Setup

Configure the following environment variables:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BASE_URL_V3`

## Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── analytics/               # Analytics dashboard routes
│   │   ├── general/            # Organization-wide analytics
│   │   └── self/               # Personal spending analytics
│   ├── finance/                # Finance management routes
│   │   ├── [id]/              # Individual finance record details
│   │   └── page.tsx           # Finance dashboard overview
│   ├── invoice/               # Invoice generation
│   ├── reimbursement/         # Reimbursement request forms
│   ├── layout.tsx             # Root layout with providers
│   └── globals.css            # Global styles and Tailwind imports
├── common/                      # Shared utilities and configurations
│   ├── api/                    # API clients and data layer
│   │   ├── analytics/         # Analytics data management
│   │   ├── finance/           # Finance entity definitions and hooks
│   │   ├── user/              # User management
│   │   └── apiClient.ts       # Centralized HTTP client
│   ├── config/                # Environment and Firebase configuration
│   ├── context/               # React context providers
│   └── types/                 # TypeScript type definitions
├── components/                  # Reusable UI components
│   ├── Analytics/             # Analytics visualization components
│   ├── DataTable/             # Table components with sorting/filtering
│   ├── DashboardLayout/       # Main application layout
│   ├── ReimbursementForm/     # Form components for submissions
│   └── ui/                    # shadcn/ui component library
├── hooks/                      # Custom React hooks
└── lib/                        # Utility functions and configurations
```

## Key Features

### Financial Management

- **Reimbursement Processing**: Complete workflow for submitting, reviewing, and approving reimbursement requests
- **Status Management**: Four-stage approval process (Pending, Approved, Rejected, Deposit)
- **Receipt Handling**: File upload and validation for supporting documentation
- **Category Classification**: 80+ predefined expense categories for accurate tracking

### Analytics & Reporting

- **Organization Analytics**: Comprehensive spending overview with trend analysis
- **Personal Analytics**: Individual spending summaries and submission history
- **Interactive Visualizations**: Charts and graphs using Recharts for data presentation
- **Performance Metrics**: Approval rates, spending trends, and comparative analysis

### Data Management

- **Advanced Filtering**: Multi-criteria filtering by status, category, submitter type, and amount ranges
- **Search Functionality**: Full-text search across all submission fields
- **Sorting Capabilities**: Sortable columns with ascending/descending order
- **Pagination**: Efficient handling of large datasets with configurable page sizes

### User Experience

- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Real-time Updates**: Live data synchronization using TanStack Query
- **Toast Notifications**: User feedback for all CRUD operations using Sonner
- **Loading States**: Skeleton components and progress indicators for better UX

## Deployment

The application is optimized for deployment on Vercel with automatic builds from the main branch. Firebase services handle backend infrastructure including authentication, database, and file storage.

## Contributing

### Code Standards and Best Practices

- Follow TypeScript strict mode for type safety
- Use ESLint configuration for consistent code quality
- Implement proper error handling with user-friendly messaging
- Write semantic HTML with accessibility considerations
- Follow React best practices including proper hook usage and component composition

### Development Workflow Expectations

- Create feature branches from main for new development
- Ensure all TypeScript errors are resolved before submission
- Test components thoroughly across different screen sizes
- Validate form submissions and error states
- Run linting and formatting before committing changes
