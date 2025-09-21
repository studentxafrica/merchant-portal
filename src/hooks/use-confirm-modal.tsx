import { on } from "events";
import { useState } from "react";

export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState({
    title: "",
    message: "" as string | React.ReactNode,
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default" as "default" | "success" | "destructive",
    onConfirm: () => {},
  onClose: () => {},
  });

  const openModal = (props = {
	title: "",
	message: "" as string | React.ReactNode,
	confirmText: "Confirm",
	cancelText: "Cancel",
	variant: "default" as "default" | "success" | "destructive",
	onConfirm: () => {},
	onClose: () => {},
  }) => {
    setModalProps({
      title: props.title || "Confirm Action",
      message: props.message || "Are you sure you want to perform this action?",
      confirmText: props.confirmText || "Confirm",
      cancelText: props.cancelText || "Cancel",
      variant: props.variant as "default" | "success" | "destructive" || "default",
      onConfirm: props.onConfirm || (() => {}),
	  onClose: props.onClose || (() => {}),
    });
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    openModal,
    closeModal,
    modalProps,
  };
};