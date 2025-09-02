import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, CssBaseline, GlobalStyles } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { theme } from "./app/theme";

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              background:
                "radial-gradient(1200px 600px at 10% -20%, #cfe7f9, transparent), #f6f7f9;",
            },
          }}
        />
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
