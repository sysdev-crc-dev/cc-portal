"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useProjectListQuery,
  projectsQueryKeys,
} from "./queries/projects-queries";
import { TableVirtuoso } from "react-virtuoso";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import TableComponents from "@/components/table/table-components";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { Project, ProjectStatus } from "@/services/api/types/project";
import Link from "@/components/link";
import MuiLink from "@mui/material/Link";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import UserFilter from "./project-filter";
import { useRouter, useSearchParams } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { ProjectFilterType, ProjectSortType } from "./project-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import {
  useCanceledPatchRequest,
  useCompletedPatchRequest,
  useExternalDependencyPatchRequest,
  useMissingMaterialsPatchRequest,
  useReadyForCuttingPatchRequest,
  useReadyForDeliveryPatchRequest,
  useStartedPatchRequest,
} from "../../../../services/api/services/projects";
import { isObjectEmpty } from "../../../../utils";
import { format, parseISO } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { es } from "date-fns/locale/es";
import ButtonGroup from "@mui/material/ButtonGroup";

type UsersKeys = keyof Project;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: UsersKeys;
    order: SortEnum;
    column: UsersKeys;
    style?: Object;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: UsersKeys
    ) => void;
  }>
) {
  return (
    <TableCell
      style={{ width: props.width, ...props.style }}
      sortDirection={props.orderBy === props.column ? props.order : false}
    >
      <TableSortLabel
        active={props.orderBy === props.column}
        direction={props.orderBy === props.column ? props.order : SortEnum.ASC}
        onClick={(event) => props.handleRequestSort(event, props.column)}
      >
        {props.children}
      </TableSortLabel>
    </TableCell>
  );
}

function ProjectNotes({
  entity,
  note,
}: {
  entity: Project;
  note:
    | "cancel_reason"
    | "cutting_note"
    | "in_processing_note"
    | "quality_assurance_note"
    | "waiting_materials_note";
}) {
  if (!note) return null;
  return (
    <>
      <span>{entity[note]}</span>
    </>
  );
}

function Actions({ entity }: { entity: Project }) {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const { confirmDialog } = useConfirmDialog();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const fetchPatchReadyForCutting = useReadyForCuttingPatchRequest();
  const fetchPatchStarted = useStartedPatchRequest();
  const fetchReadyForDelivery = useReadyForDeliveryPatchRequest();
  const fetchPatchCompleted = useCompletedPatchRequest();
  const fetchPatchCancel = useCanceledPatchRequest();
  const fetchPatchMissingMaterial = useMissingMaterialsPatchRequest();
  const fetchPatchExternalDependency = useExternalDependencyPatchRequest();
  const { t: tProjects } = useTranslation("admin-panel-projects");
  const filter = useMemo<Partial<ProjectFilterType | undefined>>(() => {
    const filterName = searchParams.get("name");
    const filterStatus = searchParams.get("status");
    const filterCustomerId = searchParams.get("customer_id");
    const filterEstimatedDate = searchParams.get("estimated_delivery_date");
    const filter: Partial<ProjectFilterType> = {};
    if (filterName) {
      filter.name = filterName;
    }
    if (filterStatus) {
      filter.status = filterStatus as ProjectStatus;
    }
    if (filterCustomerId) {
      filter.customer_id = filterCustomerId;
    }
    if (filterEstimatedDate) {
      filter.estimated_delivery_date = filterEstimatedDate;
    }

    return isObjectEmpty(filter) ? undefined : filter;
  }, [searchParams]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const handleStarted = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("admin-panel-projects:confirm.started.title"),
      message: tProjects("admin-panel-projects:confirm.started.message"),
      successButtonText: "Si",
      cancelButtonText: "No",
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                status: ProjectStatus.Started,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchPatchStarted({
        id: entity.id,
      });
    }
  };
  const handleReadyForCutting = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("admin-panel-projects:confirm.ready_for_cutting.title"),
      message: tProjects(
        "admin-panel-projects:confirm.ready_for_cutting.message"
      ),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: true,
    });

    if (isConfirmed) {
      const value = typeof isConfirmed === "string" ? isConfirmed : "";
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                status: ProjectStatus.ReadyForCutting,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchPatchReadyForCutting({
        id: entity.id,
        data: {
          cutting_note: value,
        },
      });
    }
  };
  const handleCanceled = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("admin-panel-projects:confirm.canceled.title"),
      message: tProjects("admin-panel-projects:confirm.canceled.message"),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: true,
    });

    if (isConfirmed) {
      const value = typeof isConfirmed === "string" ? isConfirmed : "";
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                cancel_reason: value,
                status: ProjectStatus.Canceled,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchPatchCancel({
        id: entity.id,
        data: {
          cancel_reason: value,
        },
      });
    }
  };
  const handleReadyForDelivery = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("admin-panel-projects:confirm.ready_for_delivery.title"),
      message: tProjects(
        "admin-panel-projects:confirm.ready_for_delivery.message"
      ),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: false,
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                status: ProjectStatus.ReadyForDelivery,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchReadyForDelivery({
        id: entity.id,
      });
    }
  };
  const handleCompleted = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("admin-panel-projects:confirm.complete.title"),
      message: tProjects("admin-panel-projects:confirm.complete.message"),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: false,
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                status: ProjectStatus.Completed,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchPatchCompleted({
        id: entity.id,
      });
    }
  };

  const handleMissingMaterial = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects(
        "admin-panel-projects:confirm.waiting_for_materials.title"
      ),
      message: tProjects(
        "admin-panel-projects:confirm.waiting_for_materials.message"
      ),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: true,
    });

    if (isConfirmed) {
      const value = typeof isConfirmed === "string" ? isConfirmed : "";
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                waiting_materials_note: value,
                status: ProjectStatus.WaitingForMaterial,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchPatchMissingMaterial({
        id: entity.id,
        data: {
          waiting_materials_note: value,
        },
      });
    }
  };

  const handleExternalDependency = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects(
        "admin-panel-projects:confirm.external_dependency.title"
      ),
      message: tProjects(
        "admin-panel-projects:confirm.external_dependency.message"
      ),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: false,
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsSort = searchParams.get("sort");

      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "estimated_delivery_date",
      };

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const previousData = queryClient.getQueryData<
        InfiniteData<{ nextPage: number; data: Project[] }>
      >(projectsQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data
            .map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                status: ProjectStatus.ExternalDependency,
              };

              return newItem;
            })
            .filter((item) => {
              if (filter?.status && filter?.status !== item.status) {
                return false;
              }

              return true;
            }),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchPatchExternalDependency({
        id: entity.id,
      });
    }
  };

  const mainButton = (
    <Button
      size="small"
      variant="contained"
      LinkComponent={Link}
      href={`/admin-panel/projects/edit/${entity.id}`}
    >
      {tProjects("admin-panel-projects:actions.edit")}
    </Button>
  );

  return (
    <>
      {entity.status !== ProjectStatus.Canceled && (
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label="split button"
          size="small"
        >
          {mainButton}
          <Button
            size="small"
            sx={{
              maxWidth: 20,
              padding: 0,
              border: 0,
              minWidth: 0,
            }}
            aria-controls={open ? "split-button-menu" : undefined}
            aria-expanded={open ? "true" : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleToggle}
          >
            <ArrowDropDownIcon />
          </Button>
        </ButtonGroup>
      )}

      <Popper
        sx={{
          zIndex: 16,
          minWidth: 100,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        placement="right-start"
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                  {entity.status !== ProjectStatus.ExternalDependency &&
                    entity.status !== ProjectStatus.ReadyForDelivery &&
                    entity.status !== ProjectStatus.Created && (
                      <MenuItem onClick={handleExternalDependency}>
                        {tProjects(
                          "admin-panel-projects:actions.external_dependency"
                        )}
                      </MenuItem>
                    )}
                  {(entity.status === ProjectStatus.ExternalDependency ||
                    entity.status === ProjectStatus.WaitingForMaterial ||
                    entity.status === ProjectStatus.Created) && (
                    <MenuItem onClick={handleStarted}>
                      {tProjects("admin-panel-projects:actions.started")}
                    </MenuItem>
                  )}
                  {entity.status === ProjectStatus.Started && (
                    <MenuItem onClick={handleReadyForCutting}>
                      {tProjects(
                        "admin-panel-projects:actions.ready_for_cutting"
                      )}
                    </MenuItem>
                  )}
                  {entity.status === ProjectStatus.QA && (
                    <MenuItem onClick={handleReadyForDelivery}>
                      {tProjects(
                        "admin-panel-projects:actions.ready_for_delivery"
                      )}
                    </MenuItem>
                  )}
                  {entity.status === ProjectStatus.ReadyForDelivery && (
                    <MenuItem onClick={handleCompleted}>
                      {tProjects("admin-panel-projects:actions.complete")}
                    </MenuItem>
                  )}
                  {entity.status !== ProjectStatus.WaitingForMaterial &&
                    entity.status !== ProjectStatus.ReadyForDelivery &&
                    entity.status !== ProjectStatus.Created && (
                      <MenuItem onClick={handleMissingMaterial}>
                        {tProjects(
                          "admin-panel-projects:actions.waiting_for_materials"
                        )}
                      </MenuItem>
                    )}
                  {entity.status !== ProjectStatus.Canceled && (
                    <MenuItem
                      sx={{
                        bgcolor: "error.main",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "error.light",
                        },
                      }}
                      onClick={handleCanceled}
                    >
                      {tProjects("admin-panel-projects:actions.canceled")}
                    </MenuItem>
                  )}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

function Projects() {
  const { t: tProjects } = useTranslation("admin-panel-projects");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: UsersKeys;
  }>(() => {
    return { order: SortEnum.ASC, orderBy: "estimated_delivery_date" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: UsersKeys
  ) => {
    const isAsc = orderBy === property && order === SortEnum.ASC;
    const searchParams = new URLSearchParams(window.location.search);
    const newOrder = isAsc ? SortEnum.DESC : SortEnum.ASC;
    const newOrderBy = property;
    searchParams.set("sort", `${newOrder ? "!" : ""}${newOrderBy}`);
    setSort({
      order: newOrder,
      orderBy: newOrderBy,
    });
    router.push(window.location.pathname + "?" + searchParams.toString());
  };

  const filter = useMemo<Partial<ProjectFilterType | undefined>>(() => {
    const filterName = searchParams.get("name");
    const filterStatus = searchParams.get("status");
    const filterCustomerId = searchParams.get("customer_id");
    const filterEstimatedDate = searchParams.get("estimated_delivery_date");
    const filter: Partial<ProjectFilterType> = {};
    if (filterName) {
      filter.name = filterName;
    }
    if (filterStatus) {
      filter.status = filterStatus as ProjectStatus;
    }
    if (filterCustomerId) {
      filter.customer_id = filterCustomerId;
    }
    if (filterEstimatedDate) {
      filter.estimated_delivery_date = filterEstimatedDate;
    }

    return isObjectEmpty(filter) ? undefined : filter;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useProjectListQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as Project[]) ??
      ([] as Project[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">
              {tProjects("admin-panel-projects:title")}
            </Typography>
          </Grid>
          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            <Grid item xs="auto">
              <UserFilter />
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href="/admin-panel/projects/create"
                color="success"
              >
                {tProjects("admin-panel-projects:actions.create")}
              </Button>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} mb={2}>
          <TableVirtuoso
            style={{ height: 500 }}
            data={result}
            components={TableComponents}
            endReached={handleScroll}
            overscan={20}
            fixedHeaderContent={() => (
              <>
                <TableRow>
                  <TableCell
                    style={{
                      minWidth: 150,
                      background: "white",
                      position: "sticky",
                      left: 0,
                      zIndex: 15,
                    }}
                  >
                    Acciones
                  </TableCell>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    column="id"
                    handleRequestSort={handleRequestSort}
                  >
                    {tProjects("admin-panel-projects:table.column-id")}
                  </TableSortCellWrapper>
                  <TableCell style={{ minWidth: 200 }}>
                    {tProjects("admin-panel-projects:table.column-name")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="status"
                    style={{}}
                    handleRequestSort={handleRequestSort}
                  >
                    {tProjects("admin-panel-projects:table.column-status")}
                  </TableSortCellWrapper>

                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-customer")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-file")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="estimated_delivery_date"
                    style={{}}
                    handleRequestSort={handleRequestSort}
                  >
                    {tProjects("admin-panel-projects:table.column-est-date")}
                  </TableSortCellWrapper>
                  <TableCell style={{ minWidth: 120 }}>
                    {tProjects(
                      "admin-panel-projects:table.column-cutting-time"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-operator")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-package")}
                  </TableCell>
                  <TableCell style={{ minWidth: 120 }}>
                    {tProjects(
                      "admin-panel-projects:table.column-delivery-type"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-staff")}
                  </TableCell>
                  <TableCell style={{ minWidth: 120 }}>
                    {tProjects("admin-panel-projects:table.column-provided-by")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-materials")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-supplies")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-processes")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("admin-panel-projects:table.column-notes")}
                  </TableCell>
                </TableRow>
                {isFetchingNextPage && (
                  <TableRow>
                    <TableCellLoadingContainer colSpan={6}>
                      <LinearProgress />
                    </TableCellLoadingContainer>
                  </TableRow>
                )}
              </>
            )}
            itemContent={(index, entity) => (
              <>
                <TableCell
                  style={{
                    minWidth: 150,
                    left: 0,
                    background: "white",
                    position: "sticky",
                    textAlign: "left",
                  }}
                >
                  <Actions entity={entity} />{" "}
                </TableCell>
                <TableCell>{entity?.id}</TableCell>
                <TableCell style={{ minWidth: 200 }}>{entity?.name}</TableCell>
                <TableCell style={{ minWidth: 100 }}>
                  {tProjects(`admin-panel-projects:status.${entity?.status}`)}
                </TableCell>
                <TableCell style={{ minWidth: 160 }}>
                  {entity?.customer_id ? (
                    <MuiLink
                      key="1"
                      target="_blank"
                      rel="noopener noreferrer"
                      href={`/admin-panel/customers?id=${entity?.customer_id}`}
                    >
                      {`${entity?.customer?.name} ${entity?.customer?.last_name}`}
                    </MuiLink>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {entity?.file ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      LinkComponent={Link}
                      target="_blank"
                      href={`${entity?.file}`}
                    >
                      Ver
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{ minWidth: 160 }}>
                  {entity?.estimated_delivery_date
                    ? format(
                        toZonedTime(
                          parseISO(entity?.estimated_delivery_date),
                          "UTC"
                        ),
                        "HH:mm, EEEE dd 'de' MMMM 'del' yyyy",
                        {
                          locale: es,
                        }
                      )
                    : "N/A"}
                </TableCell>
                <TableCell
                  style={{
                    minWidth: 200,
                  }}
                >
                  {`${entity?.est_cutting_time_in_hours} minuto(s) est.`} <br />
                  <span
                    style={{
                      color: "purple",
                    }}
                  >
                    {entity?.actual_cutting_time
                      ? `${entity?.actual_cutting_time} minuto(s) reales`
                      : ""}
                  </span>
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {`${entity?.operator?.name} ${entity?.operator?.last_name}`}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {tProjects(
                    `admin-panel-projects:package-type.${entity?.package_type}`
                  )}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {tProjects(
                    `admin-panel-projects:delivery-type.${entity?.delivery_type}`
                  )}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {`${entity?.employee_in_charge?.name} ${entity?.employee_in_charge?.last_name}`}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {tProjects(
                    `admin-panel-projects:provided-by.${entity?.material_provided_by}`
                  )}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {entity?.materials?.length ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      LinkComponent={Link}
                      target="_blank"
                      href={`/admin-panel/materials?project_id=${entity.id}`}
                    >
                      Ver
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {entity?.supplies?.length ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      LinkComponent={Link}
                      target="_blank"
                      href={`/admin-panel/supplies?project_id=${entity.id}`}
                    >
                      Ver
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{ width: 80 }}>
                  {entity?.processes?.length ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      LinkComponent={Link}
                      target="_blank"
                      href={`/admin-panel/processes?project_id=${entity.id}`}
                    >
                      Ver
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{ width: 200 }}>
                  <ProjectNotes
                    entity={entity}
                    note={tProjects(
                      `admin-panel-projects:notes.${entity.status}`
                    )}
                  />
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Projects, {
  roles: [RoleEnum.Admin, RoleEnum.Staff],
});
