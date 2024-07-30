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
  useEditCompanyService,
  useGetCompanyService,
} from "@/services/api/services/companies";
import { useParams } from "next/navigation";

type EditCompanyFormData = {
  name: string;
  type: string;
};

const useValidationEditUserSchema = () => {
  const { t } = useTranslation("admin-panel-companies-edit");

  return yup.object().shape({
    name: yup
      .string()
      .required(t("admin-panel-companies-edit:inputs.name.validation.required"))
      .min(3, t("admin-panel-companies-edit:inputs.name.validation.invalid")),
    type: yup
      .string()
      .required(
        t("admin-panel-companies-edit:inputs.type.validation.required")
      ),
  });
};

function EditCompanyFormActions() {
  const { t } = useTranslation("admin-panel-companies-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-companies-edit:actions.submit")}
    </Button>
  );
}

function FormEditCompany() {
  const params = useParams();
  const fetchGetCompany = useGetCompanyService();
  const fetchEditCompany = useEditCompanyService();
  const { t } = useTranslation("admin-panel-companies-edit");
  const validationSchema = useValidationEditUserSchema();
  const companyId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditCompanyFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditCompany({
      id: companyId,
      data: {
        name: formData.name,
        type: formData.type,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-companies-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-companies-edit:alerts.company.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetCompany({ id: companyId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          type: res.data.type,
        });
      }
    };

    getInitialDataForEdit();
  }, [companyId, reset, fetchGetCompany]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-companies-edit:title1")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditCompanyFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-companies-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditCompanyFormData>
                name="type"
                testId="new-user-password"
                autoComplete="new-user-password"
                label={t("admin-panel-companies-edit:inputs.type.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <EditCompanyFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/companies"
                >
                  {t("admin-panel-companies-edit:actions.cancel")}
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
      <FormEditCompany />
    </>
  );
}

export default withPageRequiredAuth(EditUser);
