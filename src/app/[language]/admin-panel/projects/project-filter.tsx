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
import FormSelectInput from "../../../../components/form/select/form-select";
import { formatISO, parseISO } from "date-fns";
import FormDateTimePickerInput from "../../../../components/form/date-pickers/date-time-picker";

type FilterFormData = Pick<
  ProjectFilterType,
  "customer_id" | "estimated_delivery_date" | "name"
> & { status: SelectOption<ProjectStatus> };

type SelectOption<T> = {
  id: T | "";
  name: string;
};

function UserFilter() {
  const { t } = useTranslation("admin-panel-projects");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      customer_id: "",
      status: undefined,
      estimated_delivery_date: null,
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
      status: undefined,
      estimated_delivery_date: null,
    });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("customer_id");
    searchParams.delete("status");
    searchParams.delete("estimated_delivery_date");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterName = searchParams.get("name");
    const filterCustomerId = searchParams.get("customer_id");
    const filterStatus = searchParams.get("status");
    const filterDeliveryDate = searchParams.get("estimated_delivery_date");
    let filterParsed: FilterFormData = {
      name: "",
      customer_id: "",
      status: {
        id: "",
        name: "",
      },
      estimated_delivery_date: null,
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
        estimated_delivery_date: parseISO(filterDeliveryDate),
      };

      reset(filterParsed);
    }
    if (filterStatus) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        status: {
          id: filterStatus as ProjectStatus,
          name: t(`admin-panel-projects:status.${filterStatus}`),
        },
      };

      reset(filterParsed);
    }
  }, [searchParams, reset, t]);

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
            onSubmit={handleSubmit(
              (data) => {
                const searchParams = new URLSearchParams(
                  window.location.search
                );
                if (data.name) {
                  const roleFilter = data.name;
                  searchParams.set("name", roleFilter);
                }

                if (data.status) {
                  const roleFilter = data.status;
                  searchParams.set("status", roleFilter.id);
                }
                if (data.customer_id) {
                  const roleFilter = data.customer_id;
                  searchParams.set("customer_id", roleFilter);
                }
                if (data.estimated_delivery_date) {
                  const formattedDate = formatISO(data.estimated_delivery_date);
                  searchParams.set("estimated_delivery_date", formattedDate);
                }

                router.push(
                  window.location.pathname + "?" + searchParams.toString()
                );
              },
              (errors) => {
                console.log(errors);
              }
            )}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormDateTimePickerInput
                  name="estimated_delivery_date"
                  label={"Fech. est. entrega"}
                  readOnly
                />
              </Grid>
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
                <FormSelectInput<ProjectFilterType, SelectOption<ProjectStatus>>
                  name="status"
                  testId="customer_id"
                  label="Estatus"
                  options={[
                    {
                      id: "",
                      name: "Quitar",
                    },
                    {
                      id: ProjectStatus.Created,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.Created}`
                      ),
                    },
                    {
                      id: ProjectStatus.ReadyForCutting,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.ReadyForCutting}`
                      ),
                    },
                    {
                      id: ProjectStatus.ReadyForDelivery,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.ReadyForDelivery}`
                      ),
                    },
                    {
                      id: ProjectStatus.InProgress,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.InProgress}`
                      ),
                    },
                    {
                      id: ProjectStatus.QA,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.QA}`
                      ),
                    },
                    {
                      id: ProjectStatus.Started,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.Started}`
                      ),
                    },
                    {
                      id: ProjectStatus.WaitingForMaterial,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.WaitingForMaterial}`
                      ),
                    },
                    {
                      id: ProjectStatus.ExternalDependency,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.ExternalDependency}`
                      ),
                    },
                    {
                      id: ProjectStatus.Completed,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.Completed}`
                      ),
                    },
                    {
                      id: ProjectStatus.Canceled,
                      name: t(
                        `admin-panel-projects:status.${ProjectStatus.Canceled}`
                      ),
                    },
                  ]}
                  keyValue="id"
                  renderOption={(option: SelectOption<ProjectStatus>) => {
                    return option.name;
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-projects:filter.actions.apply")}
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
        {t("admin-panel-projects:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default UserFilter;
