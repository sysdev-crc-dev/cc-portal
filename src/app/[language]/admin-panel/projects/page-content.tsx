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
import { Project } from "@/services/api/types/project";
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
import { useDeleteProjectService } from "../../../../services/api/services/projects";
import { isObjectEmpty } from "../../../../utils";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

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
    style: Object;
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
  const { confirmDialog } = useConfirmDialog();
  const fetchDelete = useDeleteProjectService();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = true;
  const { t: tProjects } = useTranslation("admin-panel-projects");

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

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("admin-panel-projects:confirm.delete.title"),
      message: tProjects("admin-panel-projects:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: ProjectFilterType | undefined = undefined;
      let sort: ProjectSortType | undefined = {
        order: SortEnum.ASC,
        orderBy: "id",
      };

      if (searchParamsFilter) {
        filter = JSON.parse(searchParamsFilter);
      }

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
          data: page?.data.filter((item) => item.id !== entity.id),
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchDelete({
        id: entity.id,
      });
    }
  };

  // const mainButton = (
  //   <Button
  //     size="small"
  //     variant="contained"
  //     LinkComponent={Link}
  //     href={`/admin-panel/projects/edit/${entity.id}`}
  //   >
  //     {tProjects("admin-panel-projects:actions.edit")}
  //   </Button>
  // );

  return (
    <>
      <Button
        size="small"
        ref={anchorRef}
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
      <Popper
        sx={{
          zIndex: 15,
          minWidth: 100,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        placement="right"
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
                  {canDelete && (
                    <MenuItem
                      sx={{
                        bgcolor: "error.main",
                        color: "#fff",
                        "&:hover": {
                          bgcolor: "error.light",
                        },
                      }}
                      onClick={handleDelete}
                    >
                      {tProjects("admin-panel-projects:actions.delete")}
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
    return { order: SortEnum.ASC, orderBy: "id" };
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
    const filterType = searchParams.get("type");
    const filterIsActive = searchParams.get("is_active");
    const filter: Partial<ProjectFilterType> = {};
    if (filterName) {
      filter.name = filterName;
    }

    if (filterType) {
      filter.type = filterType;
    }

    if (filterIsActive) {
      filter.is_active = filterIsActive === "true";
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
                  <TableCell style={{ width: 50 }}></TableCell>
                  <TableSortCellWrapper
                    width={100}
                    orderBy={orderBy}
                    order={order}
                    style={{
                      width: 150,
                      background: "white",
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                    }}
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
                    column="name"
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
                  <TableCell style={{ width: 160 }}>
                    {tProjects("admin-panel-projects:table.column-est-date")}
                  </TableCell>
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
                <TableCell style={{ width: 50 }}></TableCell>
                <TableCell
                  style={{
                    width: 150,
                    left: 0,
                    background: "white",
                    position: "sticky",
                    zIndex: 999,
                  }}
                >
                  <Actions entity={entity} /> {entity?.id}
                </TableCell>
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
                        entity?.estimated_delivery_date,
                        "EEEE dd 'de' MMMM 'del' yyyy",
                        {
                          locale: es,
                        }
                      )
                    : "N/A"}
                </TableCell>
                <TableCell
                  style={{
                    minWidth: 100,
                  }}
                >
                  {entity?.est_cutting_time_in_hours} hora(s)
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
