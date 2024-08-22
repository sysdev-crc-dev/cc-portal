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
import { ProviderFilterType } from "./provider-filter-types";

type FilterFormData = ProviderFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-employees");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      tag: "",
      address_id: "",
      material_id: "",
      id: "",
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
      tag: "",
      address_id: "",
      material_id: "",
      id: "",
    });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("tag");
    searchParams.delete("address_id");
    searchParams.delete("material_id");
    searchParams.delete("id");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterName = searchParams.get("name");
    const filterTag = searchParams.get("tag");
    const filterAddress = searchParams.get("address_id");
    const filterMaterial = searchParams.get("material_id");
    const filterId = searchParams.get("id");
    let filterParsed: ProviderFilterType = {
      name: "",
      tag: "",
      address_id: "",
      material_id: "",
      id: "",
    };
    if (filterName) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        name: filterName,
      };

      reset(filterParsed);
    }

    if (filterTag) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        tag: filterTag,
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
    if (filterAddress) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        tag: filterAddress,
      };

      reset(filterParsed);
    }
    if (filterMaterial) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        tag: filterMaterial,
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
              searchParams.set("tag", data.tag);
              searchParams.set("id", data.id);
              searchParams.set("address_id", data.address_id);
              searchParams.set("material_id", data.material_id);
              if (!data.name) {
                searchParams.delete("name");
              }

              if (!data.tag) {
                searchParams.delete("tag");
              }
              if (!data.id) {
                searchParams.delete("id");
              }
              if (!data.address_id) {
                searchParams.delete("address_id");
              }
              if (!data.material_id) {
                searchParams.delete("material_id");
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<ProviderFilterType>
                  name="name"
                  testId="new-user-password-confirmation"
                  label={"Nombre"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<ProviderFilterType>
                  name="tag"
                  testId="new-user-password-confirmation"
                  label={"Identificador"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<ProviderFilterType>
                  name="id"
                  testId="new-user-password-confirmation"
                  label={"Provedor"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<ProviderFilterType>
                  name="address_id"
                  testId="new-user-password-confirmation"
                  label={"Direccion"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<ProviderFilterType>
                  name="material_id"
                  testId="new-user-password-confirmation"
                  label={"Material"}
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
