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
  useProcessListQuery,
  processesQueryKeys,
} from "./queries/process-queries";
import { TableVirtuoso } from "react-virtuoso";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import TableComponents from "@/components/table/table-components";
import ButtonGroup from "@mui/material/ButtonGroup";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { Process } from "@/services/api/types/process";
import Link from "@/components/link";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import UserFilter from "./process-filter";
import { useRouter, useSearchParams } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { ProcessFilterType, ProcessSortType } from "./process-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import { useDeleteProcessService } from "../../../../services/api/services/processes";
import { isObjectEmpty } from "../../../../utils";
import useAuth from "../../../../services/auth/use-auth";

type UsersKeys = keyof Process;

const TableCellLoadingContainer = styled(TableCell)(() => ({
  padding: 0,
}));

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: UsersKeys;
    order: SortEnum;
    column: UsersKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: UsersKeys
    ) => void;
  }>
) {
  return (
    <TableCell
      style={{ width: props.width }}
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

function Actions({ entitiy }: { entitiy: Process }) {
  const [open, setOpen] = useState(false);
  const { confirmDialog } = useConfirmDialog();
  const fetchDelete = useDeleteProcessService();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = true;
  const { t: tProcesses } = useTranslation("admin-panel-processes");

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
      title: tProcesses("admin-panel-processes:confirm.delete.title"),
      message: tProcesses("admin-panel-processes:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: ProcessFilterType | undefined = undefined;
      let sort: ProcessSortType | undefined = {
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
        InfiniteData<{ nextPage: number; data: Process[] }>
      >(processesQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: processesQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== entitiy.id),
        })),
      };

      queryClient.setQueryData(
        processesQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchDelete({
        id: entitiy.id,
      });
    }
  };

  const mainButton = (
    <Button
      size="small"
      variant="contained"
      LinkComponent={Link}
      href={`/admin-panel/processes/edit/${entitiy.id}`}
    >
      {tProcesses("admin-panel-processes:actions.edit")}
    </Button>
  );

  return (
    <>
      {[!canDelete].every(Boolean) ? (
        mainButton
      ) : (
        <ButtonGroup
          variant="contained"
          ref={anchorRef}
          aria-label="split button"
          size="small"
        >
          {mainButton}

          <Button
            size="small"
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
          zIndex: 1,
          minWidth: 100,
        }}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
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
                      {tProcesses("admin-panel-processes:actions.delete")}
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

function Processes() {
  const { t: tProcesses } = useTranslation("admin-panel-processes");
  const { user } = useAuth();
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

  const filter = useMemo<Partial<ProcessFilterType | undefined>>(() => {
    const filterName = searchParams.get("name");
    const filterId = searchParams.get("id");
    const filterType = searchParams.get("type");
    const filterProjectId = searchParams.get("project_id");
    const filter: Partial<ProcessFilterType> = {};
    if (filterName) {
      filter.name = filterName;
    }

    if (filterId) {
      filter.id = filterId;
    }
    if (filterProjectId) {
      filter.project_id = filterProjectId;
    }
    if (filterType) {
      filter.type = filterType;
    }

    return isObjectEmpty(filter) ? undefined : filter;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useProcessListQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data.items) as Process[]) ??
      ([] as Process[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth={false}>
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">
              {tProcesses("admin-panel-processes:title")}
            </Typography>
          </Grid>
          {user?.role !== RoleEnum.Operator && (
            <Grid container item xs="auto" wrap="nowrap" spacing={2}>
              <Grid item xs="auto">
                <UserFilter />
              </Grid>
              <Grid item xs="auto">
                <Button
                  variant="contained"
                  LinkComponent={Link}
                  href="/admin-panel/processes/create"
                  color="success"
                >
                  {tProcesses("admin-panel-processes:actions.create")}
                </Button>
              </Grid>
            </Grid>
          )}
        </Grid>

        <Grid item xs={12} mb={2}>
          <TableVirtuoso
            style={{ height: "90%", minHeight: 750 }}
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
                    column="id"
                    handleRequestSort={handleRequestSort}
                  >
                    {tProcesses("admin-panel-processes:table.column1")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 200 }}>
                    {tProcesses("admin-panel-processes:table.column2")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="name"
                    handleRequestSort={handleRequestSort}
                  >
                    {tProcesses("admin-panel-processes:table.column3")}
                  </TableSortCellWrapper>
                  <TableCell>
                    {tProcesses("admin-panel-processes:table.column4")}
                  </TableCell>
                  <TableCell style={{ width: 100 }}>Acciones</TableCell>
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
                <TableCell style={{ width: 100 }}>{entity?.id}</TableCell>
                <TableCell>{entity?.name}</TableCell>
                <TableCell style={{ width: 50 }}>
                  {entity?.file ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      LinkComponent={Link}
                      target="_blank"
                      href={entity?.file}
                    >
                      Ver
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
                <TableCell style={{ width: 50 }}>
                  {tProcesses(`admin-panel-processes:types.${entity?.type}`)}
                </TableCell>

                <TableCell>
                  {user?.role !== RoleEnum.Operator && (
                    <Actions entitiy={entity} />
                  )}
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Processes, {
  roles: [RoleEnum.Admin, RoleEnum.Staff, RoleEnum.Operator],
});
