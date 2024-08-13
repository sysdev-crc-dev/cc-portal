"use client";
import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { RoleEnum } from "@/services/api/types/role";
import ThemeSwitchButton from "@/components/switch-theme-button";

function ResponsiveAppBar() {
  const { t } = useTranslation("common");
  const { user, isLoaded } = useAuth();
  const { logOut } = useAuthActions();
  const [anchorElementNav, setAnchorElementNav] = useState<null | HTMLElement>(
    null
  );
  const [anchorElementUser, setAnchorElementUser] =
    useState<null | HTMLElement>(null);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElementUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElementNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElementUser(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {t("common:app-name")}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElementNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElementNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem onClick={handleCloseNavMenu} component={Link} href="/">
                <Typography textAlign="center">
                  {t("common:navigation.home")}
                </Typography>
              </MenuItem>

              {!!user?.role &&
                [RoleEnum.Admin].includes(user.role) && [
                  <MenuItem
                    key="users"
                    onClick={handleCloseNavMenu}
                    component={Link}
                    href="/admin-panel/users"
                  >
                    <Typography textAlign="center">
                      {t("common:navigation.users")}
                    </Typography>
                  </MenuItem>,
                ]}

              <MenuItem
                key="users"
                onClick={handleCloseNavMenu}
                component={Link}
                href="/admin-panel/users"
              >
                <Typography textAlign="center">
                  {t("common:navigation.users")}
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Typography
            variant="h5"
            noWrap
            component="a"
            href="/"
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            {t("common:app-name")}
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            <Button
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: "white", display: "block" }}
              component={Link}
              href="/operation-panel/worklist"
            >
              {t("common:navigation.worklist")}
            </Button>

            {!!user?.role && [RoleEnum.Admin].includes(user.role) && (
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
                component={Link}
                href="/admin-panel/users"
              >
                {t("common:navigation.users")}
              </Button>
            )}

            {!!user?.role && [RoleEnum.Admin].includes(user.role) && (
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
                component={Link}
                href="/admin-panel/employees"
              >
                {t("common:navigation.employees")}
              </Button>
            )}

            {!!user?.role &&
              [RoleEnum.Admin, RoleEnum.Staff].includes(user.role) && (
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/admin-panel/projects"
                >
                  {t("common:navigation.projects")}
                </Button>
              )}

            {!!user?.role &&
              [RoleEnum.Admin, RoleEnum.Staff].includes(user.role) && (
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/admin-panel/companies"
                >
                  {t("common:navigation.companies")}
                </Button>
              )}

            {!!user?.role &&
              [RoleEnum.Admin, RoleEnum.Staff].includes(user.role) && (
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/admin-panel/customers"
                >
                  {t("common:navigation.customers")}
                </Button>
              )}
            {!!user?.role &&
              [RoleEnum.Admin, RoleEnum.Staff].includes(user.role) && (
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/admin-panel/addresses"
                >
                  {t("common:navigation.addresses")}
                </Button>
              )}
            {!!user?.role &&
              [RoleEnum.Admin, RoleEnum.Staff].includes(user.role) && (
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/admin-panel/invoices"
                >
                  {t("common:navigation.invoices")}
                </Button>
              )}
            {!!user?.role &&
              [RoleEnum.Admin, RoleEnum.Staff].includes(user.role) && (
                <Button
                  onClick={handleCloseNavMenu}
                  sx={{ my: 2, color: "white", display: "block" }}
                  component={Link}
                  href="/admin-panel/providers"
                >
                  {t("common:navigation.providers")}
                </Button>
              )}
            <Button
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: "white", display: "block" }}
              component={Link}
              href="/admin-panel/materials"
            >
              {t("common:navigation.materials")}
            </Button>
            <Button
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: "white", display: "block" }}
              component={Link}
              href="/admin-panel/supplies"
            >
              {t("common:navigation.supplies")}
            </Button>
            <Button
              onClick={handleCloseNavMenu}
              sx={{ my: 2, color: "white", display: "block" }}
              component={Link}
              href="/admin-panel/processes"
            >
              {t("common:navigation.processes")}
            </Button>
          </Box>

          {!isLoaded ? (
            <CircularProgress color="inherit" />
          ) : user ? (
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Profile menu">
                <IconButton
                  onClick={handleOpenUserMenu}
                  sx={{ p: 0 }}
                  data-testid="profile-menu-item"
                >
                  <Avatar alt={user?.email}>
                    {user?.employee?.name[0]}
                    {user?.employee?.last_name[0]}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: 5.5 }}
                id="menu-appbar"
                anchorEl={anchorElementUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElementUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem
                  onClick={handleCloseUserMenu}
                  component={Link}
                  href="/profile"
                  data-testid="user-profile"
                >
                  <Typography textAlign="center">
                    {t("common:navigation.profile")}
                  </Typography>
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    logOut();
                    handleCloseUserMenu();
                  }}
                  data-testid="logout-menu-item"
                >
                  <Typography textAlign="center">
                    {t("common:navigation.logout")}
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ flexGrow: 0, display: { xs: "none", md: "flex" } }}>
              <ThemeSwitchButton />
              <Button
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
                component={Link}
                href="/sign-in"
              >
                {t("common:navigation.signIn")}
              </Button>
            </Box>
          )}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
            }}
          >
            <ThemeSwitchButton />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
export default ResponsiveAppBar;
