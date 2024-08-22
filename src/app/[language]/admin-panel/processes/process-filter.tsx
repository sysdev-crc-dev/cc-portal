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
import { ProcessFilterType } from "./process-filter-types";
import { ProcessType } from "../../../../services/api/types/process";
import FormSelectInput from "../../../../components/form/select/form-select";

type FilterFormData = Pick<ProcessFilterType, "id" | "name" | "project_id"> & {
  type: SelectOption;
};

type SelectOption = {
  id: ProcessType | null;
  name: string;
};

function UserFilter() {
  const { t } = useTranslation("admin-panel-materials");
  const router = useRouter();
  const searchParams = useSearchParams();
  const typeOptions: SelectOption[] = [
    { id: null, name: "Quitar" },
    { id: ProcessType.Internal, name: "Interno" },
    { id: ProcessType.External, name: "Externo" },
  ];
  const methods = useForm<FilterFormData>({
    defaultValues: {
      name: "",
      id: "",
      type: typeOptions[0],
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
    reset({ name: "", id: "", project_id: "", type: typeOptions[0] });
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.delete("name");
    searchParams.delete("id");
    searchParams.delete("type");
    searchParams.delete("project_id");

    router.push(window.location.pathname);
  };

  useEffect(() => {
    const typeOptions: SelectOption[] = [
      { id: ProcessType.Internal, name: "Interno" },
      { id: ProcessType.External, name: "Externo" },
    ];
    const filterName = searchParams.get("name");
    const filterId = searchParams.get("id");
    const filterProjectId = searchParams.get("project_id");
    const filterType: ProcessType | null = searchParams.get(
      "type"
    ) as ProcessType;
    let filterParsed: FilterFormData = {
      name: "",
      id: "",
      type: typeOptions[0],
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

    if (filterType) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        type: typeOptions[
          typeOptions.findIndex((value) => value.id === filterType)
        ],
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

    if (filterProjectId) {
      handleClose();
      filterParsed = {
        ...filterParsed,
        project_id: filterProjectId,
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
              searchParams.set("type", data.type.id ? data.type.id : "");
              searchParams.set("name", data.name);
              searchParams.set("id", data.id);
              searchParams.set("project_id", data.project_id);
              if (!data.name) {
                searchParams.delete("name");
              }

              if (!data.id) {
                searchParams.delete("id");
              }

              if (!data.type.id) {
                searchParams.delete("type");
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
                <FormTextInput<ProcessFilterType>
                  name="name"
                  testId="new-user-password-confirmation"
                  label={"Nombre"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormSelectInput
                  name="type"
                  options={typeOptions}
                  label={"Tipo"}
                  keyValue="id"
                  renderOption={(option: SelectOption) => option.name}
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<ProcessFilterType>
                  name="id"
                  testId="new-user-password-confirmation"
                  label={"Id Proceso"}
                  type="text"
                />
              </Grid>

              <Grid item xs={12}>
                <FormTextInput<ProcessFilterType>
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
