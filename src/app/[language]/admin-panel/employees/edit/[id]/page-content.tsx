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
  useEditEmployeeService,
  useGetEmployeeService,
} from "@/services/api/services/employees";
import { useParams } from "next/navigation";
import FormSelectInput from "../../../../../../components/form/select/form-select";
import {
  UsersResponse,
  useGetUsersService,
} from "../../../../../../services/api/services/users";

type EditEmployeeFormData = {
  name: string;
  last_name: string;
  cell_phone: string;
  tel: string;
  user_id: number;
  user: { id: number; value: string };
};

const useValidationEditUserSchema = () => {
  const { t } = useTranslation("admin-panel-employees-edit");

  return yup.object().shape(
    {
      name: yup
        .string()
        .required(
          t("admin-panel-employees-edit:inputs.name.validation.required")
        )
        .min(3, t("admin-panel-employees-edit:inputs.name.validation.invalid")),
      last_name: yup
        .string()
        .required(
          t("admin-panel-employees-edit:inputs.last_name.validation.required")
        )
        .min(
          3,
          t("admin-panel-employees-edit:inputs.last_name.validation.invalid")
        ),
      cell_phone: yup
        .string()
        .required(
          t("admin-panel-employees-edit:inputs.cell_phone.validation.required")
        )
        .min(
          7,
          t("admin-panel-employees-edit:inputs.cell_phone.validation.invalid")
        )
        .max(
          10,
          t("admin-panel-employees-edit:inputs.cell_phone.validation.invalid")
        ),
      tel: yup.string().when("tel", {
        is: (value) => value,
        then: (rule) =>
          rule.length(
            10,
            t("admin-panel-employees-edit:inputs.tel.validation.invalid")
          ),
      }),
    },
    [["tel", "tel"]]
  );
};

function EditUserFormActions() {
  const { t } = useTranslation("admin-panel-employees-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-employees-edit:actions.submit")}
    </Button>
  );
}

function FormEditUser() {
  const params = useParams();
  const fetchGetEmployee = useGetEmployeeService();
  const fetchEditEmployee = useEditEmployeeService();
  const fetchUsers = useGetUsersService();
  const { t } = useTranslation("admin-panel-employees-edit");
  const validationSchema = useValidationEditUserSchema();
  const employeeId = Number(
    Array.isArray(params.id) ? params.id[0] : params.id
  );
  const { enqueueSnackbar } = useSnackbar();
  const [usersData, setUsersData] = useState<{ id: number; value: string }[]>(
    []
  );

  const methods = useForm<EditEmployeeFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      last_name: "",
      cell_phone: "",
      tel: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditEmployee({
      id: employeeId,
      data: {
        name: formData.name,
        last_name: formData.last_name,
        tel: formData.tel,
        cell_phone: formData.cell_phone,
        user_id: formData.user.id,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-employees-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-employees-edit:alerts.employee.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetEmployee({ id: employeeId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          name: res.data.name,
          last_name: res.data.last_name,
          cell_phone: res.data.cell_phone,
          tel: res.data.tel ? res.data.tel : "",
          user: {
            id: res.data.user?.id,
            value: res.data.user?.email,
          },
        });
      }
    };

    getInitialDataForEdit();
  }, [employeeId, reset, fetchGetEmployee]);

  useEffect(() => {
    const getUserData = async () => {
      const { res } = await fetchUsers({ limit: 100, page: 1 });

      const data = (res as UsersResponse).data.map((user) => ({
        id: user.id,
        value: user.email,
      }));

      setUsersData(data);
    };

    getUserData();
  }, [fetchUsers]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-employees-edit:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditEmployeeFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-employees-edit:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditEmployeeFormData>
                name="last_name"
                testId="new-user-password"
                autoComplete="new-user-password"
                label={t("admin-panel-employees-edit:inputs.last_name.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditEmployeeFormData>
                name="tel"
                testId="new-user-password-confirmation"
                label={t("admin-panel-employees-edit:inputs.tel.label")}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditEmployeeFormData>
                name="cell_phone"
                testId="new-user-password-confirmation"
                label={t("admin-panel-employees-edit:inputs.cell_phone.label")}
                type="tel"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<EditEmployeeFormData>
                name="user"
                testId="role"
                label={t("admin-panel-employees-edit:inputs.user.label")}
                options={usersData}
                keyValue="id"
                renderOption={(option: { id: number; value: string }) => {
                  return option.value;
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <EditUserFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/employees"
                >
                  {t("admin-panel-employees-edit:actions.cancel")}
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
      <FormEditUser />
    </>
  );
}

export default withPageRequiredAuth(EditUser);
