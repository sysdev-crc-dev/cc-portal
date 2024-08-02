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
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import Link from "@/components/link";
import useLeavePage from "@/services/leave-page/use-leave-page";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";

import {
  useEditProviderService,
  useGetProviderService,
} from "@/services/api/services/providers";
import { useParams } from "next/navigation";
import { Provider } from "../../../../../../services/api/types/provider";

type EditProviderFormData = Pick<Provider, "name" | "tag">;

const useValidationEditProvidersSchema = () => {
  const { t } = useTranslation("admin-panel-providers-edit");

  return yup.object().shape({
    name: yup
      .string()
      .required(t("admin-panel-providers-edit:inputs.name.validation.required"))
      .min(3, t("admin-panel-providers-edit:inputs.name.validation.invalid")),
    tag: yup
      .string()
      .required(t("admin-panel-providers-edit:inputs.tag.validation.required")),
  });
};

function EditProviderFormActions() {
  const { t } = useTranslation("admin-panel-providers-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-providers-edit:actions.submit")}
    </Button>
  );
}

function FormEditProvider() {
  const params = useParams();
  const fetchGetProvider = useGetProviderService();
  const fetchEditProvider = useEditProviderService();
  const { t } = useTranslation("admin-panel-providers-edit");
  const validationSchema = useValidationEditProvidersSchema();
  const providerId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id
  );
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditProviderFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      tag: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditProvider({
      id: providerId,
      data: {
        name: formData.name,
        tag: formData.tag,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-providers-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-providers-edit:alerts.provider.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetProvider({ id: providerId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          tag: res.data.tag,
        });
      }
    };

    getInitialDataForEdit();
  }, [providerId, reset, fetchGetProvider]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-providers-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditProviderFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-providers-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditProviderFormData>
                name="tag"
                testId="new-user-password"
                autoComplete="new-user-password"
                label={t("admin-panel-providers-edit:inputs.tag.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <EditProviderFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/providers"
                >
                  {t("admin-panel-providers-edit:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function EditUser() {
  return (
    <>
      <FormEditProvider />
    </>
  );
}

export default withPageRequiredAuth(EditUser);
