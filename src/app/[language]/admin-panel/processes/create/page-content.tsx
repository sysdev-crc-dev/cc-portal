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
import { usePostProcessService } from "@/services/api/services/processes";
import {
  Process,
  ProcessType,
} from "../../../../../services/api/types/process";
import FormSelectInput from "../../../../../components/form/select/form-select";

type SelectOption = {
  id: ProcessType;
  name: string;
};

type CreateProcessFormData = Pick<Process, "name" | "file"> & {
  type: SelectOption;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-processes-create");

  return yup.object().shape({
    name: yup
      .string()
      .required(
        t("admin-panel-processes-create:inputs.name.validation.required")
      ),
    file: yup
      .string()
      .required(
        t("admin-panel-processes-create:inputs.file.validation.required")
      ),
    type: yup
      .object()
      .shape({
        id: yup.string().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t("admin-panel-processes-create:inputs.type.validation.required")
      ),
  });
};

function CreateProcessFormActions() {
  const { t } = useTranslation("admin-panel-processes-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-processes-create:actions.submit")}
    </Button>
  );
}

function FormCreateProcess() {
  const fetchPostProcess = usePostProcessService();

  const { t } = useTranslation("admin-panel-processes-create");
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateProcessFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      file: "",
      type: null,
    },
  });

  const typeOptions: SelectOption[] = [
    { id: ProcessType.Internal, name: "Interno" },
    { id: ProcessType.External, name: "Externo" },
  ];
  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostProcess({
        name: formData.name,
        file: formData.file,
        type: formData.type.id,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-processes-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-processes-create:alerts.process.success"),
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
        <form onSubmit={onSubmit} autoComplete="create-new-user">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-processes-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateProcessFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-processes-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateProcessFormData>
                name="file"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-processes-create:inputs.file.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateProcessFormData>
                name="type"
                options={typeOptions}
                label={t("admin-panel-processes-create:inputs.type.label")}
                keyValue="id"
                keyExtractor={(option) => option.id.toString()}
                renderOption={(option) => option.name}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateProcessFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/processes"
                >
                  {t("admin-panel-processes-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateProcess() {
  return <FormCreateProcess />;
}

export default withPageRequiredAuth(CreateProcess);
