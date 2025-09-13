import { storage } from "./services";
import { Suspense, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  News,
  Tags,
  Layout,
  SignIn,
  Profile,
  NotFound,
  Settings,
  NewsCategory,
  ResourceCategory,
  OurCategory,
  OurPartners,
  OurTeam,
  Publisher,
  Blog,
  Recource,
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
            element={<NewsCategory />}
            path={`/${correctLang}/pages/news-category`}
          />
          <Route
            element={<ResourceCategory />}
            path={`/${correctLang}/pages/resource-category`}
          />
          <Route
            element={<Recource />}
            path={`/${correctLang}/pages/resource`}
          />
          <Route
            element={<Publisher />}
            path={`/${correctLang}/pages/publisher`}
          />
          <Route
            element={<OurCategory />}
            path={`/${correctLang}/pages/our-category`}
          />
          <Route
            element={<OurTeam />}
            path={`/${correctLang}/pages/our-team`}
          />
          <Route element={<Blog />} path={`/${correctLang}/pages/blog`} />
          <Route
            element={<OurPartners />}
            path={`/${correctLang}/pages/our-partners`}
          />
          <Route element={<Tags />} path={`/${correctLang}/pages/tags`} />
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
