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
import { ProjectFilterType } from "./project-filter-types";
import { ProjectStatus } from "../../../../services/api/types/project";

type FilterFormData = ProjectFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-employees");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      customer_id: "",
      status: "",
      estimated_delivery_date: "",
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
    reset({
      name: "",
      customer_id: "",
      status: "",
      estimated_delivery_date: "",
    });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("last_name");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterName = searchParams.get("name");
    const filterCustomerId = searchParams.get("customer_id");
    const filterStatus = searchParams.get("status");
    const filterDeliveryDate = searchParams.get("estimated_delivery_date");
    let filterParsed: ProjectFilterType = {
      name: "",
      customer_id: "",
      status: "",
      estimated_delivery_date: "",
    };
    if (filterName) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        name: filterName,
      };

      reset(filterParsed);
    }

    if (filterCustomerId) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        customer_id: filterCustomerId,
      };

      reset(filterParsed);
    }

    if (filterDeliveryDate) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        estimated_delivery_date: filterDeliveryDate,
      };

      reset(filterParsed);
    }
    if (filterStatus) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        status: filterStatus as ProjectStatus,
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

              if (data.status) {
                const roleFilter = data.status;
                searchParams.set("status", roleFilter);
              }
              if (data.customer_id) {
                const roleFilter = data.customer_id;
                searchParams.set("type", roleFilter);
              }
              if (data.estimated_delivery_date) {
                const roleFilter = data.estimated_delivery_date;
                searchParams.set("estimated_delivery_date", roleFilter);
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<ProjectFilterType>
                  name="name"
                  testId="new-user-password-confirmation"
                  label={"Nombre"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<ProjectFilterType>
                  name="customer_id"
                  testId="new-user-password-confirmation"
                  label={"Cliente ID"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<ProjectFilterType>
                  name="status"
                  testId="new-user-password-confirmation"
                  label={"Estatus"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<ProjectFilterType>
                  name="estimated_delivery_date"
                  testId="new-user-password-confirmation"
                  label={"Fech. est. entrega"}
                  type="text"
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
