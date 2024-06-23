"use client";

import FormMultipleSelectInput from "@/components/form/multiple-select/form-multiple-select";
import { RoleEnum } from "@/services/api/types/role";
import { useTranslation } from "@/services/i18n/client";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Popover from "@mui/material/Popover";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { UserFilterType } from "./user-filter-types";

type UserFilterFormData = UserFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-users");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<UserFilterFormData>({
    defaultValues: {
      roles: [],
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

  useEffect(() => {
    const filter = searchParams.get("role");
    if (filter) {
      handleClose();

      const xd: UserFilterType = {
        roles: filter.split("|").map((value) => ({
          role: value as RoleEnum,
        })),
      };
      reset(xd);
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
          }}
        >
          <form
            onSubmit={handleSubmit((data) => {
              console.log(data.roles);
              let roleFilter = "";
              if (data.roles) {
                roleFilter = data.roles?.reduce((prev, curr, index) => {
                  if (data.roles && index === data.roles?.length - 1) {
                    return prev + curr.role;
                  }
                  return prev + curr.role + "|";
                }, "");
              }
              const searchParams = new URLSearchParams(window.location.search);
              searchParams.set("role", roleFilter);
              router.push(
                window.location.pathname + "?" + searchParams.toString()
              );
            })}
          >
            <Grid container spacing={2} mb={3} mt={3}>
              <Grid item xs={12}>
                <FormMultipleSelectInput<
                  UserFilterFormData,
                  Pick<UserFilterType, "roles">
                >
                  name="roles"
                  testId="roles"
                  label={t("admin-panel-users:filter.role.label")}
                  options={[
                    {
                      role: RoleEnum.Admin,
                    },
                    {
                      role: RoleEnum.Staff,
                    },
                    {
                      role: RoleEnum.Operator,
                    },
                  ]}
                  keyValue="role"
                  renderOption={(option) => {
                    return t(
                      `admin-panel-users:filter.role.options.${option.role}`
                    );
                  }}
                  renderValue={(values) =>
                    values
                      .map((value) => {
                        return t(
                          `admin-panel-users:filter.role.options.${value.role}`
                        );
                      })
                      .join(", ")
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" type="submit">
                  {t("admin-panel-users:filter.actions.apply")}
                </Button>
              </Grid>
            </Grid>
          </form>
        </Container>
      </Popover>
      <Button aria-describedby={id} variant="contained" onClick={handleClick}>
        {t("admin-panel-users:filter.actions.filter")}
      </Button>
    </FormProvider>
  );
}

export default UserFilter;
