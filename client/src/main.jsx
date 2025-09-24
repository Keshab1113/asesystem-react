import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { persistor, store } from "./redux/store.js";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./lib/language-context.js";
import { ToastProvider } from "./hooks/ToastContext.js";
import { ExamProvider } from "./lib/ExamContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <LanguageProvider>
            <ToastProvider>
              <ExamProvider>
            <App />
            </ExamProvider>
            </ToastProvider>
          </LanguageProvider>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </StrictMode>
);
