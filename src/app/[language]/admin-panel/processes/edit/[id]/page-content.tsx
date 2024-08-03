"use client";

import Button from "@mui/material/Button";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useSnackbar } from "notistack";
import Link from "@/components/link";
import useLeavePage from "@/services/leave-page/use-leave-page";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import {
  useGetProcessService,
  usePostProcessService,
} from "@/services/api/services/processes";
import {
  Process,
  ProcessType,
} from "../../../../../../services/api/types/process";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import FormSelectInput from "../../../../../../components/form/select/form-select";

type SelectOption = {
  id: ProcessType;
  name: string;
};

type EditProcessFormData = Pick<Process, "name" | "file"> & {
  type: SelectOption | null;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-processes-edit");

  return yup.object().shape({
    name: yup
      .string()
      .required(
        t("admin-panel-processes-edit:inputs.name.validation.required")
      ),
    file: yup
      .string()
      .required(
        t("admin-panel-processes-edit:inputs.file.validation.required")
      ),
    type: yup
      .object()
      .shape({
        id: yup.string().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t("admin-panel-processes-edit:inputs.type.validation.required")
      ),
  });
};

function EditProcessFormActions() {
  const { t } = useTranslation("admin-panel-processes-edit");

  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-processes-edit:actions.submit")}
    </Button>
  );
}

function FormEditProcess() {
  const params = useParams();
  const fetchPostProcess = usePostProcessService();
  const processId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const fetchGetProcess = useGetProcessService();
  const { t } = useTranslation("admin-panel-processes-edit");
  const validationSchema = useValidationSchema();
  const typeOptions: SelectOption[] = [
    { id: ProcessType.Internal, name: "Interno" },
    { id: ProcessType.External, name: "Externo" },
  ];
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditProcessFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      file: "",
      type: null,
    },
  });

  const { handleSubmit, setError, reset } = methods;
  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const typeOptions: SelectOption[] = [
        { id: ProcessType.Internal, name: "Interno" },
        { id: ProcessType.External, name: "Externo" },
      ];
      const { status, res } = await fetchGetProcess({ id: processId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          file: res.data.file,
          type: typeOptions[
            typeOptions.findIndex((value) => value.id === res.data.type)
          ],
        });
      }
    };

    getInitialDataForEdit();
  }, [processId, reset, fetchGetProcess]);

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostProcess({
        name: formData.name,
        file: formData.file,
        type: formData.type ? formData.type.id : ProcessType.Internal,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-processes-edit:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-processes-edit:alerts.process.success"),
          {
            variant: "success",
          }
        );

        return;
      }
    },
    (errors) => {
      console.log(errors);
    }
  );

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="edit-new-user">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-processes-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditProcessFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-processes-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditProcessFormData>
                name="file"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-processes-edit:inputs.file.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput
                name="type"
                options={typeOptions}
                label={t("admin-panel-processes-edit:inputs.type.label")}
                keyValue="id"
                renderOption={(option: SelectOption) => option.name}
              />
            </Grid>

            <Grid item xs={12}>
              <EditProcessFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/processes"
                >
                  {t("admin-panel-processes-edit:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function EditProcess() {
  return <FormEditProcess />;
}

export default withPageRequiredAuth(EditProcess);
