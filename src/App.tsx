import { Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Home,
  News,
  Layout,
  SignIn,
  Profile,
  NotFound,
  Settings,
  Articles,
} from "./pages";

function App() {
  return (
    <Suspense>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pages/news" element={<News />} />
            <Route path="/pages/profile" element={<Profile />} />
            <Route path="/pages/articles" element={<Articles />} />
            <Route path="/pages/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
          <Route path="auth/sign-in" element={<SignIn />} />
        </Routes>
      </BrowserRouter>
    </Suspense>
  );
}

export default App;
