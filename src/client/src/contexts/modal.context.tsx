import { createContext, useContext, useState } from "react";
import CreateEventModal from "../components/organisms/createEventModal";
import CreateChildModal from "../components/organisms/createChildModal";
import EditChildModal from "../components/organisms/editChildModal";
import EventDetailsModal from "../components/organisms/eventDetailsModal";
import InviteUserModal from "../components/organisms/inviteUserModal";
import { type Event } from "../models/event";
import type LoginInformation from "../models/loginInformation";

interface Child {
  _id: string;
  name: string;
  birthDate: string;
  color?: string;
  family: string;
  guardians?: string[];
}

interface ModalContextType {
  invokeCreateEventModal: (
    value: null | {
      start?: Date;
      end?: Date;
      families: { name: string; _id: string }[];
      children: {
        name: string;
        _id: string;
        family: { _id: string };
        color?: string;
      }[];
      onEventCreated?: () => void;
      user: LoginInformation | null;
    },
  ) => void;
  invokeCreateChildModal: (
    value: null | {
      families: { name: string; _id: string; members: unknown[] }[];
      onChildCreated?: () => void;
    },
  ) => void;
  invokeEditChildModal: (
    value: null | {
      child: Child;
      familyMembers: { _id: string; name: string }[];
      onChildUpdated?: () => void;
    },
  ) => void;
  invokeEventDetailsModal: (
    value: Event | null,
    options?: { onEventDeleted?: () => void },
  ) => void;
  invokeInviteUserModal: (
    value: null | {
      user: { _id: string; name: string; email: string };
      families: { name: string; _id: string }[];
    },
  ) => void;
}
interface ModalProviderProps {
  children: React.ReactNode;
}
const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [showedCreateEventModal, setShowedCreateEventModal] = useState<{
    start?: Date;
    end?: Date;
    families: { name: string; _id: string }[];
    children: { name: string; _id: string; family: { _id: string } }[];
    onEventCreated?: () => void;
    user: LoginInformation | null;
  } | null>(null);
  const [showedCreateChildModal, setShowedCreateChildModal] = useState<{
    families: { name: string; _id: string; members: unknown[] }[];
    onChildCreated?: () => void;
  } | null>(null);
  const [showedEditChildModal, setShowedEditChildModal] = useState<{
    child: Child;
    familyMembers: { _id: string; name: string }[];
    onChildUpdated?: () => void;
  } | null>(null);
  const [showEventDetailsModal, setShowEventDetailsModal] = useState<{
    event: Event;
    onEventDeleted?: () => void;
  } | null>(null);
  const [showInviteUserModal, setShowInviteUserModal] = useState<{
    user: { _id: string; name: string; email: string };
    families: { name: string; _id: string }[];
  } | null>(null);

  const invokeCreateEventModal = setShowedCreateEventModal;
  const invokeCreateChildModal = setShowedCreateChildModal;
  const invokeEditChildModal = setShowedEditChildModal;
  const invokeInviteUserModal = setShowInviteUserModal;

  const invokeEventDetailsModal = (
    value: Event | null,
    options?: { onEventDeleted?: () => void },
  ) => {
    if (value) {
      setShowEventDetailsModal({
        event: value,
        onEventDeleted: options?.onEventDeleted,
      });
    } else {
      setShowEventDetailsModal(null);
    }
  };

  const sharingData = {
    invokeCreateEventModal,
    invokeCreateChildModal,
    invokeEditChildModal,
    invokeEventDetailsModal,
    invokeInviteUserModal,
  };

  return (
    <ModalContext.Provider value={sharingData}>
      {children}
      {showedCreateEventModal && (
        <CreateEventModal
          open={showedCreateEventModal}
          onClose={() => invokeCreateEventModal(null)}
        />
      )}
      {showedCreateChildModal && (
        <CreateChildModal
          open={showedCreateChildModal}
          onClose={() => invokeCreateChildModal(null)}
        />
      )}
      {showedEditChildModal && (
        <EditChildModal
          open={showedEditChildModal}
          onClose={() => invokeEditChildModal(null)}
        />
      )}
      {showEventDetailsModal && (
        <EventDetailsModal
          event={showEventDetailsModal.event}
          onClose={() => invokeEventDetailsModal(null)}
          onEventDeleted={showEventDetailsModal.onEventDeleted}
        />
      )}
      {showInviteUserModal && (
        <InviteUserModal
          open={showInviteUserModal}
          onClose={() => invokeInviteUserModal(null)}
        />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
