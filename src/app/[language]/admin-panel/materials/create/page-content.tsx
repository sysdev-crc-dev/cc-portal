"use client";

import Button from "@mui/material/Button";
import { useForm, FormProvider, useFormState, useWatch } from "react-hook-form";
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
import { usePostMaterialService } from "@/services/api/services/materials";
import { Material } from "../../../../../services/api/types/material";
import FormSelectInput from "../../../../../components/form/select/form-select";
import {
  ProvidersResponse,
  useGetProvidersService,
} from "../../../../../services/api/services/providers";
import { useEffect, useState } from "react";

type SelectOption = {
  id: number;
  name: string;
};

type CreateMaterialFormData = Pick<Material, "name" | "prefix" | "stock"> & {
  provider_id: SelectOption;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-materials-create");

  return yup.object().shape({
    name: yup
      .string()
      .required(
        t("admin-panel-materials-create:inputs.name.validation.required")
      )
      .min(3, t("admin-panel-materials-create:inputs.name.validation.invalid")),
    prefix: yup
      .string()
      .required(
        t("admin-panel-materials-create:inputs.prefix.validation.required")
      ),
  });
};

function CreateMaterialFormActions() {
  const { t } = useTranslation("admin-panel-materials-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-materials-create:actions.submit")}
    </Button>
  );
}

function FormCreateMaterial() {
  const fetchPostMaterial = usePostMaterialService();
  const fetchProviders = useGetProvidersService();

  const [providersData, setProvidersData] = useState<SelectOption[]>([]);

  const { t } = useTranslation("admin-panel-materials-create");
  const validationSchema = useValidationSchema();

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

  const methods = useForm<CreateMaterialFormData>({
    // @ts-expect-error ts(2322)
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      prefix: "",
      stock: 0,
      provider_id: undefined,
    },
  });

  const { handleSubmit, setError, reset, control, setValue } = methods;

  const watchProvider = useWatch({ control, name: "provider_id" });

  useEffect(() => {
    if (watchProvider && watchProvider.name) {
      const generatePrefix = (value: string) =>
        // @ts-expect-error ts(2322)
        value?.match(/\b([A-Z])/g).join("");
      setValue("prefix", generatePrefix(watchProvider.name));
    }
  }, [watchProvider, setValue]);

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostMaterial({
        name: formData.name,
        prefix: formData.prefix,
        stock: Number(formData.stock),
        provider_id: formData?.provider_id?.id,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-materials-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-materials-create:alerts.material.success"),
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
                {t("admin-panel-materials-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateMaterialFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-materials-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateMaterialFormData, SelectOption>
                name="provider_id"
                helperText="Este campo es opcional"
                testId="provider_id"
                label={t("admin-panel-materials-create:inputs.provider.label")}
                options={providersData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateMaterialFormData>
                name="prefix"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-materials-create:inputs.prefix.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<CreateMaterialFormData>
                name="stock"
                type="number"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-materials-create:inputs.stock.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateMaterialFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/materials"
                >
                  {t("admin-panel-materials-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateMaterial() {
  return <FormCreateMaterial />;
}

export default withPageRequiredAuth(CreateMaterial);
