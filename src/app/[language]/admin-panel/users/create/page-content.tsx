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
import { usePostUserService } from "@/services/api/services/users";
import { RoleEnum } from "@/services/api/types/role";
import FormSelectInput from "@/components/form/select/form-select";

type SelectOption = {
  id: RoleEnum;
  name: string;
};

type CreateUserFormData = {
  email: string;
  password: string;
  passwordConfirmation: string;
  role: SelectOption;
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-users-create");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("admin-panel-users-create:inputs.email.validation.invalid"))
      .required(
        t("admin-panel-users-create:inputs.firstName.validation.required")
      ),
    password: yup
      .string()
      .min(6, t("admin-panel-users-create:inputs.password.validation.min"))
      .required(
        t("admin-panel-users-create:inputs.password.validation.required")
      ),
    passwordConfirmation: yup
      .string()
      .oneOf(
        [yup.ref("password")],
        t(
          "admin-panel-users-create:inputs.passwordConfirmation.validation.match"
        )
      )
      .required(
        t(
          "admin-panel-users-create:inputs.passwordConfirmation.validation.required"
        )
      ),
    role: yup.object().required(),
  });
};

function CreateUserFormActions() {
  const { t } = useTranslation("admin-panel-users-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-users-create:actions.submit")}
    </Button>
  );
}

function FormCreateUser() {
  const fetchPostUser = usePostUserService();
  const { t } = useTranslation("admin-panel-users-create");
  const validationSchema = useValidationSchema();

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateUserFormData>({
    // @ts-expect-error ts(2322)
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirmation: "",
      role: undefined,
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { status } = await fetchPostUser({
      email: formData.email,
      password: formData.password,
      role: formData.role.id,
    });

    if (status !== HTTP_CODES_ENUM.CREATED) {
      setError("root.serverError", { type: "400" });
      enqueueSnackbar(t("admin-panel-users-edit:alerts.server.error"), {
        variant: "error",
      });
      return;
    }

    if (status === HTTP_CODES_ENUM.CREATED) {
      reset();
      enqueueSnackbar(t("admin-panel-users-edit:alerts.user.success"), {
        variant: "success",
      });

      return;
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit} autoComplete="create-new-user">
          <Grid container spacing={2} mb={3} mt={3}>
            <Grid item xs={12}>
              <Typography variant="h6">
                {t("admin-panel-users-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateUserFormData>
                name="email"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-users-create:inputs.email.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateUserFormData>
                name="password"
                type="password"
                testId="new-user-password"
                autoComplete="new-user-password"
                label={t("admin-panel-users-create:inputs.password.label")}
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<CreateUserFormData>
                name="passwordConfirmation"
                testId="new-user-password-confirmation"
                label={t(
                  "admin-panel-users-create:inputs.passwordConfirmation.label"
                )}
                type="password"
              />
            </Grid>

            <Grid item xs={12}>
              <FormSelectInput<CreateUserFormData, SelectOption>
                name="role"
                testId="role"
                label={t("admin-panel-users-create:inputs.role.label")}
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
                renderOption={(option) => option.name}
              />
            </Grid>

            <Grid item xs={12}>
              <CreateUserFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/users"
                >
                  {t("admin-panel-users-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateUser() {
  return <FormCreateUser />;
}

export default withPageRequiredAuth(CreateUser);
