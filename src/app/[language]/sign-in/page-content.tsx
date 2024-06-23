"use client";
import Button from "@mui/material/Button";
import LinkItem from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import withPageRequiredGuest from "@/services/auth/with-page-required-guest";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import { useAuthLoginService } from "@/services/api/services/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "@/components/link";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";

type SignInFormData = {
  email: string;
  password: string;
};

const useValidationSchema = () => {
  const { t } = useTranslation("sign-in");

  return yup.object().shape({
    email: yup
      .string()
      .email(t("sign-in:inputs.email.validation.invalid"))
      .required(t("sign-in:inputs.email.validation.required")),
    password: yup
      .string()
      .min(6, t("sign-in:inputs.password.validation.min"))
      .required(t("sign-in:inputs.password.validation.required")),
  });
};

function FormActions() {
  const { t } = useTranslation("sign-in");
  const { isSubmitting } = useFormState();

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
      data-testid="sign-in-submit"
    >
      {t("sign-in:actions.submit")}
    </Button>
  );
}

function FormError() {
  const { errors } = useFormState();

  return (
    <Grid item xs={12}>
      {errors.root && (
        <Alert severity="error">
          Usuario invalido. <br /> Verifique sus credenciales o intentelo mas
          tarde
        </Alert>
      )}
    </Grid>
  );
}

function Form() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const fetchAuthLogin = useAuthLoginService();
  const { t } = useTranslation("sign-in");
  //const router = useRouter();
  const validationSchema = useValidationSchema();
  const methods = useForm<SignInFormData>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit, setError } = methods;

  const onSubmit = handleSubmit(async (formData) => {
    const { res, status } = await fetchAuthLogin(formData);
    if (
      status === HTTP_CODES_ENUM.BAD_REQUEST ||
      status === HTTP_CODES_ENUM.INTERNAL_SERVER_ERROR
    ) {
      setError("root.serverError", { type: "400" });

      return;
    }

    if (status === HTTP_CODES_ENUM.OK) {
      setTokensInfo({
        token: res.data.token,
        refreshToken: res.data.refreshToken,
        tokenExpires: res.data.refreshToken?.expiry_date,
      });
      setUser(res.data.user);
    }
  });

  return (
    <FormProvider {...methods}>
      <Container maxWidth="xs">
        <form onSubmit={onSubmit}>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} mt={3}>
              <Typography variant="h6">{t("sign-in:title")}</Typography>
            </Grid>
            <FormError />
            <Grid item xs={12}>
              <FormTextInput<SignInFormData>
                name="email"
                label={t("sign-in:inputs.email.label")}
                type="email"
                testId="email"
                autoFocus
              />
            </Grid>

            <Grid item xs={12}>
              <FormTextInput<SignInFormData>
                name="password"
                label={t("sign-in:inputs.password.label")}
                type="password"
                testId="password"
              />
            </Grid>
            <Grid item xs={12}>
              <LinkItem
                component={Link}
                href="/forgot-password"
                data-testid="forgot-password"
              >
                {t("sign-in:actions.forgotPassword")}
              </LinkItem>
            </Grid>

            <Grid item xs={12}>
              <FormActions />
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function SignIn() {
  return <Form />;
}

export default withPageRequiredGuest(SignIn);
