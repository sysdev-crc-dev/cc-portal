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
import { usePostSupplyService } from "@/services/api/services/supplies";
import { Supply } from "../../../../../services/api/types/supply";

type CreateSupplyFormData = Pick<Supply, "name" | "stock">;

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-supplies-create");

  return yup.object().shape({
    name: yup
      .string()
      .required(
        t("admin-panel-supplies-create:inputs.name.validation.required")
      ),
  });
};

function CreateSupplyFormActions() {
  const { t } = useTranslation("admin-panel-supplies-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-supplies-create:actions.submit")}
    </Button>
  );
}

function FormCreateSupply() {
  const fetchPostSupply = usePostSupplyService();

  const { t } = useTranslation("admin-panel-supplies-create");
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateSupplyFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      stock: 0,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostSupply({
        name: formData.name,
        stock: Number(formData.stock),
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-supplies-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-supplies-create:alerts.supply.success"),
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
                {t("admin-panel-supplies-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateSupplyFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-supplies-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateSupplyFormData>
                name="stock"
                type="number"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-supplies-create:inputs.stock.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateSupplyFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/supplies"
                >
                  {t("admin-panel-supplies-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateSupply() {
  return <FormCreateSupply />;
}

export default withPageRequiredAuth(CreateSupply);
