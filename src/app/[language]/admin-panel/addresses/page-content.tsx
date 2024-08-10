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
  useAddressListQuery,
  addressesQueryKeys,
} from "./queries/addresses-queries";
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
import { Address } from "@/services/api/types/address";
import Link from "@/components/link";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import CompanyFilter from "./address-filter";
import { useRouter, useSearchParams } from "next/navigation";
import TableSortLabel from "@mui/material/TableSortLabel";
import { AddressFilterType, AddressSortType } from "./address-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";
import { useDeleteAddressService } from "../../../../services/api/services/addresses";
import { isObjectEmpty } from "../../../../utils";

type UsersKeys = keyof Address;

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

function Actions({ entitiy }: { entitiy: Address }) {
  const [open, setOpen] = useState(false);
  const { confirmDialog } = useConfirmDialog();
  const fetchDelete = useDeleteAddressService();
  const queryClient = useQueryClient();
  const anchorRef = useRef<HTMLDivElement>(null);
  const canDelete = true;
  const { t: tAddresses } = useTranslation("admin-panel-addresses");

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
      title: tAddresses("admin-panel-addresses:confirm.delete.title"),
      message: tAddresses("admin-panel-addresses:confirm.delete.message"),
    });

    if (isConfirmed) {
      setOpen(false);

      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: AddressFilterType | undefined = undefined;
      let sort: AddressSortType | undefined = {
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
        InfiniteData<{ nextPage: number; data: Address[] }>
      >(addressesQueryKeys.list().sub.by({ sort, filter }).key);

      await queryClient.cancelQueries({
        queryKey: addressesQueryKeys.list().key,
      });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== entitiy.id),
        })),
      };

      queryClient.setQueryData(
        addressesQueryKeys.list().sub.by({ sort, filter }).key,
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
      href={`/admin-panel/addresses/edit/${entitiy.id}`}
    >
      {tAddresses("admin-panel-addresses:actions.edit")}
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
                      {tAddresses("admin-panel-addresses:actions.delete")}
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

function Addresses() {
  const { t: tAddresses } = useTranslation("admin-panel-addresses");
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

  const filter = useMemo<Partial<AddressFilterType | undefined>>(() => {
    const filterCustomerId = searchParams.get("customer_id");
    const filterProviderId = searchParams.get("provider_id");
    const filter: Partial<AddressFilterType> = {};
    if (filterCustomerId) {
      filter.customer_id = filterCustomerId;
    }
    if (filterProviderId) {
      filter.provider_id = filterProviderId;
    }

    return isObjectEmpty(filter) ? undefined : filter;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useAddressListQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as Address[]) ??
      ([] as Address[]);
    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs>
            <Typography variant="h3">
              {tAddresses("admin-panel-addresses:title")}
            </Typography>
          </Grid>
          <Grid container item xs="auto" wrap="nowrap" spacing={2}>
            <Grid item xs="auto">
              <CompanyFilter />
            </Grid>
            <Grid item xs="auto">
              <Button
                variant="contained"
                LinkComponent={Link}
                href="/admin-panel/addresses/create"
                color="success"
              >
                {tAddresses("admin-panel-addresses:actions.create")}
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
                    {tAddresses("admin-panel-addresses:table.column1")}
                  </TableSortCellWrapper>
                  <TableCell style={{ width: 160 }}>
                    {tAddresses("admin-panel-addresses:table.column2")}
                  </TableCell>
                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column3")}
                  </TableCell>

                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column4")}
                  </TableCell>
                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column5")}
                  </TableCell>
                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column6")}
                  </TableCell>
                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column7")}
                  </TableCell>
                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column8")}
                  </TableCell>
                  <TableCell>
                    {tAddresses("admin-panel-addresses:table.column9")}
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
                <TableCell>{entity?.id}</TableCell>
                <TableCell>{entity?.street}</TableCell>
                <TableCell>{entity?.no_ext}</TableCell>
                <TableCell>
                  {entity?.no_int ? entity?.no_int : "N/A  "}
                </TableCell>
                <TableCell>{entity?.neighborhood}</TableCell>
                <TableCell>{entity?.postal_code}</TableCell>
                <TableCell>{entity?.town}</TableCell>
                <TableCell>{entity?.state}</TableCell>
                <TableCell>
                  {entity?.extra_info ? entity?.extra_info : "N/A"}
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

export default withPageRequiredAuth(Addresses, {
  roles: [RoleEnum.Admin, RoleEnum.Staff],
});
