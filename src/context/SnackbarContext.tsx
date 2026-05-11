import {
  Alert,
  AlertColor,
  Snackbar,
} from "@mui/material";

import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface SnackbarContextType {
  showSnackbar: (
    message: string,
    severity?: AlertColor
  ) => void;
}

const SnackbarContext =
  createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  const [message, setMessage] = useState("");

  const [severity, setSeverity] =
    useState<AlertColor>("info");

  const showSnackbar = useCallback(
    (
      text: string,
      sev: AlertColor = "info"
    ) => {
      setMessage(text);
      setSeverity(sev);
      setOpen(true);
    },
    []
  );

  return (
    <SnackbarContext.Provider
      value={{ showSnackbar }}
    >
      {children}

      <Snackbar
        open={open}
        autoHideDuration={5000}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);

  if (!context) {
    throw new Error(
      "useSnackbar must be used inside SnackbarProvider"
    );
  }

  return context;
};