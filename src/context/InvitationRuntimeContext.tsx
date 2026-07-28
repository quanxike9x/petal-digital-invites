import React, { createContext, useContext, useState } from 'react';
import type { InvitationData } from '../types/invitationRuntime';
import { DEFAULT_PREVIEW_INVITATION_DATA } from '../types/invitationRuntime';

interface InvitationRuntimeContextType {
  invitationData: InvitationData;
  setInvitationData: (data: InvitationData) => void;
  updateInvitationData: (newData: Partial<InvitationData>) => void;
}

const InvitationRuntimeContext = createContext<InvitationRuntimeContextType | undefined>(undefined);

interface InvitationRuntimeProviderProps {
  children: React.ReactNode;
  initialData?: InvitationData;
}

export const InvitationRuntimeProvider: React.FC<InvitationRuntimeProviderProps> = ({
  children,
  initialData = DEFAULT_PREVIEW_INVITATION_DATA,
}) => {
  const [invitationData, setInvitationData] = useState<InvitationData>(initialData);

  const updateInvitationData = (newData: Partial<InvitationData>) => {
    setInvitationData((prev) => ({ ...prev, ...newData }));
  };

  return (
    <InvitationRuntimeContext.Provider
      value={{
        invitationData,
        setInvitationData,
        updateInvitationData,
      }}
    >
      {children}
    </InvitationRuntimeContext.Provider>
  );
};

export const useInvitationRuntime = (): InvitationRuntimeContextType => {
  const context = useContext(InvitationRuntimeContext);
  if (!context) {
    // Fallback to default mock preview data if provider is omitted
    return {
      invitationData: DEFAULT_PREVIEW_INVITATION_DATA,
      setInvitationData: () => {},
      updateInvitationData: () => {},
    };
  }
  return context;
};
