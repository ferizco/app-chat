import { useEffect, useState } from "react";
import LoginCard from "./pages/LoginCard";
import SignupCard from "./pages/SignupCard";
import Home from "./pages/Home";
import { Box, CircularProgress } from "@mui/material";

type Mode = "checking" | "login" | "signup" | "home";

export default function App() {
  const [mode, setMode] = useState<Mode>("checking");

  useEffect(() => {
    const loggedIn = localStorage.getItem("is_logged_in") === "true";
    setMode(loggedIn ? "home" : "login");

    // optional: sync antar-tab
    const onStorage = (e: StorageEvent) => {
      if (e.key === "is_logged_in") {
        const v = e.newValue === "true";
        setMode(v ? "home" : "login");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (mode === "checking") {
    return (
      <Box minHeight="100dvh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (mode === "login") {
    return (
      <LoginCard
        onSuccess={() => { localStorage.setItem("is_logged_in","true"); setMode("home"); }}
        onSwitchToSignup={() => setMode("signup")}
      />
    );
  }

  if (mode === "signup") {
    return (
      <SignupCard
        onSuccess={() => { localStorage.setItem("is_logged_in","true"); setMode("home"); }}
        onSwitchToLogin={() => setMode("login")}
      />
    );
  }

  return (
    <Home
      onLogout={() => { localStorage.removeItem("is_logged_in"); setMode("login"); }}
    />
  );
}
