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
import { EmployeeFilterType } from "./employee-filter-types";

type FilterFormData = EmployeeFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-employees");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      last_name: "",
      cell_phone: "",
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
    reset({ name: "", last_name: "", cell_phone: "" });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("last_name");
    searchParams.delete("cell_phone");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterName = searchParams.get("name");
    const filterLastName = searchParams.get("last_name");
    const filterCellphone = searchParams.get("cell_phone");
    let filterParsed: EmployeeFilterType = {
      name: "",
      last_name: "",
      cell_phone: "",
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
              console.log(data);
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("name", data.name);

              searchParams.set("last_name", data.last_name);

              searchParams.set("cell_phone", data.cell_phone);

              if (!data.name) {
                searchParams.delete("name");
              }

              if (!data.last_name) {
                searchParams.delete("last_name");
              }
              if (!data.cell_phone) {
                searchParams.delete("cell_phone");
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<EmployeeFilterType>
                  name="name"
                  testId="new-user-password-confirmation"
                  label={"Nombre"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<EmployeeFilterType>
                  name="last_name"
                  testId="new-user-password-confirmation"
                  label={"Apellido"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<EmployeeFilterType>
                  name="cell_phone"
                  testId="new-user-password-confirmation"
                  label={"Celular"}
                  type="tel"
                />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-employees:filter.actions.apply")}
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
        {t("admin-panel-employees:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default UserFilter;
