import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./landing_page.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import PendingPage from "./pages/PendingPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/success/" element={<SuccessPage />} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/pending/" element={<PendingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
