import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components";
import { RequestFormPage } from "./pages/RequestFormPage";
import { RequestListPage } from "./pages/RequestListPage";

export const App = () => (
  <BrowserRouter>
    <Shell>
      <Routes>
        <Route path="/" element={<RequestListPage />} />
        <Route path="/requests/new" element={<RequestFormPage />} />
        <Route path="/requests/:id/edit" element={<RequestFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  </BrowserRouter>
);

