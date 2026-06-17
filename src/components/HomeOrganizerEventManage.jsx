import { OrganizerEventManageModal } from "./OrganizerEventManageModal.jsx";
import { useHomeEventOrganizerManage } from "../hooks/useHomeEventOrganizerManage.js";

export function HomeOrganizerEventManage({
  event,
  currentUser,
  onClose,
  onEventUpdated,
  onEventDeleted,
}) {
  const { refreshEvent, modalProps, handleDeleteEvent } =
    useHomeEventOrganizerManage(event, currentUser);

  const handleClose = async () => {
    const ev = await refreshEvent();
    onEventUpdated?.(ev);
    onClose();
  };

  return (
    <OrganizerEventManageModal
      {...modalProps}
      onClose={handleClose}
      onDelete={() =>
        handleDeleteEvent(() => {
          onEventDeleted?.();
          onClose();
        })
      }
    />
  );
}
