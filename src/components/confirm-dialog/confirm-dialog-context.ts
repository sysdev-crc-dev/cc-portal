"use client";

import { createContext } from "react";

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  successButtonText: string;
  cancelButtonText: string;
  showInput: boolean;
};

export const ConfirmDialogActionsContext = createContext<{
  confirmDialog: ({
    title,
    message,
    successButtonText,
    cancelButtonText,
    showInput,
  }?: Partial<ConfirmDialogOptions>) => Promise<boolean | string>;
}>({
  confirmDialog: () => Promise.resolve(false),
});
