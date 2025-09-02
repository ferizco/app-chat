import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
} from "@mui/material";
import { login } from "../api/user";
import PasswordField from "../components/PasswordField";
import sideImg from "../assets/firstLook.png";

type Props = {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
};

export default function LoginCard({ onSuccess, onSwitchToSignup }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      if (!username || !password) {
        setErr("Username and password are required");
        return;
      }
      const payload = {
        username,
        password,
      };
      await login(payload);
      localStorage.setItem("is_logged_in", "true");
      onSuccess();
    } catch (e: any) {
      setErr(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minHeight="100dvh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ p: 2 }}
    >
      <Box
        sx={{
          display: "flex",
          gap: { xs: 2, md: 8 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "center" },
          width: "100%",
          maxWidth: 980,
        }}
      >
        {/* Gambar: di mobile 100px, di desktop 500px */}
        <Box
          component="img"
          src={sideImg}
          alt="Login Illustration"
          sx={{
            width: { xs: 200, md: 500 },
            maxWidth: "100%",
            borderRadius: 2,
            order: { xs: 0, md: 0 },
          }}
        />
        <Card
          sx={{
            width: { xs: "100%", sm: 380 },
            p: 2,
            order: { xs: 1, md: 1 },
          }}
        >
          <CardContent>
            <Typography variant="h5" mb={2}>
              LOGIN
            </Typography>

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="filled"
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
            />

            {err && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {err}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={loading}
              onClick={submit}
            >
              {loading ? "Memproses…" : "Login"}
            </Button>

            <Typography mt={2} variant="body2">
              Don’t have an account?{" "}
              <Link component="button" onClick={onSwitchToSignup}>
                Sign up
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
