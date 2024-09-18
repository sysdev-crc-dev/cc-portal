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
import { useEffect, useMemo, useState } from "react";
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
  fiscal_regimen: SelectOption;
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
      fiscal_regimen: yup
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
  const fiscalRegimenOptions: SelectOption[] = useMemo(
    () => [
      {
        id: 605,
        name: "Sueldos y Salarios e Ingresos Asimilados a Salarios",
      },
      {
        id: 606,
        name: "Arrendamiento",
      },
      {
        id: 607,
        name: "Regimen de Enajenacion o Adquisicion de Bienes",
      },
      {
        id: 608,
        name: "Demás ingreso",
      },
      {
        id: 610,
        name: "Residentes en el Extranjero sin Establecimiento Permanente en México",
      },
      {
        id: 610,
        name: "Residentes en el Extranjero sin Establecimiento Permanente en México",
      },
      {
        id: 611,
        name: "Ingresos por Dividendos (socios y accionistas)",
      },
      {
        id: 612,
        name: "Personas Físicas con Actividades Empresariales y Profesionales",
      },
      {
        id: 614,
        name: "Ingresos por intereses",
      },
      {
        id: 615,
        name: "Régimen de los ingresos por obtención de premios",
      },
      {
        id: 616,
        name: "Sin obligaciones fiscales",
      },
      {
        id: 621,
        name: "Incorporación Fiscal",
      },
      {
        id: 625,
        name: "Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas",
      },
      {
        id: 626,
        name: "Régimen Simplificado de Confiaza",
      },
    ],
    []
  );
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
      email: "",
      customer_id: undefined,
      fiscal_regimen: undefined,
      invoice_use: "",
      postal_code: "",
      rfc: "",
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
        fiscal_regimen: formData.fiscal_regimen.id.toString(),
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
          fiscal_regimen:
            fiscalRegimenOptions[
              fiscalRegimenOptions.findIndex(
                (opt) => opt.id === res.data.customer_id
              )
            ],
        });
      }
    };

    getInitialDataForEdit();
  }, [invoiceId, reset, fetchGetInvoice, customersData, fiscalRegimenOptions]);

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
              <FormSelectInput<EditInvoiceFormData, SelectOption>
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
              <FormSelectInput<EditInvoiceFormData, SelectOption>
                name="fiscal_regimen"
                testId="fiscal_regimen"
                label={t(
                  "admin-panel-invoices-edit:inputs.fiscal_regimen.label"
                )}
                options={fiscalRegimenOptions}
                keyValue="id"
                renderOption={(option: SelectOption) => {
                  return `${option.id} - ${option.name}`;
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
