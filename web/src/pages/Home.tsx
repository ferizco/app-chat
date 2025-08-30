import { Box, Button, Typography } from "@mui/material";

type Props = { onLogout: () => void };

export default function Home({ onLogout }: Props) {
  return (
    <Box p={3}>
      <Typography variant="h5">Halo, ini Home.</Typography>
      <Button sx={{ mt: 2 }} variant="outlined" onClick={() => { onLogout(); }}>
        Logout
      </Button>
    </Box>
  );
}
