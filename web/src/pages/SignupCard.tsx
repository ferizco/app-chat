import { useState } from "react";
import { Box, Card, CardContent, TextField, Button, Typography, Alert, Link } from "@mui/material";
// import { signup } from "../api/auth";
import { setCookie } from "../app/cookies.ts";

type Props = {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
};

export default function SignupCard({ onSuccess, onSwitchToLogin }: Props) {
  const [username, setUsername] = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setErr(null); setLoading(true);
    try {
      if (!username || !email || !password) throw new Error("Semua field wajib diisi");
      setCookie("auth_token", "dummy_token_signup");
      onSuccess();
      // === kalau pakai backend ===
      // const res = await signup({ username, email, password });
      // setCookie("auth_token", res.token);
      // onSuccess();
    } catch (e: any) {
      setErr(e.message || "Signup gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minHeight="100dvh" display="grid" sx={{ placeItems: "center", p: 2 }}>
      <Card sx={{ width: 360 }}>
        <CardContent>
          <Typography variant="h5" mb={2}>Daftar</Typography>
          <TextField fullWidth label="Username" margin="normal" value={username} onChange={e=>setUsername(e.target.value)} />
          <TextField fullWidth label="Email" margin="normal" value={email} onChange={e=>setEmail(e.target.value)} />
          <TextField fullWidth label="Password" type="password" margin="normal" value={password} onChange={e=>setPassword(e.target.value)} />
          {err && <Alert severity="error" sx={{ mt: 1 }}>{err}</Alert>}
          <Button fullWidth variant="contained" sx={{ mt: 2 }} disabled={loading} onClick={submit}>
            {loading ? "Memproses…" : "Buat Akun"}
          </Button>
          <Typography mt={2} variant="body2">
            Sudah punya akun?{" "}
            <Link component="button" onClick={onSwitchToLogin}>Login</Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
