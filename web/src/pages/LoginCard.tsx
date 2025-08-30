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
    <Box minHeight="100dvh" display="grid" sx={{ placeItems: "center", p: 2 }}>
      <Card sx={{ width: 360 }}>
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
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
  );
}
