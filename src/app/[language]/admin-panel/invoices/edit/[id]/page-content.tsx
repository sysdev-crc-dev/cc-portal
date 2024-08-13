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
  useEditInvoiceService,
  useGetInvoiceService,
} from "@/services/api/services/invoices";
import { useParams } from "next/navigation";
import {
  CustomersResponse,
  useGetCustomersService,
} from "../../../../../../services/api/services/customers";
import FormSelectInput from "../../../../../../components/form/select/form-select";

type SelectOption = {
  id: number;
  name: string;
};

type EditInvoiceFormData = {
  name: string;
  rfc: string;
  postal_code: string;
  email: string;
  invoice_use: string;
  customer_id: SelectOption;
};

const useValidationEditInvoiceSchema = () => {
  const { t } = useTranslation("admin-panel-invoices-edit");

  return yup.object().shape(
    {
      name: yup
        .string()
        .required(
          t("admin-panel-invoices-edit:inputs.name.validation.required")
        )
        .min(3, t("admin-panel-invoices-edit:inputs.name.validation.invalid")),
      rfc: yup
        .string()
        .required(t("admin-panel-invoices-edit:inputs.rfc.validation.required"))
        .min(10, t("admin-panel-invoices-edit:inputs.rfc.validation.invalid")),
      email: yup
        .string()
        .email(t("admin-panel-invoices-edit:inputs.email.validation.invalid"))
        .required(
          t("admin-panel-invoices-edit:inputs.email.validation.required")
        ),
      postal_code: yup
        .string()
        .length(
          5,
          t("admin-panel-invoices-edit:inputs.postal_code.validation.invalid")
        )
        .required(
          t("admin-panel-invoices-edit:inputs.postal_code.validation.required")
        ),
      invoice_use: yup
        .string()
        .required(
          t("admin-panel-invoices-edit:inputs.invoice_use.validation.required")
        ),
      customer_id: yup
        .object()
        .shape({
          id: yup.number().defined(),
          name: yup.string().defined(),
        })
        .default(undefined)
        .required(
          t("admin-panel-invoices-edit:inputs.customer.validation.required")
        ),
    },
    [["tel", "tel"]]
  );
};

function EditInvoiceFormActions() {
  const { t } = useTranslation("admin-panel-invoices-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-invoices-edit:actions.submit")}
    </Button>
  );
}

function FormEditInvoice() {
  const params = useParams();
  const fetchGetInvoice = useGetInvoiceService();
  const fetchEditInvoice = useEditInvoiceService();
  const fetchCustomers = useGetCustomersService();
  const [customersData, setCustomersData] = useState<SelectOption[]>([]);
  const { t } = useTranslation("admin-panel-invoices-edit");
  const validationSchema = useValidationEditInvoiceSchema();
  const invoiceId = Number(Array.isArray(params.id) ? params.id[0] : params.id);

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

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditInvoiceFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      type: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditInvoice({
      id: invoiceId,
      data: {
        name: formData.name,
        rfc: formData.rfc,
        postal_code: formData.postal_code,
        invoice_use: formData.invoice_use,
        email: formData.email,
        customer_id: formData.customer_id.id,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-invoices-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-invoices-edit:alerts.invoice.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetInvoice({ id: invoiceId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          rfc: res.data.rfc,
          postal_code: res.data.postal_code,
          invoice_use: res.data.invoice_use,
          email: res.data.email,
          customer_id:
            customersData[
              customersData.findIndex((opt) => opt.id === res.data.customer_id)
            ],
        });
      }
    };

    getInitialDataForEdit();
  }, [invoiceId, reset, fetchGetInvoice, customersData]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="create-new-user">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-invoices-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditInvoiceFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditInvoiceFormData>
                name="rfc"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-edit:inputs.rfc.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditInvoiceFormData>
                name="email"
                type="email"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-edit:inputs.email.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditInvoiceFormData>
                name="invoice_use"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-edit:inputs.invoice_use.label")}
              />
            </Grid>
            <Grid item xs={12}>
              <FormTextInput<EditInvoiceFormData>
                name="postal_code"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-invoices-edit:inputs.postal_code.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<EditInvoiceFormData>
                name="customer_id"
                testId="customer_id"
                label={t("admin-panel-invoices-edit:inputs.customer.label")}
                options={customersData}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <EditInvoiceFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/invoices"
                >
                  {t("admin-panel-invoices-edit:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function EditInvoice() {
  return (
    <>
      <FormEditInvoice />
    </>
  );
}

export default withPageRequiredAuth(EditInvoice);
