import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Shell } from "./components";
import { InterviewPage } from "./pages/InterviewPage";
import { LoginPage } from "./pages/LoginPage";
import { RequestFormPage } from "./pages/RequestFormPage";
import { RequestListPage } from "./pages/RequestListPage";

export const App = () => (
  <BrowserRouter>
    <Shell>
      <Routes>
        <Route path="/" element={<InterviewPage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/requests" element={<RequestListPage />} />
        <Route path="/requests/new" element={<RequestFormPage />} />
        <Route path="/requests/:id/edit" element={<RequestFormPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  </BrowserRouter>
);
