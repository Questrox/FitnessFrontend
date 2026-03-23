import { AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItemButton, ListItemText, Typography, Tooltip, Avatar, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import PersonIcon from "@mui/icons-material/Person";
import { Logout } from "@mui/icons-material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import LoginModal from "./LoginModal";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const { user, logout } = useAuth()
  const theme = useTheme()
  const navigate = useNavigate()

  const navItems = [
    { name: "Главная", path: "/" },
    { name: "Абонементы", path: "/memberships" },
    { name: "Тренировки", path: "/trainings" },
    { name: "Расписание", path: "/schedule" },
    { name: "Наша команда", path: "/team" },
    { name: "Панель администратора", path: "/admin" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
    <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    <AppBar position="sticky" elevation={1} color="default">
      <Toolbar sx={{ justifyContent: "space-between", minHeight: 80, position: "relative" }}>
        {/* Logo */}
        <Box
          component={RouterLink}
          to="/"
          sx={{ display: "flex", alignItems: "center", gap: 1.5, textDecoration: "none" }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s",
              '&:hover': { transform: 'scale(1.1)' }
            }}
          >
            <FitnessCenterIcon sx={{ color: "primary.contrastText" }} />
          </Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "primary.main"
            }}
          >
            FitClub
          </Typography>
        </Box>

        {/* Desktop nav */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, position: "absolute", left: "50%", transform: "translateX(-50%)", zIndex: 1, }}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              component={RouterLink}
              to={item.path}
              variant={isActive(item.path) ? "contained" : "text"}
              color={isActive(item.path) ? "primary" : "inherit"}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 500 }}
            >
              {item.name}
            </Button>
          ))}
        </Box>

        {/* Right side */}
        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2, alignItems: "center" }}>
            {user ? ( <>
          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Tooltip title={user.userName}>
              <Avatar sx={{ bgcolor: "#fff", color: theme.palette.primary.main, width: 38, height: 38, mr: 1.5 }}>
                {user.userName!.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Typography sx={{ fontWeight: 500, mr: 1, display: { xs: "none", sm: "block" } }}>
              {user.userName!.charAt(0).toUpperCase() + user.userName!.slice(1)}
            </Typography>
            <IconButton
              color="inherit"
              onClick={() => {
                navigate("/")
                setTimeout(() => logout(), 200); //Чтобы успел выполниться переход на главную
              }}
              sx={{ ml: 1 }}
            >
              <Logout />
            </IconButton>
          </Box>
        
          <Button
            component={RouterLink}
            to="/profile"
            variant="outlined"
            color="primary"
            startIcon={<PersonIcon />}
            sx={{ borderWidth: 2, textTransform: "none" }}
          >
            Профиль
          </Button>
            </>) : (
          <Button variant="contained" color="primary" sx={{ px: 3, textTransform: "none" }} onClick={() => setLoginOpen(true)}>
            Вход
          </Button>
            )}
        </Box>

        {/* Mobile button */}
        <IconButton
          sx={{ display: { md: "none" } }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
      >
        <Box sx={{ width: 250 }} role="presentation">
          <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                component={RouterLink}
                to={item.path}
                selected={isActive(item.path)}
                onClick={() => setMobileOpen(false)}
              >
                <ListItemText primary={item.name} />
              </ListItemButton>
            ))}
            <ListItemButton
              component={RouterLink}
              to="/profile"
              selected={isActive("/profile")}
              onClick={() => setMobileOpen(false)}
            >
              <PersonIcon sx={{ mr: 1 }} />
              <ListItemText primary="Profile" />
            </ListItemButton>
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => setLoginOpen(true)}
              >
                Sign In
              </Button>
            </Box>
          </List>
        </Box>
      </Drawer>
    </AppBar>
    </>
  );
}

export default Header