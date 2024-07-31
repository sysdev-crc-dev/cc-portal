"use client";

import FormTextInput from "@/components/form/text-input/form-text-input";
import { useTranslation } from "@/services/i18n/client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Popover from "@mui/material/Popover";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { CustomerFilterType } from "./customer-filter-types";

type FilterFormData = CustomerFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-customers");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      last_name: "",
      cell_phone: "",
      email: "",
    },
  });

  const { handleSubmit, reset } = methods;

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "user-filter-popover" : undefined;

  const handleReset = () => {
    reset({ name: "", last_name: "", cell_phone: "", email: "" });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("last_name");
    searchParams.delete("cell_phone");
    searchParams.delete("email");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterName = searchParams.get("name");
    const filterLastName = searchParams.get("last_name");
    const filterCellphone = searchParams.get("cell_phone");
    const filterEmail = searchParams.get("email");
    let filterParsed: CustomerFilterType = {
      name: "",
      last_name: "",
      cell_phone: "",
      email: "",
    };
    if (filterName) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        name: filterName,
      };

      reset(filterParsed);
    }

    if (filterLastName) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        last_name: filterLastName,
      };

      reset(filterParsed);
    }

    if (filterCellphone) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        cell_phone: filterCellphone,
      };

      reset(filterParsed);
    }

    if (filterEmail) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        cell_phone: filterEmail,
      };

      reset(filterParsed);
    }
  }, [searchParams, reset]);

  return (
    <FormProvider {...methods}>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Container
          sx={{
            minWidth: 300,
            maxWidth: 300,
            width: 300,
          }}
        >
          <form
            onSubmit={handleSubmit((data) => {
              const searchParams = new URLSearchParams(window.location.search);
              if (data.name) {
                const roleFilter = data.name;
                searchParams.set("name", roleFilter);
              }

              if (data.last_name) {
                const roleFilter = data.last_name;
                searchParams.set("last_name", roleFilter);
              }

              if (data.cell_phone) {
                const roleFilter = data.cell_phone;
                searchParams.set("cell_phone", roleFilter);
              }

              if (data.email) {
                const roleFilter = data.email;
                searchParams.set("email", roleFilter);
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<CustomerFilterType>
                  name="name"
                  testId="new-user-password-confirmation"
                  label={"Nombre"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<CustomerFilterType>
                  name="last_name"
                  testId="new-user-password-confirmation"
                  label={"Apellido"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<CustomerFilterType>
                  name="cell_phone"
                  testId="new-user-password-confirmation"
                  label={"Celular"}
                  type="tel"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<CustomerFilterType>
                  name="email"
                  testId="new-user-password-confirmation"
                  label={"Email"}
                  type="email"
                />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-customers:filter.actions.apply")}
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button variant="contained" type="button" onClick={handleReset}>
                  Reset
                </Button>
              </Grid>
            </Grid>
          </form>
        </Container>
      </Popover>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        {t("admin-panel-customers:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default UserFilter;
