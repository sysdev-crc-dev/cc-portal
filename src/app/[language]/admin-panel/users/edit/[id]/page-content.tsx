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
  useEditUserService,
  useGetUserService,
  usePatchUserService,
} from "@/services/api/services/users";
import { useParams } from "next/navigation";
import { RoleEnum } from "@/services/api/types/role";
import FormSelectInput from "@/components/form/select/form-select";

type SelectOption = {
  id: RoleEnum;
  name: string;
};

type EditUserFormData = {
  email: string;
  role: SelectOption;
};

type ChangeUserPasswordFormData = {
  password: string;
  passwordConfirmation: string;
};

const useValidationEditUserSchema = () => {
  const { t } = useTranslation("admin-panel-users-edit");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("admin-panel-users-edit:inputs.email.validation.invalid"))
      .required(t("admin-panel-users-edit:inputs.email.validation.required")),
  });
};

const useValidationChangePasswordSchema = () => {
  const { t } = useTranslation("admin-panel-users-edit");

  return yup.object().shape({
    password: yup
      .string()
      .min(3, t("admin-panel-users-edit:inputs.password.validation.min"))
      .required(
        t("admin-panel-users-edit:inputs.password.validation.required")
      ),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t("admin-panel-users-edit:inputs.passwordConfirmation.validation.match")
      )
      .required(
        t(
          "admin-panel-users-edit:inputs.passwordConfirmation.validation.required"
        )
      ),
  });
};

function EditUserFormActions() {
  const { t } = useTranslation("admin-panel-users-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-users-edit:actions.submit")}
    </Button>
  );
}

function ChangePasswordUserFormActions() {
  const { t } = useTranslation("admin-panel-users-edit");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-users-edit:actions.submit")}
    </Button>
  );
}

function FormEditUser() {
  const params = useParams();
  const fetchGetUser = useGetUserService();
  const fetchEditUser = useEditUserService();
  const { t } = useTranslation("admin-panel-users-edit");
  const validationSchema = useValidationEditUserSchema();
  const userId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<EditUserFormData>({
    // @ts-expect-error ts(2322)
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      role: {
        id: RoleEnum.Operator,
        name: "Operador",
      },
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchEditUser({
      id: userId,
      data: {
        email: formData.email,
        role: formData.role.id,
      },
    });
    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-users-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }
    if (status === HTTP_CODES_ENUM.OK) {
      reset(formData);
      enqueueSnackbar(t("admin-panel-users-edit:alerts.user.success"), {
        variant: "success",
      });

      return;
    }
  });

  useEffect(() => {
    const getInitialDataForEdit = async () => {
      const { status, res } = await fetchGetUser({ id: userId });
      if (status === HTTP_CODES_ENUM.OK) {
        reset({
          email: res.data.email,
          role: {
            id: res.data.role,
            name: res.data.role,
          },
        });
      }
    };

    getInitialDataForEdit();
  }, [userId, reset, fetchGetUser]);

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-users-edit:title1")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<EditUserFormData>
                name="email"
                testId="email"
                label={t("admin-panel-users-edit:inputs.email.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<EditUserFormData, SelectOption>
                name="role"
                testId="role"
                label={t("admin-panel-users-edit:inputs.role.label")}
                options={[
                  {
                    id: RoleEnum.Admin,
                    name: "Admin",
                  },
                  {
                    id: RoleEnum.Staff,
                    name: "Encargado",
                  },
                  {
                    id: RoleEnum.Operator,
                    name: "Operador",
                  },
                ]}
                keyValue="id"
                renderOption={(option) => {
                  return option.name;
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
                  href="/admin-panel/users"
                >
                  {t("admin-panel-users-edit:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function FormChangePasswordUser() {
  const params = useParams();
  const fetchPatchUser = usePatchUserService();
  const { t } = useTranslation("admin-panel-users-edit");
  const validationSchema = useValidationChangePasswordSchema();
  const userId = Number(Array.isArray(params.id) ? params.id[0] : params.id);
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<ChangeUserPasswordFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      password: "",
      passwordConfirmation: "",
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchPatchUser({
      id: userId,
      data: {
        password: formData.password,
      },
    });

    if (status !== HTTP_CODES_ENUM.OK) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-users-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      reset();
      enqueueSnackbar(t("admin-panel-users-edit:alerts.password.success"), {
        variant: "success",
      });
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-users-edit:title2")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<ChangeUserPasswordFormData>
                name="password"
                type="password"
                label={t("admin-panel-users-edit:inputs.password.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<ChangeUserPasswordFormData>
                name="passwordConfirmation"
                label={t(
                  "admin-panel-users-edit:inputs.passwordConfirmation.label"
                )}
                type="password"
              />
            </Grid>

            <Grid item xs={12}>
              <ChangePasswordUserFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/users"
                >
                  {t("admin-panel-users-edit:actions.cancel")}
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
      <FormChangePasswordUser />
    </>
  );
}

export default withPageRequiredAuth(EditUser);
