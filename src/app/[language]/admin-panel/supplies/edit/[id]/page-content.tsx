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
  useGetSupplyService,
  usePostSupplyService,
} from "@/services/api/services/supplies";
import { Supply } from "../../../../../../services/api/types/supply";
import { useEffect } from "react";
import { useParams } from "next/navigation";

type EditSupplyFormData = Pick<Supply, "name" | "stock">;

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-supplies-edit");

  return yup.object().shape({
    name: yup
      .string()
      .required(t("admin-panel-supplies-edit:inputs.name.validation.required")),
  });
};

function EditSupplyFormActions() {
  const { t } = useTranslation("admin-panel-supplies-edit");

  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-supplies-edit:actions.submit")}
    </Button>
  );
}

function FormEditSupply() {
  const params = useParams();
  const fetchPostSupply = usePostSupplyService();
  const supplyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const fetchGetSupply = useGetSupplyService();
  const { t } = useTranslation("admin-panel-supplies-edit");
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditSupplyFormData>({
    // @ts-expect-error ts(2322)
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      stock: 0,
    },
  });

  const { handleSubmit, setError, reset } = methods;
  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetSupply({ id: supplyId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          stock: res.data.stock,
        });
      }
    };

    getInitialDataForEdit();
  }, [supplyId, reset, fetchGetSupply]);

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostSupply({
        name: formData.name,
        stock: Number(formData.stock),
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-supplies-edit:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(t("admin-panel-supplies-edit:alerts.supply.success"), {
          variant: "success",
        });

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
                {t("admin-panel-supplies-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditSupplyFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-supplies-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditSupplyFormData>
                name="stock"
                type="number"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-supplies-edit:inputs.stock.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <EditSupplyFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/supplies"
                >
                  {t("admin-panel-supplies-edit:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function EditSupply() {
  return <FormEditSupply />;
}

export default withPageRequiredAuth(EditSupply);
