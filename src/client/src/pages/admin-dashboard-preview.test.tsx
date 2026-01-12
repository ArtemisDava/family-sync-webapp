import { render, screen, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import AdminDashboardPreview from './admin-dashboard-preview';

vi.mock('../components/molecules/admin-card', () => ({
  default: ({ type, amount }: { type: string; amount: number }) => (
    <div data-testid={`widget-${type}`}>{amount}</div>
  ),
}));

vi.mock('../components/molecules/user-vs-freq-chart', () => ({
  default: ({ title, id }: { title: string; id: string }) => (
    <div data-testid={`chart-${id}`}>{title}</div>
  ),
}));

vi.mock('../components/atoms/card', () => ({
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
}));

describe('AdminDashboardPreview', () => {
  describe('Widget Rendering', () => {
    it('renders all dashboard widgets with correct data', () => {
      render(<AdminDashboardPreview />);

      const userWidget = screen.getByTestId('widget-user');
      const familyWidget = screen.getByTestId('widget-family');
      const adminWidget = screen.getByTestId('widget-admin');
      const frequencyWidget = screen.getByTestId('widget-frequency');

      expect(userWidget).toHaveTextContent('6');
      expect(familyWidget).toHaveTextContent('7');
      expect(adminWidget).toHaveTextContent('1');
      expect(frequencyWidget).toHaveTextContent('25');
    });
  });

  describe('Chart Rendering', () => {
    it('renders all three charts with correct titles', () => {
      render(<AdminDashboardPreview />);

      expect(screen.getByTestId('chart-weekly')).toHaveTextContent('Weekly New Users');
      expect(screen.getByTestId('chart-monthly')).toHaveTextContent('Monthly New Users');
      expect(screen.getByTestId('chart-frequency')).toHaveTextContent('Frequency Per Month');
    });
  });

  describe('User Table', () => {
    it('renders the user table with correct headers', () => {
      render(<AdminDashboardPreview />);

      expect(screen.getByText('User Name')).toBeInTheDocument();
      expect(screen.getByText('Families')).toBeInTheDocument();
      expect(screen.getByText('Family Members')).toBeInTheDocument();
      expect(screen.getByText('Account Created At')).toBeInTheDocument();
    });

    it('displays all mock users in the table', () => {
      render(<AdminDashboardPreview />);

      expect(screen.getByText('Jerry Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.getByText('Carol Brown')).toBeInTheDocument();
      expect(screen.getByText('David Jones')).toBeInTheDocument();
      expect(screen.getByText('Eve Garcia')).toBeInTheDocument();
      expect(screen.getByText('Alice Miller')).toBeInTheDocument();
    });

    it('displays family names for each user', () => {
      render(<AdminDashboardPreview />);

      expect(screen.getByText('Smith Family')).toBeInTheDocument();
      expect(screen.getByText('Johnson Family')).toBeInTheDocument();
      expect(screen.getByText('Williams Family')).toBeInTheDocument();
      expect(screen.getByText('Brown Family')).toBeInTheDocument();
      expect(screen.getByText('Jones Family')).toBeInTheDocument();
      expect(screen.getByText('Garcia Family')).toBeInTheDocument();
    });

    it('displays family member counts', () => {
      render(<AdminDashboardPreview />);

      const rows = screen.getAllByRole('row');
      const jerryRow = rows.find((row) => within(row).queryByText('Jerry Smith'));
      expect(jerryRow).toBeDefined();
      if (jerryRow) {
        expect(within(jerryRow).getByText('4')).toBeInTheDocument();
        expect(within(jerryRow).getByText('3')).toBeInTheDocument();
      }
    });
  });

  describe('Search Functionality', () => {
    it('renders the search input', () => {
      render(<AdminDashboardPreview />);

      const searchInput = screen.getByPlaceholderText('Search users...');
      expect(searchInput).toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
      const user = userEvent.setup();
      render(<AdminDashboardPreview />);

      const searchInput = screen.getByPlaceholderText('Search users...');

      expect(screen.getByText('Jerry Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.getByText('Carol Brown')).toBeInTheDocument();

      await user.type(searchInput, 'Bob');

      expect(screen.queryByText('Jerry Smith')).not.toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.queryByText('Carol Brown')).not.toBeInTheDocument();
    });

    it('search is case-insensitive', async () => {
      const user = userEvent.setup();
      render(<AdminDashboardPreview />);

      const searchInput = screen.getByPlaceholderText('Search users...');

      await user.type(searchInput, 'CAROL');

      expect(screen.getByText('Carol Brown')).toBeInTheDocument();
      expect(screen.queryByText('Jerry Smith')).not.toBeInTheDocument();
    });

    it('shows all users when search is cleared', async () => {
      const user = userEvent.setup();
      render(<AdminDashboardPreview />);

      const searchInput = screen.getByPlaceholderText('Search users...');

      await user.type(searchInput, 'Bob');
      expect(screen.queryByText('Jerry Smith')).not.toBeInTheDocument();

      await user.clear(searchInput);

      expect(screen.getByText('Jerry Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.getByText('Carol Brown')).toBeInTheDocument();
    });

    it('shows no users when search term matches nothing', async () => {
      const user = userEvent.setup();
      render(<AdminDashboardPreview />);

      const searchInput = screen.getByPlaceholderText('Search users...');

      await user.type(searchInput, 'NonexistentUser');

      expect(screen.queryByText('Jerry Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Williams')).not.toBeInTheDocument();
      expect(screen.queryByText('Carol Brown')).not.toBeInTheDocument();
    });

    it('filters correctly with partial matches', async () => {
      const user = userEvent.setup();
      render(<AdminDashboardPreview />);

      const searchInput = screen.getByPlaceholderText('Search users...');

      await user.type(searchInput, 'ill');

      expect(screen.getByText('Bob Williams')).toBeInTheDocument();
      expect(screen.getByText('Alice Miller')).toBeInTheDocument();
      expect(screen.queryByText('Jerry Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Carol Brown')).not.toBeInTheDocument();
    });
  });

  describe('Overview Stats Display', () => {
    it('displays total users count', () => {
      render(<AdminDashboardPreview />);

      expect(screen.getByText('Total Users: 6')).toBeInTheDocument();
    });

    it('displays User Overview heading', () => {
      render(<AdminDashboardPreview />);

      expect(screen.getByText('User Overview')).toBeInTheDocument();
    });
  });

  describe('Date Formatting', () => {
    it('formats user creation dates correctly', () => {
      render(<AdminDashboardPreview />);

      const rows = screen.getAllByRole('row');
      const jerryRow = rows.find((row) => within(row).queryByText('Jerry Smith'));
      
      expect(jerryRow).toBeDefined();
      if (jerryRow) {
        const expectedDate = new Date('2023-01-15').toLocaleDateString();
        expect(within(jerryRow).getByText(expectedDate)).toBeInTheDocument();
      }
    });
  });

  describe('Component Structure', () => {
    it('renders the main container with correct classes', () => {
      const { container } = render(<AdminDashboardPreview />);

      const section = container.querySelector('section');
      expect(section).toHaveClass('container');
      expect(section).toHaveClass('py-8');
    });

    it('renders the Card component for the user table', () => {
      render(<AdminDashboardPreview />);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white');
      expect(card).toHaveClass('rounded-lg');
    });
  });

  describe('Mock Data Integrity', () => {
    it('contains correct number of users in mock data', () => {
      render(<AdminDashboardPreview />);

      const rows = screen.getAllByRole('row');
      const dataRows = rows.length - 1;
      expect(dataRows).toBe(6);
    });

    it('users have multiple families displayed correctly', () => {
      render(<AdminDashboardPreview />);

      const rows = screen.getAllByRole('row');
      const jerryRow = rows.find((row) => within(row).queryByText('Jerry Smith'));
      
      if (jerryRow) {
        expect(within(jerryRow).getByText('Smith Family')).toBeInTheDocument();
        expect(within(jerryRow).getByText('Johnson Family')).toBeInTheDocument();
      }

      const eveRow = rows.find((row) => within(row).queryByText('Eve Garcia'));
      if (eveRow) {
        expect(within(eveRow).getByText('Garcia Family')).toBeInTheDocument();
        expect(within(eveRow).getByText('Miller Family')).toBeInTheDocument();
      }
    });
  });
});
