import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  CircularProgress,
  Stack,
  IconButton,
} from "@mui/material";
import { listAlias, signup } from "../api/user";
import PasswordField from "../components/PasswordField";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import sideImg from "../assets/firstLook.png";

type Alias = { id_alias: string; alias_name: string };

type Props = {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
};

function pickTwoRandomUnique(items: Alias[]): [Alias | null, Alias | null] {
  const n = items.length;
  if (n === 0) return [null, null];
  if (n === 1) return [items[0], null];
  const i = Math.floor(Math.random() * n);
  let j = Math.floor(Math.random() * n);
  while (j === i) j = Math.floor(Math.random() * n);

  return Math.random() < 0.5 ? [items[i], items[j]] : [items[j], items[i]];
}

export default function SignupCard({ onSuccess, onSwitchToLogin }: Props) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [aliases, setAliases] = useState<Alias[]>([]);
  const [aliasId, setAliasId] = useState<string>("");
  const [aliasLoading, setAliasLoading] = useState(true);
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [roll, setRoll] = useState(0);

  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      setAliasLoading(true);
      setAliasError(null);
      try {
        const data = await listAlias();
        if (!alive) return;
        setAliases(data);
      } catch (e: any) {
        if (!alive) return;
        setAliasError(e?.message || "Gagal memuat alias");
      } finally {
        if (!alive) return;
        setAliasLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const [aliasA, aliasB] = useMemo(
    () => pickTwoRandomUnique(aliases),
    [aliases, roll]
  );

  const handleChoose = (a: Alias | null) => {
    if (!a) return;
    setAliasId(a.id_alias);
  };

  const submit = async () => {
    setErr(null);
    setLoading(true);
    try {
      const id_alias = aliasId;
      if (!name || !username || !email || !password || !confirm)
        throw new Error("All fields are required");
      if (password !== confirm)
        throw new Error("Password confirmation does not match");
      if (!aliasId) throw new Error("Please select an alias first");

      const payload = {
        name,
        username,
        email,
        password,
        id_alias,
      };

      await signup(payload);

      onSuccess();
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const isSelected = (a: Alias | null) => !!a && a.id_alias === aliasId;

  return (
    <Box
      minHeight="100dvh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ pt: 4, pb: 4, px: 2, transition: "all .25s ease" }}
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
            width: { xs: "100%", sm: 500 },
            p: 2,
            order: { xs: 1, md: 1 },
          }}
        >
          <CardContent>
            <Typography variant="h5" mb={2}>
              SIGN UP
            </Typography>

            <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={name}
              variant="filled"
              onChange={(e) => setName(e.target.value)}
              sx={{ mt: 0 }}
            />

            <TextField
              fullWidth
              label="Username"
              margin="normal"
              value={username}
              variant="filled"
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mt: 0 }}
            />

            <TextField
              fullWidth
              label="Email"
              margin="normal"
              value={email}
              variant="filled"
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 0 }}
            />

            <PasswordField
              label="Password"
              value={password}
              onChange={setPassword}
            />

            <PasswordField
              label="Confirm Password"
              value={confirm}
              onChange={setConfirm}
            />

            <Typography variant="subtitle2" mt={2} color="text.primary">
              Select an Alias
            </Typography>

            {aliasLoading ? (
              <Stack direction="row" alignItems="center" gap={1} mt={1}>
                <CircularProgress size={18} />
              </Stack>
            ) : aliasError ? (
              <Alert severity="error" sx={{ mt: 1 }}>
                {aliasError}
              </Alert>
            ) : (
              <Stack
                direction="row"
                spacing={1}
                mt={1}
                alignItems="center"
                sx={{ width: "100%" }} 
              >
                <Stack
                  direction="row"
                  flexWrap="wrap"
                  sx={{ flex: 1, minWidth: 0 }} 
                >
                  <Button
                    variant={isSelected(aliasA) ? "contained" : "outlined"}
                    disabled={!aliasA}
                    onClick={() => handleChoose(aliasA)}
                    sx={{ fontSize: "0.75rem", px: 1.5, py: 0.5, m: 0.5 }}
                  >
                    {aliasA ? aliasA.alias_name : "—"}
                  </Button>
                  
                  <Button
                    variant={isSelected(aliasB) ? "contained" : "outlined"}
                    disabled={!aliasB}
                    onClick={() => handleChoose(aliasB)}
                    sx={{ fontSize: "0.75rem", px: 1.5, py: 0.5, m: 0.5 }}
                  >
                    {aliasB ? aliasB.alias_name : "—"}
                  </Button>
                </Stack>

                <IconButton
                  onClick={() => setRoll((r) => r + 1)}
                  sx={{
                    ml: "auto",
                    flexShrink: 0, 
                    backgroundColor: (t) => t.custom.btn.bgPrimary,
                    color: (t) => t.custom.btn.textPrimary,
                    "&:hover": {
                      backgroundColor: (t) => t.custom.btn.bgPrimary,
                      filter: "brightness(0.95)",
                      boxShadow: (t) => `0 8px 24px ${t.custom.shadowColor}`,
                    },
                  }}
                >
                  <ShuffleIcon fontSize="small"/>
                </IconButton>
              </Stack>
            )}

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
              {loading ? "Processing…" : "Create"}
            </Button>

            <Typography mt={2} variant="body2">
              Already have an account?{" "}
              <Link component="button" onClick={onSwitchToLogin}>
                Login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
