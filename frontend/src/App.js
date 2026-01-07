import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Directory from "./pages/Directory";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Join from "./pages/Join";
import { useEffect } from "react";

import Events from "./pages/Events";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <div className="App min-h-screen bg-secondary/30 font-sans text-stone-900">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="events" element={<Events />} />
            <Route path="directory" element={<Directory />} />
            <Route path="join" element={<Join />} />
            <Route path="login" element={<Login />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
