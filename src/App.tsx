import { storage } from "./services";
import { Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  News,
  Layout,
  SignIn,
  Profile,
  NotFound,
  Settings,
  Articles,
  Category,
} from "./pages";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const token = JSON.parse(storage.get("data") as string);
  const lang: string = location.pathname.split("/")[1];
  const [correctLang, setCorrectLang] = useState<string>("uz");

  useEffect(() => {
    if (!token) navigate(`${correctLang}/pages/sign-in`);

    if (lang === "") navigate("uz");

    if (lang === "uz" || lang === "ru" || lang === "en") setCorrectLang(lang);
  }, [lang]);

  return (
    <Suspense>
      <Routes>
        <Route path={`/${correctLang}`} element={<Layout />}>
          <Route path={`/${correctLang}`} element={<Home />} />
          <Route path={`/${correctLang}/pages/news`} element={<News />} />
          <Route path={`/${correctLang}/pages/profile`} element={<Profile />} />
          <Route
            element={<Category />}
            path={`/${correctLang}/pages/category`}
          />
          <Route
            element={<Articles />}
            path={`/${correctLang}/pages/articles`}
          />
          <Route
            element={<Settings />}
            path={`/${correctLang}/pages/settings`}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
        <Route path={`${correctLang}/pages/sign-in`} element={<SignIn />} />
      </Routes>
    </Suspense>
  );
}

export default App;
