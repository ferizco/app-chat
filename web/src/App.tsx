import { useEffect, useState } from "react";
import LoginCard from "./pages/LoginCard.tsx";
import SignupCard from "./pages/SignupCard.tsx";
import Home from "./pages/Home.tsx";
import { getCookie } from "./app/cookies.ts";
import { Box, CircularProgress } from "@mui/material";

type Mode = "checking" | "login" | "signup" | "home";

export default function App() {
  const [mode, setMode] = useState<Mode>("checking");

  // Cek cookie sekali di awal
  useEffect(() => {
    const token = getCookie("auth_token");
    setMode(token ? "home" : "login");
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
        onSuccess={() => setMode("home")}
        onSwitchToSignup={() => setMode("signup")}
      />
    );
  }

  if (mode === "signup") {
    return (
      <SignupCard
        onSuccess={() => setMode("home")}
        onSwitchToLogin={() => setMode("login")}
      />
    );
  }

  // home
  return <Home onLogout={() => setMode("login")} />;
}
