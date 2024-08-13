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
  UsersResponse,
  useGetUsersService,
} from "@/services/api/services/users";
import { usePostEmployeeService } from "@/services/api/services/employees";
import FormSelectInput from "@/components/form/select/form-select";
import { useEffect, useState } from "react";

type SelectOption = {
  id: number;
  value: string;
};

type CreateEmployeeFormData = {
  name: string;
  last_name: string;
  cell_phone: string;
  tel: string;
  user_id: SelectOption;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-employee-create");

  return yup.object().shape(
    {
      name: yup
        .string()
        .required(
          t("admin-panel-employees-create:inputs.name.validation.required")
        )
        .min(
          3,
          t("admin-panel-employees-create:inputs.name.validation.invalid")
        ),
      last_name: yup
        .string()
        .required(
          t("admin-panel-employees-create:inputs.last_name.validation.required")
        )
        .min(
          3,
          t("admin-panel-employees-create:inputs.last_name.validation.invalid")
        ),
      cell_phone: yup
        .string()
        .required(
          t(
            "admin-panel-employees-create:inputs.cell_phone.validation.required"
          )
        )
        .min(
          7,
          t("admin-panel-employees-create:inputs.cell_phone.validation.invalid")
        )
        .max(
          10,
          t("admin-panel-employees-create:inputs.cell_phone.validation.invalid")
        ),
      tel: yup.string().when("tel", {
        is: (value) => value,
        then: (rule) =>
          rule.length(
            10,
            t("admin-panel-employees-create:inputs.tel.validation.invalid")
          ),
      }),
      user_id: yup
        .object()
        .shape({
          id: yup.number().defined(),
          value: yup.string().defined(),
        })
        .default(undefined)
        .required(
          t("admin-panel-employees-create:inputs.user.validation.required")
        ),
    },
    [["tel", "tel"]]
  );
};

function CreateEmployeeFormActions() {
  const { t } = useTranslation("admin-panel-employees-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-employees-create:actions.submit")}
    </Button>
  );
}

function FormCreateEmployee() {
  const fetcPostEmployee = usePostEmployeeService();
  const fetchUsers = useGetUsersService();
  const { t } = useTranslation("admin-panel-employees-create");
  const validationSchema = useValidationSchema();
  const [usersData, setUsersData] = useState<{ id: number; value: string }[]>(
    []
  );

  useEffect(() => {
    const fetchInitialUsersData = async () => {
      const { res } = await fetchUsers({
        pageSize: 100,
        page: 1,
      });

      const data = (res as UsersResponse).data.items
        .filter((user) => user.employee === null)
        .map((user) => ({
          id: user.id,
          value: user.email,
        }));

      setUsersData(data);
    };

    fetchInitialUsersData();
  }, [fetchUsers]);

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateEmployeeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      last_name: "",
      cell_phone: "",
      tel: "",
      user_id: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetcPostEmployee({
        name: formData.name,
        last_name: formData.last_name,
        tel: formData.tel,
        cell_phone: formData.cell_phone,
        user_id: formData.user_id.id,
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-employees-edit:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(t("admin-panel-employees-edit:alerts.user.success"), {
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
                {t("admin-panel-employees-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateEmployeeFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-employees-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateEmployeeFormData>
                name="last_name"
                testId="new-user-password"
                autoComplete="new-user-password"
                label={t("admin-panel-employees-create:inputs.last_name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateEmployeeFormData>
                name="tel"
                testId="new-user-password-confirmation"
                label={t("admin-panel-employees-create:inputs.tel.label")}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateEmployeeFormData>
                name="cell_phone"
                testId="new-user-password-confirmation"
                label={t(
                  "admin-panel-employees-create:inputs.cell_phone.label"
                )}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateEmployeeFormData>
                name="user_id"
                testId="user_id"
                label={t("admin-panel-employees-create:inputs.user.label")}
                options={usersData}
                keyValue="id"
                renderOption={(option: { id: number; value: string }) => {
                  return option.value;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateEmployeeFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/employees"
                >
                  {t("admin-panel-employees-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateEmployee() {
  return <FormCreateEmployee />;
}

export default withPageRequiredAuth(CreateEmployee);
