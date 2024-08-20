"use client";

import Button from "@mui/material/Button";
import { useForm, FormProvider, useFormState } from "react-hook-form";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import FormTextInput from "@/components/form/text-input/form-text-input";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useSnackbar } from "notistack";
import Link from "@/components/link";
import useLeavePage from "@/services/leave-page/use-leave-page";
import Box from "@mui/material/Box";
import HTTP_CODES_ENUM from "@/services/api/types/http-codes";
import { useTranslation } from "@/services/i18n/client";
import { usePostProjectService } from "@/services/api/services/projects";
import {
  ProjectDeliveryType,
  ProjectMachineType,
  ProjectMaterialProvidedBy,
  ProjectPackageType,
} from "../../../../../services/api/types/project";
import { useEffect, useState } from "react";
import {
  CustomersResponse,
  useGetCustomersService,
} from "../../../../../services/api/services/customers";
import FormSelectInput from "../../../../../components/form/select/form-select";
import {
  EmployeesResponse,
  useGetEmployeesService,
} from "../../../../../services/api/services/employees";
import FormMultipleSelectInput from "../../../../../components/form/multiple-select/form-multiple-select";
import { Material } from "../../../../../services/api/types/material";
import { Customer } from "../../../../../services/api/types/customer";
import { Employee } from "../../../../../services/api/types/user";
import {
  MaterialsResponse,
  useGetMaterialsService,
} from "../../../../../services/api/services/materials";
import {
  SuppliesResponse,
  useGetSuppliesService,
} from "../../../../../services/api/services/supplies";
import { Supply } from "../../../../../services/api/types/supply";
import {
  ProcessesResponse,
  useGetProcessesService,
} from "../../../../../services/api/services/processes";
import { Process } from "../../../../../services/api/types/process";
import { SortEnum } from "../../../../../services/api/types/sort-type";
import FormDateTimePickerInput from "../../../../../components/form/date-pickers/date-time-picker";

type SelectOption<T> = {
  id: T;
  name: string;
};

type CreateProjectFormData = {
  name: string;
  file: string;
  est_cutting_time_in_hours: string;
  est_dimensions: string;
  estimated_delivery_date: Date | null;
  est_man_hours: number;
  customer: SelectOption<number>;
  employee: SelectOption<number>;
  operator: SelectOption<number>;
  assigned_machine?: SelectOption<ProjectMachineType>;
  package_type: SelectOption<ProjectPackageType>;
  material_provided_by: SelectOption<ProjectMaterialProvidedBy>;
  delivery_type: SelectOption<ProjectDeliveryType>;
  materials: Pick<Material, "id" | "name">[];
  supplies: Pick<Supply, "id" | "name">[];
  processes: Pick<Process, "id" | "name">[];
};

const useValidationSchema = () => {
  const { t } = useTranslation("admin-panel-employee-create");

  return yup.object().shape({
    name: yup
      .string()
      .required(
        t("admin-panel-projects-create:inputs.name.validation.required")
      ),
    file: yup
      .string()
      .url(t("admin-panel-projects-create:inputs.file.validation.invalid"))
      .required(
        t("admin-panel-projects-create:inputs.file.validation.required")
      ),
    est_man_hours: yup
      .number()
      .required(
        t(
          "admin-panel-projects-create:inputs.est_man_hours.validation.required"
        )
      ),
    est_cutting_time_in_hours: yup
      .string()
      .required(
        t(
          "admin-panel-projects-create:inputs.est_cutting_time_in_hours.validation.required"
        )
      ),
    est_dimensions: yup
      .string()
      .required(
        t(
          "admin-panel-projects-create:inputs.est_dimensions.validation.required"
        )
      ),
    customer: yup
      .object()
      .shape({
        id: yup.number().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t("admin-panel-projects-create:inputs.customer.validation.required")
      ),
    employee: yup
      .object()
      .shape({
        id: yup.number().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t("admin-panel-projects-create:inputs.employee.validation.required")
      ),
    operator: yup
      .object()
      .shape({
        id: yup.number().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t("admin-panel-projects-create:inputs.operator.validation.required")
      ),
    package_type: yup
      .object()
      .shape({
        id: yup.string().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t("admin-panel-projects-create:inputs.package_type.validation.required")
      ),
    material_provided_by: yup
      .object()
      .shape({
        id: yup.string().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t(
          "admin-panel-projects-create:inputs.material_provided_by.validation.required"
        )
      ),
    delivery_type: yup
      .object()
      .shape({
        id: yup.string().defined(),
        name: yup.string().defined(),
      })
      .default(undefined)
      .required(
        t(
          "admin-panel-projects-create:inputs.delivery_type.validation.required"
        )
      ),
  });
};

function CreateEmployeeFormActions() {
  const { t } = useTranslation("admin-panel-projects-create");
  const { isSubmitting, isDirty } = useFormState();
  useLeavePage(isDirty);

  return (
    <Button
      variant="contained"
      color="primary"
      type="submit"
      disabled={isSubmitting}
    >
      {t("admin-panel-projects-create:actions.submit")}
    </Button>
  );
}

function FormCreateEmployee() {
  const fetchPostProject = usePostProjectService();
  const fetchCustomers = useGetCustomersService();
  const fetchEmployees = useGetEmployeesService();
  const fetchMaterials = useGetMaterialsService();
  const [materialsData, setMaterials] = useState<
    Pick<Material, "id" | "name">[]
  >([]);
  const fetchSupplies = useGetSuppliesService();
  const [suppliesData, setSupplies] = useState<Pick<Supply, "id" | "name">[]>(
    []
  );
  const fetchProcesses = useGetProcessesService();
  const [processesData, setProcesses] = useState<
    Pick<Process, "id" | "name">[]
  >([]);
  const [customersData, setCustomersData] = useState<SelectOption<number>[]>(
    []
  );
  const [employeesData, setEmployeesData] = useState<SelectOption<number>[]>(
    []
  );
  const { t } = useTranslation("admin-panel-projects-create");
  const validationSchema = useValidationSchema();

  useEffect(() => {
    const fetchMaterialsInfo = async () => {
      const { res } = await fetchMaterials({
        page: 1,
        pageSize: 100,
        sort: [{ order: SortEnum.ASC, orderBy: "id" }],
      });

      const data: SelectOption<number>[] = (
        res as MaterialsResponse
      ).data.items.map((value) => ({
        id: value.id,
        name: `${value.id} - ${value.name} - Provedor: ${value.provider.name}`,
      }));

      setMaterials(data);
    };

    fetchMaterialsInfo();
  }, [fetchMaterials]);

  useEffect(() => {
    const fetchSuppliesInfo = async () => {
      const { res } = await fetchSupplies({
        page: 1,
        pageSize: 100,
      });

      const data: SelectOption<number>[] = (
        res as SuppliesResponse
      ).data.items.map((value) => ({
        id: value.id,
        name: `${value.id} - ${value.name}`,
      }));

      setSupplies(data);
    };

    fetchSuppliesInfo();
  }, [fetchSupplies]);

  useEffect(() => {
    const fetchProcessesInfo = async () => {
      const { res } = await fetchProcesses({
        page: 1,
        pageSize: 100,
      });

      const data: SelectOption<number>[] = (
        res as ProcessesResponse
      ).data.items.map((value) => ({
        id: value.id,
        name: `${value.id} - ${value.name}`,
      }));

      setProcesses(data);
    };

    fetchProcessesInfo();
  }, [fetchProcesses]);

  useEffect(() => {
    const fetchCustomersInfo = async () => {
      const { res } = await fetchCustomers({
        page: 1,
        pageSize: 100,
      });

      const data: SelectOption<number>[] = (
        res as CustomersResponse
      ).data.items.map((value) => ({
        id: value.id,
        name: `${value.id} - ${value.name} ${value.last_name}`,
      }));

      setCustomersData(data);
    };

    fetchCustomersInfo();
  }, [fetchCustomers]);

  useEffect(() => {
    const fetchEmployeesInfo = async () => {
      const { res } = await fetchEmployees({
        page: 1,
        pageSize: 100,
      });

      const data: SelectOption<number>[] = (
        res as EmployeesResponse
      ).data.items.map((value) => ({
        id: value.id,
        name: `${value.id} - ${value.name} ${value.last_name}`,
      }));

      setEmployeesData(data);
    };

    fetchEmployeesInfo();
  }, [fetchEmployees]);

  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<CreateProjectFormData>({
    // @ts-expect-error ts(2322)
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      file: "",
      est_cutting_time_in_hours: "0",
      est_dimensions: "",
      estimated_delivery_date: null,
      material_provided_by: {
        id: ProjectMaterialProvidedBy.Cometa,
        name: "Cometa",
      },
      package_type: {
        id: ProjectPackageType.Basic,
        name: "Basico",
      },
      delivery_type: {
        id: ProjectDeliveryType.Workshop,
        name: "En taller",
      },
      est_man_hours: 1,
      customer: undefined,
      employee: undefined,
      operator: undefined,
      materials: [],
      supplies: [],
      processes: [],
    },
  });

  const { handleSubmit, setError, reset } = methods;

  const onSubmit = handleSubmit(
    async (formData) => {
      const { status } = await fetchPostProject({
        name: formData.name,
        file: formData.file,
        customer_id: formData.customer.id,
        employee_in_charge_id: formData.employee.id,
        operator_id: formData.operator.id,
        est_cutting_time_in_hours: Number(formData.est_cutting_time_in_hours),
        assigned_machine: formData?.assigned_machine?.id ?? null,
        est_dimensions: formData.est_dimensions,
        est_man_hours: formData.est_man_hours,
        material_provided_by: formData.material_provided_by.id,
        estimated_delivery_date: formData.estimated_delivery_date
          ? formData.estimated_delivery_date.toLocaleString("MX")
          : "",
        package_type: formData.package_type.id,
        delivery_type: formData.delivery_type.id,
        materials: formData.materials.map((material) => material.id),
        supplies: formData.materials.map((supply) => supply.id),
        processes: formData.materials.map((process) => process.id),
      });

      if (status !== HTTP_CODES_ENUM.CREATED) {
        setError("root.serverError", { type: "400" });
        enqueueSnackbar(t("admin-panel-projects-create:alerts.server.error"), {
          variant: "error",
        });
        return;
      }

      if (status === HTTP_CODES_ENUM.CREATED) {
        reset();
        enqueueSnackbar(
          t("admin-panel-projects-create:alerts.project.success"),
          {
            variant: "success",
          }
        );

        return;
      }
    },
    (errors) => {
      console.log(errors);
    }
  );

  return (
    <FormProvider {...methods}>
      <Container maxWidth="lg">
        <form onSubmit={onSubmit} autoComplete="create-new-user">
          <Grid
            container
            maxWidth="lg"
            alignItems="flex-end"
            direction="row"
            spacing={2}
            mb={3}
            mt={3}
          >
            <Grid item xs={12} md={12}>
              <Typography variant="h6">
                {t("admin-panel-projects-create:title")}
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormTextInput<CreateProjectFormData>
                name="name"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-projects-create:inputs.name.label")}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormDateTimePickerInput<CreateProjectFormData>
                name="estimated_delivery_date"
                testId="new-user-email"
                label="Fecha de Entrega Estimado"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormTextInput<CreateProjectFormData>
                name="file"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t("admin-panel-projects-create:inputs.file.label")}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormTextInput<CreateProjectFormData>
                name="est_cutting_time_in_hours"
                type="tel"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t(
                  "admin-panel-projects-create:inputs.est_cutting_time_in_hours.label"
                )}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormTextInput<CreateProjectFormData>
                name="est_man_hours"
                type="number"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t(
                  "admin-panel-projects-create:inputs.est_man_hours.label"
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormTextInput<CreateProjectFormData>
                name="est_dimensions"
                testId="new-user-email"
                autoComplete="new-user-email"
                label={t(
                  "admin-panel-projects-create:inputs.est_dimensions.label"
                )}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                SelectOption<ProjectMachineType>
              >
                name="assigned_machine"
                testId="customer_id"
                label={t(
                  "admin-panel-projects-create:inputs.assigned_machine.label"
                )}
                options={[
                  {
                    id: ProjectMachineType.Red,
                    name: "Roja",
                  },
                  {
                    id: ProjectMachineType.White,
                    name: "Blanca",
                  },
                  {
                    id: ProjectMachineType.Fiber,
                    name: "Fibra",
                  },
                ]}
                keyValue="id"
                renderOption={(option: SelectOption<ProjectMachineType>) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                SelectOption<ProjectMaterialProvidedBy>
              >
                name="material_provided_by"
                testId="customer_id"
                label={t(
                  "admin-panel-projects-create:inputs.material_provided_by.label"
                )}
                options={[
                  {
                    id: ProjectMaterialProvidedBy.Cometa,
                    name: "Cometa",
                  },
                  {
                    id: ProjectMaterialProvidedBy.Customer,
                    name: "Cliente",
                  },
                ]}
                keyValue="id"
                renderOption={(
                  option: SelectOption<ProjectMaterialProvidedBy>
                ) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                SelectOption<ProjectPackageType>
              >
                name="package_type"
                testId="customer_id"
                label={t(
                  "admin-panel-projects-create:inputs.package_type.label"
                )}
                options={[
                  {
                    id: ProjectPackageType.Basic,
                    name: "Basico",
                  },
                  {
                    id: ProjectPackageType.Custom,
                    name: "Personalizado",
                  },
                ]}
                keyValue="id"
                renderOption={(option: SelectOption<ProjectPackageType>) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                SelectOption<ProjectDeliveryType>
              >
                name="delivery_type"
                testId="customer_id"
                label={t(
                  "admin-panel-projects-create:inputs.delivery_type.label"
                )}
                options={[
                  {
                    id: ProjectDeliveryType.Home,
                    name: "A domicilio",
                  },
                  {
                    id: ProjectDeliveryType.Workshop,
                    name: "En taller",
                  },
                  {
                    id: ProjectDeliveryType.Instalation,
                    name: "Requiere instalación",
                  },
                ]}
                keyValue="id"
                renderOption={(option: SelectOption<ProjectDeliveryType>) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                Pick<Customer, "id" | "name">
              >
                name="customer"
                testId="customer_id"
                label={t("admin-panel-projects-create:inputs.customer.label")}
                options={customersData}
                keyValue="id"
                renderOption={(option: SelectOption<number>) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                Pick<Employee, "id" | "name">
              >
                name="employee"
                testId="customer_id"
                label={t("admin-panel-projects-create:inputs.employee.label")}
                options={employeesData}
                keyValue="id"
                renderOption={(option: SelectOption<number>) => {
                  return option.name;
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormSelectInput<
                CreateProjectFormData,
                Pick<Customer, "id" | "name">
              >
                name="operator"
                testId="customer_id"
                label={t("admin-panel-projects-create:inputs.operator.label")}
                options={employeesData}
                keyValue="id"
                renderOption={(option: SelectOption<number>) => {
                  return option.name;
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormMultipleSelectInput<
                CreateProjectFormData,
                Pick<Material, "id" | "name">
              >
                name="materials"
                testId="materials"
                label={t("admin-panel-projects-create:inputs.materials.label")}
                options={materialsData}
                keyValue="id"
                renderOption={(option) => {
                  return option.name;
                }}
                renderValue={(values) =>
                  values
                    .map((value) => {
                      return value.name;
                    })
                    .join(", ")
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormMultipleSelectInput<
                CreateProjectFormData,
                Pick<Supply, "id" | "name">
              >
                name="supplies"
                testId="supplies"
                label={t("admin-panel-projects-create:inputs.supplies.label")}
                options={suppliesData}
                keyValue="id"
                renderOption={(option) => {
                  return option.name;
                }}
                renderValue={(values) =>
                  values
                    .map((value) => {
                      return value.name;
                    })
                    .join(", ")
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormMultipleSelectInput<
                CreateProjectFormData,
                Pick<Process, "id" | "name">
              >
                name="processes"
                testId="processes"
                label={t("admin-panel-projects-create:inputs.processes.label")}
                options={processesData}
                keyValue="id"
                renderOption={(option) => {
                  return option.name;
                }}
                renderValue={(values) =>
                  values
                    .map((value) => {
                      return value.name;
                    })
                    .join(", ")
                }
              />
            </Grid>

            <Grid item xs={12}>
              <CreateEmployeeFormActions />
              <Box ml={1} component="span">
                <Button
                  variant="contained"
                  color="inherit"
                  LinkComponent={Link}
                  href="/admin-panel/projects"
                >
                  {t("admin-panel-projects-create:actions.cancel")}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Container>
    </FormProvider>
  );
}

function CreateEmployee() {
  return <FormCreateEmployee />;
}

export default withPageRequiredAuth(CreateEmployee);
