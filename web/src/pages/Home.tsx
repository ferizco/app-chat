import { Box, Button, Typography } from "@mui/material";
import { logout } from "../api/user";

type Props = { onLogout: () => void };

export default function Home({ onLogout }: Props) {
  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("is_logged_in");
      onLogout();
    } catch (e: any) {
      alert(e.message || "Logout gagal"); // bisa diganti snackbar/toast
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5">Halo, ini Home.</Typography>
      <Button sx={{ mt: 2 }} variant="outlined" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
}
