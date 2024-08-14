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
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import Link from "@/components/link";
import useLeavePage from "@/services/leave-page/use-leave-page";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";

import {
  useEditMaterialService,
  useGetMaterialService,
} from "@/services/api/services/materials";
import { useParams } from "next/navigation";
import { Material } from "../../../../../../services/api/types/material";
import {
  ProvidersResponse,
  useGetProvidersService,
} from "../../../../../../services/api/services/providers";
import FormSelectInput from "../../../../../../components/form/select/form-select";

type SelectOption = {
  id: number;
  name: string;
};

type EditMaterialFormData = Pick<Material, "name" | "prefix" | "stock"> & {
  provider_id: SelectOption;
};

const useValidationEditUserSchema = () => {
  const { t } = useTranslation("admin-panel-materials-edit");

  return yup.object().shape({
    name: yup
      .string()
      .required(t("admin-panel-materials-edit:inputs.name.validation.required"))
      .min(3, t("admin-panel-materials-edit:inputs.name.validation.invalid")),
    prefix: yup
      .string()
      .required(
        t("admin-panel-materials-edit:inputs.prefix.validation.required")
      ),
  });
};

function EditMaterialFormActions() {
  const { t } = useTranslation("admin-panel-materials-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-materials-edit:actions.submit")}
    </Button>
  );
}

function FormEditMaterial() {
  const params = useParams();
  const fetchGetMaterial = useGetMaterialService();
  const fetchEditMaterial = useEditMaterialService();
  const fetchProviders = useGetProvidersService();

  const [providersData, setProvidersData] = useState<SelectOption[]>([]);
  const { t } = useTranslation("admin-panel-materials-edit");
  const validationSchema = useValidationEditUserSchema();
  const materialId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id
  );

  useEffect(() => {
    const fetchProvidersInfo = async () => {
      const { res } = await fetchProviders({
        page: 1,
        pageSize: 100,
      });

      const data: SelectOption[] = (res as ProvidersResponse).data.items.map(
        (value) => ({
          id: value.id,
          name: `${value.id} - ${value.name}`,
        })
      );

      setProvidersData(data);
    };

    fetchProvidersInfo();
  }, [fetchProviders]);

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditMaterialFormData>({
    // @ts-expect-error ts(2322)
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      prefix: "",
      stock: 0,
      provider_id: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditMaterial({
      id: materialId,
      data: {
        name: formData.name,
        prefix: formData.prefix,
        stock: Number(formData.stock),
        provider_id: formData?.provider_id?.id,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-materials-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-materials-edit:alerts.material.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetMaterial({ id: materialId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          prefix: res.data.prefix,
          stock: res.data.stock,
          provider_id:
            providersData[
              providersData.findIndex(
                (value) => value.id === res.data.provider_id
              )
            ],
        });
      }
    };

    getInitialDataForEdit();
  }, [materialId, reset, fetchGetMaterial, providersData]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="create-new-user">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-materials-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditMaterialFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-materials-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<EditMaterialFormData, SelectOption>
                name="provider_id"
                helperText="Este campo es opcional"
                testId="provider_id"
                label={t("admin-panel-materials-edit:inputs.provider.label")}
                options={providersData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditMaterialFormData>
                name="prefix"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-materials-edit:inputs.prefix.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditMaterialFormData>
                name="stock"
                type="number"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-materials-edit:inputs.stock.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <EditMaterialFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/materials"
                >
                  {t("admin-panel-materials-edit:actions.cancel")}
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
      <FormEditMaterial />
    </>
  );
}

export default withPageRequiredAuth(EditUser);
