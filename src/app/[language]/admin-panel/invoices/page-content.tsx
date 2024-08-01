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
  useInvoiceListQuery,
  invoicesQueryKeys,
} from "./queries/invoices-queries";
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
import { Invoice } from "@/services/api/types/invoice";
import Link from "@/components/link";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import InvoiceFilter from "./invoice-filter";
import { useRouter, useSearchParams } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { InvoiceFilterType, InvoiceSortType } from "./invoice-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import { useDeleteInvoiceService } from "../../../../services/api/services/invoices";
import { isObjectEmpty } from "../../../../utils";

type UsersKeys = keyof Invoice;

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

function Actions({ entitiy }: { entitiy: Invoice }) {
  const [open, setOpen] = useState(false);
  const { confirmDialog } = useConfirmDialog();
  const fetchDelete = useDeleteInvoiceService();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = true;
  const { t: tInvoices } = useTranslation("admin-panel-invoices");

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
      title: tInvoices("admin-panel-invoices:confirm.delete.title"),
      message: tInvoices("admin-panel-invoices:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: InvoiceFilterType | undefined = undefined;
      let sort: InvoiceSortType | undefined = {
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
        InfiniteData<{ nextPage: number; data: Invoice[] }>
      >(invoicesQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: invoicesQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== entitiy.id),
        })),
      };

      queryClient.setQueryData(
        invoicesQueryKeys.list().sub.by({ sort, filter }).key,
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
      href={`/admin-panel/invoices/edit/${entitiy.id}`}
    >
      {tInvoices("admin-panel-invoices:actions.edit")}
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
                      {tInvoices("admin-panel-invoices:actions.delete")}
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

function Invoices() {
  const { t: tInvoices } = useTranslation("admin-panel-invoices");
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

  const filter = useMemo<Partial<InvoiceFilterType | undefined>>(() => {
    const filterRFC = searchParams.get("rfc");
    const filter: Partial<InvoiceFilterType> = {};
    if (filterRFC) {
      filter.rfc = filterRFC;
    }

    return isObjectEmpty(filter) ? undefined : filter;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useInvoiceListQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as Invoice[]) ??
      ([] as Invoice[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="md">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">
              {tInvoices("admin-panel-invoices:title")}
            </Typography>
          </Grid>
          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            <Grid item xs="auto">
              <InvoiceFilter />
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href="/admin-panel/invoices/create"
                color="success"
              >
                {tInvoices("admin-panel-invoices:actions.create")}
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
                    {tInvoices("admin-panel-invoices:table.column1")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 200 }}>
                    {tInvoices("admin-panel-invoices:table.column2")}
                  </TableCell>
                  <TableSortCellWrapper
                    orderBy={orderBy}
                    order={order}
                    column="name"
                    handleRequestSort={handleRequestSort}
                  >
                    {tInvoices("admin-panel-invoices:table.column3")}
                  </TableSortCellWrapper>

                  <TableCell style={{ width: 80 }}>
                    {tInvoices("admin-panel-invoices:table.column4")}
                  </TableCell>
                  <TableCell style={{ width: 80 }}>
                    {tInvoices("admin-panel-invoices:table.column5")}
                  </TableCell>
                  <TableCell style={{ minWidth: 120 }}>
                    {tInvoices("admin-panel-invoices:table.column6")}
                  </TableCell>
                  <TableCell>
                    {tInvoices("admin-panel-invoices:table.column7")}
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
                <TableCell style={{ width: 80 }}>{entity?.rfc}</TableCell>
                <TableCell>{entity?.postal_code}</TableCell>
                <TableCell>{entity?.email}</TableCell>
                <TableCell style={{ width: 80 }}>
                  {entity?.invoice_use}
                </TableCell>
                <TableCell>
                  {entity?.customer_id ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      LinkComponent={Link}
                      href={`/admin-panel/customers/edit/${entity?.customer_id}`}
                    >
                      Ver
                    </Button>
                  ) : (
                    "N/A"
                  )}
                </TableCell>
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

export default withPageRequiredAuth(Invoices, {
  roles: [RoleEnum.Admin, RoleEnum.Staff],
});
