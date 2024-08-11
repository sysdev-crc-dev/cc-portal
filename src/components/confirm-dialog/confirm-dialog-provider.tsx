"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import {
  ConfirmDialogActionsContext,
  ConfirmDialogOptions,
} from "./confirm-dialog-context";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "@/services/i18n/client";
import FormTextInput from "../form/text-input/form-text-input";
import { FormProvider, useForm } from "react-hook-form";
import Grid from "@mui/material/Grid";

type FormData = {
  note: string;
};

function ConfirmDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation("confirm-dialog");
  const methods = useForm<FormData>({
    defaultValues: {
      note: "",
    },
  });

  const { getValues } = methods;

  const defaultConfirmDialogInfo = useMemo<ConfirmDialogOptions>(
    () => ({
      title: t("title"),
      message: t("message"),
      successButtonText: t("actions.yes"),
      cancelButtonText: t("actions.no"),
      showInput: false,
    }),
    [t]
  );

  const [confirmDialogInfo, setConfirmDialogInfo] =
    useState<ConfirmDialogOptions>(defaultConfirmDialogInfo);
  const resolveRef = useRef<(value: boolean | string) => void>();

  const handleClose = () => {
    setIsOpen(false);
  };

  const onCancel = () => {
    setIsOpen(false);
    resolveRef.current?.(false);
  };

  const onSuccess = () => {
    const value = getValues("note");
    setIsOpen(false);
    resolveRef.current?.(value ? value : true);
  };

  const confirmDialog = useCallback(
    (options: Partial<ConfirmDialogOptions> = {}) => {
      return new Promise<boolean | string>((resolve) => {
        setConfirmDialogInfo({
          ...defaultConfirmDialogInfo,
          ...options,
        });
        setIsOpen(true);
        resolveRef.current = resolve;
      });
    },
    [defaultConfirmDialogInfo]
  );

  const contextActions = useMemo(
    () => ({
      confirmDialog,
    }),
    [confirmDialog]
  );

  return (
    <>
      <ConfirmDialogActionsContext.Provider value={contextActions}>
        {children}
      </ConfirmDialogActionsContext.Provider>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {confirmDialogInfo.title}
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            style={{ marginBottom: 16 }}
            id="alert-dialog-description"
          >
            {confirmDialogInfo.message}
          </DialogContentText>
          {confirmDialogInfo.showInput && (
            <FormProvider {...methods}>
              <Grid item xs={12}>
                <FormTextInput name="note" label="Observaciones" type="text" />
              </Grid>
            </FormProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>
            {confirmDialogInfo.cancelButtonText}
          </Button>
          <Button onClick={onSuccess} autoFocus>
            {confirmDialogInfo.successButtonText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ConfirmDialogProvider;
