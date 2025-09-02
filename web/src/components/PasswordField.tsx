import { useState } from "react";
import { TextField, IconButton, InputAdornment } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function PasswordField({
  label = "Password",
  value,
  onChange,
}: Props) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      fullWidth
      label={label}
      type={show ? "text" : "password"}
      variant="filled"
      margin="normal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShow((p) => !p)} edge="end">
              {show ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}
