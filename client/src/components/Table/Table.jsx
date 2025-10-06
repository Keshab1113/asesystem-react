import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import Paper from "@mui/material/Paper";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const columns = [
  { field: "id", headerName: "ID", width: 70 },
  { field: "firstName", headerName: "First name", width: 130 },
  { field: "lastName", headerName: "Last name", width: 130 },
  {
    field: "age",
    headerName: "Age",
    type: "number",
    width: 90,
  },
  {
    field: "fullName",
    headerName: "Full name",
    description: "This column has a value getter and is not sortable.",
    sortable: false,
    width: 160,
    valueGetter: (value, row) => `${row.firstName || ""} ${row.lastName || ""}`,
  },
];

const rows = [
  { id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
  { id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
  { id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
  { id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
  { id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
  { id: 6, lastName: "Melisandre", firstName: null, age: 150 },
  { id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
  { id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
  { id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
];

const paginationModel = { page: 0, pageSize: 5 };

export default function DataTable({ header, data }) {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // 🔄 Detect changes in theme (from your ToggleTheme)
  React.useEffect(() => {
    const currentTheme = localStorage.getItem("theme");
    setIsDarkMode(currentTheme === "dark");

    // Listen for theme changes (when user toggles theme)
    const observer = new MutationObserver(() => {
      const newTheme = localStorage.getItem("theme");
      setIsDarkMode(newTheme === "dark");
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // 🎨 Create MUI theme based on your toggle
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: isDarkMode ? "dark" : "light",
          primary: { main: "#2196f3" },
        },
      }),
    [isDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Paper
        sx={{
          height: 'auto',
          width: "100%",
          margin: "20px auto",
          border: `1px solid ${theme.palette.mode === "dark" ? "#0a0a0a" : "#f0ebeb"}`,
          boxShadow:"none",
          borderRadius: 2,
          pt: 2,
          backgroundColor: theme.palette.mode === "dark" ? "#0a0a0a" : "#fff",
          transition: "background-color 0.3s ease",
          overflowX: "auto", // ✅ Allow horizontal scrolling
        }}
        elevation={3}
      >
        {/* <div style={{ minWidth: "1000px" }}> */}
          {" "}
          {/* ✅ Force horizontal scroll context */}
          <DataGrid
            autoHeight
            rows={data || rows}
            columns={header || columns}
            initialState={{ pagination: { paginationModel } }}
            pageSizeOptions={[5, 10]}
            columnHeaderHeight="auto"
            checkboxSelection={false}
            sx={{
              border: 0,
              color: theme.palette.mode === "dark" ? "#e0e0e0" : "#000",
              "& .MuiDataGrid-cell": {
                borderBottom: `0px solid ${
                  theme.palette.mode === "dark" ? "#333" : "#e0e0e0"
                }`,
                // backgroundColor: `${
                //   theme.palette.mode === "dark" ? "#333" : "#e0e0e0"
                // }`
                // textTransform: 'capitalize'
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1e1e1e" : "#e3f2fd",
                color: theme.palette.mode === "dark" ? "#90caf9" : "#0d47a1",
              },
              "& .MuiDataGrid-footerContainer": {
                backgroundColor:
                  theme.palette.mode === "dark" ? "#303030" : "#e3f2fd",
              },
            }}
          />
        {/* </div> */}
      </Paper>
    </ThemeProvider>
  );
}
