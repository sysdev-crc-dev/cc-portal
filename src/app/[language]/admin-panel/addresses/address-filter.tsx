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
import { AddressFilterType } from "./address-filter-types";

type FilterFormData = AddressFilterType;

function AddressFilter() {
  const { t } = useTranslation("admin-panel-addresses");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      customer_id: "",
      provider_id: "",
      street: "",
      postal_code: "",
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
    reset({ customer_id: "", provider_id: "", street: "", postal_code: "" });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterCustomerId = searchParams.get("customer_id");
    const filterProviderId = searchParams.get("provider_id");
    const filterStreet = searchParams.get("street");
    const filterPostalCode = searchParams.get("postal_code");
    let filterParsed: AddressFilterType = {
      customer_id: "",
      provider_id: "",
      street: "",
      postal_code: "",
    };
    if (filterCustomerId) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        customer_id: filterCustomerId,
      };

      reset(filterParsed);
    }
    if (filterProviderId) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        provider_id: filterProviderId,
      };

      reset(filterParsed);
    }
    if (filterStreet) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        street: filterStreet,
      };

      reset(filterParsed);
    }
    if (filterPostalCode) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        postal_code: filterPostalCode,
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
              searchParams.set("provider_id", data.provider_id);
              searchParams.set("customer_id", data.customer_id);
              searchParams.set("street", data.street);
              searchParams.set("postal_code", data.postal_code);
              if (!data.customer_id) {
                searchParams.delete("customer_id");
              }
              if (!data.provider_id) {
                searchParams.delete("provider_id");
              }
              if (!data.street) {
                searchParams.delete("street");
              }
              if (!data.postal_code) {
                searchParams.delete("postal_code");
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<AddressFilterType>
                  name="customer_id"
                  testId="customer_id"
                  label={"Id Cliente"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<AddressFilterType>
                  name="provider_id"
                  testId="provider_id"
                  label={"Id Provedor"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<AddressFilterType>
                  name="street"
                  testId="street"
                  label={"Calle"}
                  type="text"
                />
              </Grid>
              <Grid item xs={12}>
                <FormTextInput<AddressFilterType>
                  name="postal_code"
                  testId="postal_code"
                  label={"Codigo Postal"}
                  type="text"
                />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-addresses:filter.actions.apply")}
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
        {t("admin-panel-addresses:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default AddressFilter;
