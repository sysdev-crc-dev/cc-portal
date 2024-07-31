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
  CompaniesResponse,
  useGetCompaniesService,
} from "@/services/api/services/companies";
import { usePostCustomerService } from "@/services/api/services/customers";
import FormSelectInput from "@/components/form/select/form-select";
import { useEffect, useState } from "react";
import { PreferredFormOfPayment } from "../../../../../services/api/types/customer";

type SelectOption = {
  id: number | null;
  name: string;
};

type SelectOptionEnum = {
  value: PreferredFormOfPayment;
  display: string;
};

type CreateCustomerFormData = {
  name: string;
  last_name: string;
  cell_phone: string;
  tel: string;
  email: string;
  preferred_form_of_payment: SelectOptionEnum;
  company_id: SelectOption;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-customers-create");

  return yup.object().shape(
    {
      name: yup
        .string()
        .required(
          t("admin-panel-customers-create:inputs.name.validation.required")
        )
        .min(
          3,
          t("admin-panel-customers-create:inputs.name.validation.invalid")
        ),
      last_name: yup
        .string()
        .required(
          t("admin-panel-customers-create:inputs.last_name.validation.required")
        )
        .min(
          3,
          t("admin-panel-customers-create:inputs.last_name.validation.invalid")
        ),
      cell_phone: yup
        .string()
        .required(
          t(
            "admin-panel-customers-create:inputs.cell_phone.validation.required"
          )
        )
        .min(
          7,
          t("admin-panel-customers-create:inputs.cell_phone.validation.invalid")
        )
        .max(
          10,
          t("admin-panel-customers-create:inputs.cell_phone.validation.invalid")
        ),
      tel: yup.string().when("tel", {
        is: (value) => value,
        then: (rule) =>
          rule.length(
            10,
            t("admin-panel-customers-create:inputs.tel.validation.invalid")
          ),
      }),
      email: yup
        .string()
        .email(
          t("admin-panel-customers-create:inputs.email.validation.invalid")
        )
        .required(
          t("admin-panel-customers-create:inputs.email.validation.required")
        ),
      preferred_form_of_payment: yup
        .object()
        .shape({
          value: yup.string().required(),
          display: yup.string().required(),
        })
        .required(
          t(
            "admin-panel-customers-create:inputs.preferred_form_of_payment.validation.required"
          )
        ),
      company: yup
        .object()
        .shape({
          id: yup.number().defined(),
          name: yup.string().defined(),
        })
        .default(undefined),
    },
    [["tel", "tel"]]
  );
};

function CreateCustomerFormActions() {
  const { t } = useTranslation("admin-panel-customers-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-customers-create:actions.submit")}
    </Button>
  );
}

function FormCreateCustomer() {
  const fetcPostCustomer = usePostCustomerService();
  const fetchCompanies = useGetCompaniesService();
  const { t } = useTranslation("admin-panel-customers-create");
  const validationSchema = useValidationSchema();
  const [companiesData, setCompaniesData] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    const fetchInitialUsersData = async () => {
      const { res } = await fetchCompanies({
        limit: 100,
        page: 1,
      });

      const data = (res as CompaniesResponse).data.map((company) => ({
        id: company.id,
        name: company.name,
      }));

      setCompaniesData(data);
    };

    fetchInitialUsersData();
  }, [fetchCompanies]);

  const formOfPaymentsOptions: SelectOptionEnum[] = [
    {
      value: PreferredFormOfPayment.Cash,
      display: t(
        `admin-panel-customers-create:preferred_form_of_payment.${PreferredFormOfPayment.Cash}`
      ),
    },
    {
      value: PreferredFormOfPayment.BankTransfer,
      display: t(
        `admin-panel-customers-create:preferred_form_of_payment.${PreferredFormOfPayment.BankTransfer}`
      ),
    },
    {
      value: PreferredFormOfPayment.CreditCar,
      display: t(
        `admin-panel-customers-create:preferred_form_of_payment.${PreferredFormOfPayment.CreditCar}`
      ),
    },
    {
      value: PreferredFormOfPayment.PaymentLink,
      display: t(
        `admin-panel-customers-create:preferred_form_of_payment.${PreferredFormOfPayment.PaymentLink}`
      ),
    },
    {
      value: PreferredFormOfPayment.InHouseCredit,
      display: t(
        `admin-panel-customers-create:preferred_form_of_payment.${PreferredFormOfPayment.InHouseCredit}`
      ),
    },
  ];
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateCustomerFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      last_name: "",
      cell_phone: "",
      tel: "",
      email: "",
      preferred_form_of_payment: formOfPaymentsOptions[0],
      company_id: { id: null, name: "" },
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetcPostCustomer({
        name: formData.name,
        last_name: formData.last_name,
        tel: formData.tel,
        cell_phone: formData.cell_phone,
        email: formData.email,
        preferred_form_of_payment: formData.preferred_form_of_payment.value,
        company_id: formData.company_id.id as number,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-customers-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-customers-create:alerts.customer.success"),
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
                {t("admin-panel-customers-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCustomerFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-customers-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCustomerFormData>
                name="last_name"
                testId="new-user-password"
                autoComplete="new-user-password"
                label={t("admin-panel-customers-create:inputs.last_name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCustomerFormData>
                name="email"
                testId="new-user-password-confirmation"
                label={t("admin-panel-customers-create:inputs.email.label")}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCustomerFormData>
                name="tel"
                testId="new-user-password-confirmation"
                label={t("admin-panel-customers-create:inputs.tel.label")}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateCustomerFormData>
                name="cell_phone"
                testId="new-user-password-confirmation"
                label={t(
                  "admin-panel-customers-create:inputs.cell_phone.label"
                )}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateCustomerFormData>
                name="preferred_form_of_payment"
                testId="preferred_form_of_payment"
                label={t(
                  "admin-panel-customers-create:inputs.preferred_form_of_payment.label"
                )}
                options={formOfPaymentsOptions}
                keyValue="value"
                renderOption={(option: SelectOptionEnum) => {
                  return option.display;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateCustomerFormData>
                name="company_id"
                testId="company_id"
                label={t("admin-panel-customers-create:inputs.company.label")}
                options={companiesData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateCustomerFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/customers"
                >
                  {t("admin-panel-customers-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateCustomer() {
  return <FormCreateCustomer />;
}

export default withPageRequiredAuth(CreateCustomer);
