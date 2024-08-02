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
import { usePostProviderService } from "@/services/api/services/providers";
import { Provider } from "../../../../../services/api/types/provider";

type CreateProviderFormData = Pick<Provider, "name" | "tag">;

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-provider-create");

  return yup.object().shape({
    name: yup
      .string()
      .required(
        t("admin-panel-providers-create:inputs.name.validation.required")
      )
      .min(3, t("admin-panel-providers-create:inputs.name.validation.invalid")),
    tag: yup
      .string()
      .required(
        t("admin-panel-providers-create:inputs.tag.validation.required")
      ),
  });
};

function CreateEmployeeFormActions() {
  const { t } = useTranslation("admin-panel-providers-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-providers-create:actions.submit")}
    </Button>
  );
}

function FormCreateEmployee() {
  const fetchPostProvider = usePostProviderService();
  const { t } = useTranslation("admin-panel-providers-create");
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateProviderFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      tag: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostProvider({
        name: formData.name,
        tag: formData.tag,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-providers-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-providers-create:alerts.provider.success"),
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
                {t("admin-panel-providers-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateProviderFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-providers-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateProviderFormData>
                name="tag"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-providers-create:inputs.tag.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateEmployeeFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/providers"
                >
                  {t("admin-panel-providers-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateEmployee() {
  return <FormCreateEmployee />;
}

export default withPageRequiredAuth(CreateEmployee);
