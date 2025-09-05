import { useEffect, useState } from "react";
import { Box, Backdrop, CircularProgress } from "@mui/material";
import LoginCard from "./pages/LoginCard";
import SignupCard from "./pages/SignupCard";
import Home from "./pages/Home";

type Mode = "checking" | "login" | "signup" | "home";

export default function App() {
  const [mode, setMode] = useState<Mode>("checking");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const loggedIn = localStorage.getItem("is_logged_in") === "true";
    setMode(loggedIn ? "home" : "login");
  }, []);

  const goto = (next: Mode, delay = 200) => {
    setTransitioning(true);
    setTimeout(() => {
      setMode(next);
      setTimeout(() => setTransitioning(false), 50);
    }, delay);
  };

  return (
    <Box
      minHeight="100dvh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ py: 4, px: 2, position: "relative" }}
    >
      {mode === "checking" && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {mode === "login" && (
        <LoginCard
          onSuccess={() => goto("home")}
          onSwitchToSignup={() => goto("signup")}
        />
      )}

      {mode === "signup" && (
        <SignupCard
          onSuccess={() => goto("home")}
          onSwitchToLogin={() => goto("login")}
        />
      )}

      {mode === "home" && (
        <Home
          onLogout={() => {
            goto("login");
          }}
        />
      )}

      <Backdrop
        open={transitioning}
        sx={{ color: "#fff", zIndex: (t) => t.zIndex.drawer + 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Box>
  );
}
