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
  useEditAddressService,
  useGetAddressService,
} from "@/services/api/services/addresses";
import { useParams } from "next/navigation";
import { Address } from "../../../../../../services/api/types/address";
import {
  useGetCustomersService,
  CustomersResponse,
} from "../../../../../../services/api/services/customers";
import FormSelectInput from "../../../../../../components/form/select/form-select";
import {
  ProvidersResponse,
  useGetProvidersService,
} from "../../../../../../services/api/services/providers";

type SelectOption = {
  id: number;
  name: string;
};

type EditAddressFormData = Pick<
  Address,
  | "street"
  | "no_int"
  | "no_ext"
  | "postal_code"
  | "neighborhood"
  | "state"
  | "town"
  | "extra_info"
> & {
  customer_id: SelectOption;
  provider_id: SelectOption;
};

const useValidationEditUserSchema = () => {
  const { t } = useTranslation("admin-panel-addresses-edit");

  return yup.object().shape({
    street: yup
      .string()
      .required(
        t("admin-panel-addresses-edit:inputs.street.validation.required")
      ),
    no_ext: yup
      .string()
      .required(
        t("admin-panel-addresses-edit:inputs.no_ext.validation.required")
      ),
    neighborhood: yup
      .string()
      .required(
        t("admin-panel-addresses-edit:inputs.neighborhood.validation.required")
      ),
    postal_code: yup
      .string()
      .required(
        t("admin-panel-addresses-edit:inputs.postal_code.validation.required")
      )
      .length(
        5,
        t("admin-panel-addresses-edit:inputs.postal_code.validation.invalid")
      ),
  });
};

function CreateAddressFormActions() {
  const { t } = useTranslation("admin-panel-addresses-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-addresses-edit:actions.submit")}
    </Button>
  );
}

function FormEditAddress() {
  const params = useParams();
  const fetchGetAddress = useGetAddressService();
  const fetchEditAddress = useEditAddressService();
  const fetchCustomers = useGetCustomersService();
  const fetchProviders = useGetProvidersService();
  const { t } = useTranslation("admin-panel-addresses-edit");
  const [customersData, setCustomersData] = useState<SelectOption[]>([]);
  const [providersData, setProvidersData] = useState<SelectOption[]>([]);
  const validationSchema = useValidationEditUserSchema();
  const addressId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const fetchCustomersInfo = async () => {
      const { res } = await fetchCustomers({
        page: 1,
        pageSize: 100,
      });

      const data: SelectOption[] = (res as CustomersResponse).data.items.map(
        (value) => ({
          id: value.id,
          name: `${value.id} - ${value.name} ${value.last_name}`,
        })
      );

      setCustomersData(data);
    };

    fetchCustomersInfo();
  }, [fetchCustomers]);

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

  const methods = useForm<EditAddressFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      street: "",
      no_ext: undefined,
      no_int: undefined,
      neighborhood: "",
      postal_code: "",
      extra_info: "",
      customer_id: undefined,
      provider_id: undefined,
      town: "",
      state: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditAddress({
      id: addressId,
      data: {
        street: formData.street,
        neighborhood: formData.neighborhood,
        postal_code: formData.postal_code,
        extra_info: formData.extra_info,
        no_ext: formData.no_ext,
        no_int: formData.no_int,
        state: formData.state,
        town: formData.town,
        customer_id: formData.customer_id?.id ?? null,
        provider_id: formData.provider_id?.id ?? null,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-addresses-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-addresses-edit:alerts.address.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetAddress({ id: addressId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          street: res.data.street,
          no_ext: res.data.no_ext,
          no_int: res.data.no_int,
          neighborhood: res.data.neighborhood,
          postal_code: res.data.postal_code,
          extra_info: res.data.extra_info,
          customer_id:
            customersData[
              customersData.findIndex(
                (value) => value.id === res.data.customer_id ?? 0
              )
            ],
          provider_id:
            customersData[
              customersData.findIndex(
                (value) => value.id === res.data.provider_id ?? 0
              )
            ],
          town: res.data.town,
          state: res.data.state,
        });
      }
    };

    getInitialDataForEdit();
  }, [addressId, reset, fetchGetAddress, customersData]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="create-new-address">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-addresses-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="street"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.street.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="no_ext"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.no_ext.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="no_int"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.no_int.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="neighborhood"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t(
                  "admin-panel-addresses-edit:inputs.neighborhood.label"
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="postal_code"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.postal_code.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="town"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.town.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="state"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.state.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormSelectInput<EditAddressFormData>
                name="customer_id"
                testId="customer_id"
                label={t("admin-panel-addresses-edit:inputs.customer.label")}
                options={customersData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormSelectInput<CreateAddressFormData>
                name="provider_id"
                helperText="Este campo es opcional"
                testId="provider_id"
                label={t("admin-panel-addresses-create:inputs.provider.label")}
                options={providersData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditAddressFormData>
                name="extra_info"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-addresses-edit:inputs.extra_info.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateAddressFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/addresses"
                >
                  {t("admin-panel-addresses-edit:actions.cancel")}
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
      <FormEditAddress />
    </>
  );
}

export default withPageRequiredAuth(EditUser);
