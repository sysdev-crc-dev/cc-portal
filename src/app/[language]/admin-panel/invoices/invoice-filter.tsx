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
import { InvoiceFilterType } from "./invoice-filter-types";

type FilterFormData = InvoiceFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-invoices");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<FilterFormData>({
    defaultValues: {
      rfc: "",
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
    reset({ rfc: "" });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("rfc");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const filterRFC = searchParams.get("rfc");
    let filterParsed: InvoiceFilterType = {
      rfc: "",
    };
    if (filterRFC) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        rfc: filterRFC,
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
              if (data.rfc) {
                const roleFilter = data.rfc;
                searchParams.set("rfc", roleFilter);
              }

              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormTextInput<InvoiceFilterType>
                  name="rfc"
                  testId="new-user-password-confirmation"
                  label={"RFC"}
                  type="text"
                />
              </Grid>

              <Grid item xs={6}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-invoices:filter.actions.apply")}
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
        {t("admin-panel-invoices:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default UserFilter;
