import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModalProvider, useModal } from './modal.context';
import type { Event } from '../models/event';

// Mock de los componentes modal
vi.mock('../components/organisms/createEventModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-event-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../components/organisms/createChildModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="create-child-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../components/organisms/editChildModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="edit-child-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../components/organisms/eventDetailsModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="event-details-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../components/organisms/inviteUserModal', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="invite-user-modal">
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

const TestComponent = () => {
  const {
    invokeCreateEventModal,
    invokeCreateChildModal,
    invokeEditChildModal,
    invokeEventDetailsModal,
    invokeInviteUserModal,
  } = useModal();

  return (
    <div>
      <button
        onClick={() =>
          invokeCreateEventModal({
            families: [{ name: 'Test Family', _id: 'family1' }],
            children: [
              {
                name: 'Test Child',
                _id: 'child1',
                family: { _id: 'family1' },
              },
            ],
            user: null,
          })
        }
      >
        Open Create Event
      </button>
      <button
        onClick={() =>
          invokeCreateChildModal({
            families: [{ name: 'Test Family', _id: 'family1', members: [] }],
          })
        }
      >
        Open Create Child
      </button>
      <button
        onClick={() =>
          invokeEditChildModal({
            child: {
              _id: 'child1',
              name: 'Test Child',
              birthDate: '2018-01-01',
              family: 'family1',
            },
            familyMembers: [{ _id: 'member1', name: 'Member 1' }],
          })
        }
      >
        Open Edit Child
      </button>
      <button
        onClick={() =>
          invokeEventDetailsModal({
            _id: 'event1',
            title: 'Test Event',
            startDate: '2024-01-01',
            endDate: '2024-01-02',
            category: 'school',
            location: 'School',
            family: null,
          } as Event)
        }
      >
        Open Event Details
      </button>
      <button
        onClick={() =>
          invokeInviteUserModal({
            user: { _id: 'user1', name: 'Test User', email: 'test@test.com' },
            families: [{ name: 'Test Family', _id: 'family1' }],
          })
        }
      >
        Open Invite User
      </button>
      <button onClick={() => invokeCreateEventModal(null)}>Close All</button>
    </div>
  );
};

describe('ModalContext', () => {
  it('should throw error when useModal is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useModal must be used within a ModalProvider');

    consoleSpy.mockRestore();
  });

  it('should not render any modal initially', () => {
    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    expect(screen.queryByTestId('create-event-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('create-child-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('edit-child-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('event-details-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('invite-user-modal')).not.toBeInTheDocument();
  });

  it('should open create event modal', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    await user.click(screen.getByText('Open Create Event'));

    await waitFor(() => {
      expect(screen.getByTestId('create-event-modal')).toBeInTheDocument();
    });
  });

  it('should open create child modal', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    await user.click(screen.getByText('Open Create Child'));

    await waitFor(() => {
      expect(screen.getByTestId('create-child-modal')).toBeInTheDocument();
    });
  });

  it('should open edit child modal', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    await user.click(screen.getByText('Open Edit Child'));

    await waitFor(() => {
      expect(screen.getByTestId('edit-child-modal')).toBeInTheDocument();
    });
  });

  it('should open event details modal', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    await user.click(screen.getByText('Open Event Details'));

    await waitFor(() => {
      expect(screen.getByTestId('event-details-modal')).toBeInTheDocument();
    });
  });

  it('should open invite user modal', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    await user.click(screen.getByText('Open Invite User'));

    await waitFor(() => {
      expect(screen.getByTestId('invite-user-modal')).toBeInTheDocument();
    });
  });

  it('should close modal when null is passed', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <TestComponent />
      </ModalProvider>
    );

    await user.click(screen.getByText('Open Create Event'));

    await waitFor(() => {
      expect(screen.getByTestId('create-event-modal')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Close All'));

    await waitFor(() => {
      expect(screen.queryByTestId('create-event-modal')).not.toBeInTheDocument();
    });
  });
});
