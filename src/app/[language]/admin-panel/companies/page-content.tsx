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
  useCompanyListQuery,
  companiesQueryKeys,
} from "./queries/companies-queries";
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
import { Company } from "@/services/api/types/company";
import Link from "@/components/link";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import UserFilter from "./company-filter";
import { useRouter, useSearchParams } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { CompanyFilterType, CompanySortType } from "./company-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import { useDeleteCompanyService } from "../../../../services/api/services/companies";
import { isObjectEmpty } from "../../../../utils";

type UsersKeys = keyof Company;

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

function Actions({ entitiy }: { entitiy: Company }) {
  const [open, setOpen] = useState(false);
  const { confirmDialog } = useConfirmDialog();
  const fetchDelete = useDeleteCompanyService();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = true;
  const { t: tCompanies } = useTranslation("admin-panel-companies");

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
      title: tCompanies("admin-panel-companies:confirm.delete.title"),
      message: tCompanies("admin-panel-companies:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: CompanyFilterType | undefined = undefined;
      let sort: CompanySortType | undefined = {
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
        InfiniteData<{ nextPage: number; data: Company[] }>
      >(companiesQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: companiesQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== entitiy.id),
        })),
      };

      queryClient.setQueryData(
        companiesQueryKeys.list().sub.by({ sort, filter }).key,
        newData
      );

      await fetchDelete({
        id: entitiy.id,
      });

      location.reload();
      history.pushState(null, "", window.location.href);
    }
  };

  const mainButton = (
    <Button
      size="small"
      variant="contained"
      LinkComponent={Link}
      href={`/admin-panel/companies/edit/${entitiy.id}`}
    >
      {tCompanies("admin-panel-companies:actions.edit")}
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
                      {tCompanies("admin-panel-companies:actions.delete")}
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

function Companies() {
  const { t: tCompanies } = useTranslation("admin-panel-companies");
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

  const filter = useMemo<Partial<CompanyFilterType | undefined>>(() => {
    const filterName = searchParams.get("name");
    const filterType = searchParams.get("type");
    const filterIsActive = searchParams.get("is_active");
    const filter: Partial<CompanyFilterType> = {};
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
    useCompanyListQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as Company[]) ??
      ([] as Company[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">
              {tCompanies("admin-panel-companies:title")}
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
                href="/admin-panel/companies/create"
                color="success"
              >
                {tCompanies("admin-panel-companies:actions.create")}
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
                    column="id"
                    handleRequestSort={handleRequestSort}
                  >
                    {tCompanies("admin-panel-companies:table.column1")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 200 }}>
                    {tCompanies("admin-panel-companies:table.column2")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="name"
                    handleRequestSort={handleRequestSort}
                  >
                    {tCompanies("admin-panel-companies:table.column3")}
                  </TableSortCellWrapper>

                  <TableCell style={{ width: 80 }}>
                    {tCompanies("admin-panel-companies:table.column4")}
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
                <TableCell style={{ width: 80 }}>{entity?.type}</TableCell>
                <TableCell>{entity?.is_active ? "Sí" : "No"}</TableCell>
                <TableCell>
                  <Actions entitiy={entity} />
                </TableCell>
              </>
            )}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(Companies, {
  roles: [RoleEnum.Admin, RoleEnum.Staff],
});
