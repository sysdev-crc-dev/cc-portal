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
import { usePostInvoiceService } from "@/services/api/services/invoices";
import { useEffect, useState } from "react";
import {
  CustomersResponse,
  useGetCustomersService,
} from "../../../../../services/api/services/customers";
import FormSelectInput from "../../../../../components/form/select/form-select";

type SelectOption = {
  id: number;
  name: string;
};

type CreateInvoiceFormData = {
  name: string;
  rfc: string;
  postal_code: string;
  email: string;
  invoice_use: string;
  customer_id: SelectOption;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-invoice-create");

  return yup.object().shape(
    {
      name: yup
        .string()
        .required(
          t("admin-panel-invoices-create:inputs.name.validation.required")
        )
        .min(
          3,
          t("admin-panel-invoices-create:inputs.name.validation.invalid")
        ),
      rfc: yup
        .string()
        .required(
          t("admin-panel-invoices-create:inputs.rfc.validation.required")
        )
        .min(
          10,
          t("admin-panel-invoices-create:inputs.rfc.validation.invalid")
        ),
      email: yup
        .string()
        .email(t("admin-panel-invoices-create:inputs.email.validation.invalid"))
        .required(
          t("admin-panel-invoices-create:inputs.email.validation.required")
        ),
      postal_code: yup
        .string()
        .length(
          5,
          t("admin-panel-invoices-create:inputs.postal_code.validation.invalid")
        )
        .required(
          t(
            "admin-panel-invoices-create:inputs.postal_code.validation.required"
          )
        ),
      invoice_use: yup
        .string()
        .required(
          t(
            "admin-panel-invoices-create:inputs.invoice_use.validation.required"
          )
        ),
      customer_id: yup
        .object()
        .shape({
          id: yup.number().defined(),
          name: yup.string().defined(),
        })
        .default(undefined)
        .required(
          t("admin-panel-invoices-create:inputs.customer.validation.required")
        ),
    },
    [["tel", "tel"]]
  );
};

function CreateInvoiceFormActions() {
  const { t } = useTranslation("admin-panel-invoices-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-invoices-create:actions.submit")}
    </Button>
  );
}

function FormCreateInvoice() {
  const fetchPostInvoice = usePostInvoiceService();
  const fetchCustomers = useGetCustomersService();
  const [customersData, setCustomersData] = useState<SelectOption[]>([]);
  const { t } = useTranslation("admin-panel-invoices-create");
  const validationSchema = useValidationSchema();

  useEffect(() => {
    const fetchCustomersInfo = async () => {
      const { res } = await fetchCustomers({
        page: 1,
        limit: 100,
      });

      const data: SelectOption[] = (res as CustomersResponse).data.map(
        (value) => ({
          id: value.id,
          name: `${value.id} - ${value.name} ${value.last_name}`,
        })
      );

      setCustomersData(data);
    };

    fetchCustomersInfo();
  }, [fetchCustomers]);

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateInvoiceFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      rfc: "",
      email: "",
      postal_code: "",
      invoice_use: "",
      customer_id: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostInvoice({
        name: formData.name,
        rfc: formData.rfc,
        email: formData.email,
        postal_code: formData.postal_code,
        invoice_use: formData.invoice_use,
        customer_id: formData.customer_id.id,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-invoices-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-invoices-create:alerts.invoice.success"),
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
                {t("admin-panel-invoices-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateInvoiceFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateInvoiceFormData>
                name="rfc"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-create:inputs.rfc.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<CreateInvoiceFormData>
                name="email"
                type="email"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-create:inputs.email.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<CreateInvoiceFormData>
                name="invoice_use"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t(
                  "admin-panel-invoices-create:inputs.invoice_use.label"
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<CreateInvoiceFormData>
                name="postal_code"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t(
                  "admin-panel-invoices-create:inputs.postal_code.label"
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateInvoiceFormData>
                name="customer_id"
                testId="customer_id"
                label={t("admin-panel-invoices-create:inputs.customer.label")}
                options={customersData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateInvoiceFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/invoices"
                >
                  {t("admin-panel-invoices-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateInvoice() {
  return <FormCreateInvoice />;
}

export default withPageRequiredAuth(CreateInvoice);
