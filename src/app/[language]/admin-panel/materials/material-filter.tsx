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
import { MaterialFilterType } from "./material-filter-types";

type FilterFormData = MaterialFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-materials");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      prefix: "",
      id: "",
      provider_id: "",
      project_id: "",
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
    reset({ name: "", prefix: "", id: "", provider_id: "", project_id: "" });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("last_name");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterName = searchParams.get("name");
    const filterPrefix = searchParams.get("prefix");
    const filterId = searchParams.get("id");
    const filterProvider = searchParams.get("provider_id");
    const filterProject = searchParams.get("project_id");
    let filterParsed: MaterialFilterType = {
      name: "",
      prefix: "",
      id: "",
      provider_id: "",
      project_id: "",
    };
    if (filterName) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        name: filterName,
      };

      reset(filterParsed);
    }

    if (filterPrefix) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        prefix: filterPrefix,
      };

      reset(filterParsed);
    }
    if (filterId) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        id: filterId,
      };

      reset(filterParsed);
    }
    if (filterProvider) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        provider_id: filterProvider,
      };

      reset(filterParsed);
    }
    if (filterProject) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        project_id: filterProject,
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
              searchParams.set("name", data.name);
              searchParams.set("prefix", data.prefix);
              searchParams.set("provider_id", data.provider_id);
              searchParams.set("id", data.id);
              searchParams.set("project_id", data.project_id);
              if (!data.name) {
                searchParams.delete("name");
              }

              if (!data.prefix) {
                searchParams.delete("prefix");
              }
              if (!data.provider_id) {
                searchParams.delete("provider_id");
              }
              if (!data.id) {
                searchParams.delete("id");
              }
              if (!data.project_id) {
                searchParams.delete("project_id");
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<MaterialFilterType>
                  name="name"
                  testId="new-user-password-confirmation"
                  label={"Nombre"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<MaterialFilterType>
                  name="prefix"
                  testId="new-user-password-confirmation"
                  label={"Prefijo"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<MaterialFilterType>
                  name="id"
                  testId="new-user-password-confirmation"
                  label={"Id Material"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<MaterialFilterType>
                  name="provider_id"
                  testId="new-user-password-confirmation"
                  label={"Id Provedor"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<MaterialFilterType>
                  name="project_id"
                  testId="new-user-password-confirmation"
                  label={"Id Proyecto"}
                  type="text"
                />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-materials:filter.actions.apply")}
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
        {t("admin-panel-materials:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default UserFilter;
