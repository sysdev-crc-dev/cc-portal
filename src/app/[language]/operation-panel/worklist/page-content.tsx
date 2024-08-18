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
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { SortEnum } from "@/services/api/types/sort-type";
import { format, isPast, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale/es";
import { ProjectSortType } from "../../admin-panel/projects/project-filter-types";
import {
  useInProgressPatchRequest,
  useQAPatchRequest,
} from "../../../../services/api/services/worklist";
import ButtonGroup from "@mui/material/ButtonGroup";
import { InfinityPaginationType } from "../../../../services/api/types/infinity-pagination";
import { toZonedTime } from "date-fns-tz";

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
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const fetchPatchProgress = useInProgressPatchRequest();
  const fetchPatchQA = useQAPatchRequest();
  const { t: tProjects } = useTranslation("operation-panel-projects");

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

  const handleInProgress = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("operation-panel-projects:confirm.in-progress.title"),
      message: tProjects(
        "operation-panel-projects:confirm.in-progress.message"
      ),
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
        InfiniteData<{
          nextPage: number;
          data: InfinityPaginationType<Project>;
        }>
      >(projectsQueryKeys.list().sub.by({ sort }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            items: page?.data.items.map((item) => {
              if (item.id !== entity.id) return item;

              const newItem: Project = {
                ...item,
                status: ProjectStatus.InProgress,
              };
              return newItem;
            }),
          },
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort }).key,
        newData
      );

      await fetchPatchProgress({
        id: entity.id,
      });
    }
  };
  const handleQA = async () => {
    const isConfirmed = await confirmDialog({
      title: tProjects("operation-panel-projects:confirm.qa.title"),
      message: tProjects("operation-panel-projects:confirm.qa.message"),
      successButtonText: "Si",
      cancelButtonText: "No",
      showInput: true,
      showCuttingTime: true,
    });

    if (isConfirmed) {
      const value = typeof isConfirmed === "string" ? isConfirmed : "";
      const splitArray = value.split("|");
      const cuttingTime = Number(splitArray[0]);
      const note = splitArray[1];
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
        InfiniteData<{
          nextPage: number;
          data: InfinityPaginationType<Project>;
        }>
      >(projectsQueryKeys.list().sub.by({ sort }).key);

      await queryClient.cancelQueries({
        queryKey: projectsQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: {
            ...page.data,
            items: page?.data.items.filter((item) => item.id !== entity.id),
          },
        })),
      };

      queryClient.setQueryData(
        projectsQueryKeys.list().sub.by({ sort }).key,
        newData
      );

      await fetchPatchQA({
        id: entity.id,
        data: {
          quality_assurance_note: note,
          actual_cutting_time: cuttingTime,
        },
      });
    }
  };

  return (
    <>
      <ButtonGroup size="small" ref={anchorRef}>
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
                  {entity.status === ProjectStatus.ReadyForCutting && (
                    <MenuItem onClick={handleInProgress}>
                      {tProjects(
                        "operation-panel-projects:actions.in-progress"
                      )}
                    </MenuItem>
                  )}
                  {entity.status === ProjectStatus.InProgress && (
                    <MenuItem onClick={handleQA}>
                      {tProjects("operation-panel-projects:actions.qa")}
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
  const { t: tProjects } = useTranslation("operation-panel-projects");
  const router = useRouter();
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: UsersKeys;
  }>(() => {
    return { order: SortEnum.ASC, orderBy: "estimated_delivery_date" };
  });

  const colorByDate = (date: string) => {
    const today = isToday(new Date(date));
    const past = isPast(new Date(date));
    if (today)
      return {
        backgroundColor: "#F6E96B",
        color: "#000",
      };

    if (past) {
      return {
        backgroundColor: "#FF0000",
        color: "#fff",
      };
    }

    return {
      backgroundColor: "#BEDC74",
      color: "#1A4D2E",
    };
  };

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

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useProjectListQuery({ sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data.items) as Project[]) ??
      ([] as Project[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">
              {tProjects("operation-panel-projects:title")}
            </Typography>
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
                    {tProjects("operation-panel-projects:table.column-id")}
                  </TableSortCellWrapper>
                  <TableCell style={{ minWidth: 200 }}>
                    {tProjects("operation-panel-projects:table.column-name")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="name"
                    style={{}}
                    handleRequestSort={handleRequestSort}
                  >
                    {tProjects("operation-panel-projects:table.column-status")}
                  </TableSortCellWrapper>

                  <TableCell style={{ width: 80 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-customer"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("operation-panel-projects:table.column-file")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="estimated_delivery_date"
                    style={{}}
                    handleRequestSort={handleRequestSort}
                  >
                    {tProjects(
                      "operation-panel-projects:table.column-est-date"
                    )}
                  </TableSortCellWrapper>
                  <TableCell style={{ minWidth: 120 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-cutting-time"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-operator"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("operation-panel-projects:table.column-package")}
                  </TableCell>
                  <TableCell style={{ minWidth: 120 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-delivery-type"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("operation-panel-projects:table.column-staff")}
                  </TableCell>
                  <TableCell style={{ minWidth: 120 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-provided-by"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-materials"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-supplies"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects(
                      "operation-panel-projects:table.column-processes"
                    )}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tProjects("operation-panel-projects:table.column-notes")}
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
                    width: 50,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                ></TableCell>
                <TableCell
                  style={{
                    width: 150,
                    left: 0,
                    position: "sticky",
                    zIndex: 999,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  <Actions entity={entity} /> {entity?.id}
                </TableCell>
                <TableCell
                  style={{
                    minWidth: 200,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {entity?.name}
                </TableCell>
                <TableCell
                  style={{
                    minWidth: 100,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {tProjects(
                    `operation-panel-projects:status.${entity?.status}`
                  )}
                </TableCell>
                <TableCell
                  style={{
                    minWidth: 160,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {entity?.customer_id
                    ? `${entity?.customer?.name} ${entity?.customer?.last_name}`
                    : "N/A"}
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
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
                <TableCell
                  style={{
                    minWidth: 160,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
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
                    minWidth: 100,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {entity?.est_cutting_time_in_hours} minuto(s)
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {`${entity?.operator?.name} ${entity?.operator?.last_name}`}
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {tProjects(
                    `operation-panel-projects:package-type.${entity?.package_type}`
                  )}
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {tProjects(
                    `operation-panel-projects:delivery-type.${entity?.delivery_type}`
                  )}
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {`${entity?.employee_in_charge?.name} ${entity?.employee_in_charge?.last_name}`}
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  {tProjects(
                    `operation-panel-projects:provided-by.${entity?.material_provided_by}`
                  )}
                </TableCell>
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
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
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
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
                <TableCell
                  style={{
                    width: 80,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
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
                <TableCell
                  style={{
                    width: 200,
                    ...colorByDate(entity.estimated_delivery_date),
                  }}
                >
                  <ProjectNotes
                    entity={entity}
                    note={tProjects(
                      `operation-panel-projects:notes.${entity.status}`
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
  roles: [RoleEnum.Admin, RoleEnum.Staff, RoleEnum.Operator],
});
