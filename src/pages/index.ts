import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const News = lazy(() => import("./News"));
const Tags = lazy(() => import("./Tags"));
const Blog = lazy(() => import("./Blog"));
const Layout = lazy(() => import("./Layout"));
const OurTeam = lazy(() => import("./OurTeam"));
const Profile = lazy(() => import("./Profile"));
const Recource = lazy(() => import("./Recource"));
const Settings = lazy(() => import("./Settings"));
const NotFound = lazy(() => import("./Not-Found"));
const Publisher = lazy(() => import("./Publisher"));
const SignIn = lazy(() => import("./Auth/Sign-In"));
const OurResource = lazy(() => import("./OurResource"));
const OurCategory = lazy(() => import("./OurCategory"));
const OurPartners = lazy(() => import("./OurPartners"));
const NewsCategory = lazy(() => import("./NewsCategory"));
const ResourceCategory = lazy(() => import("./ResourceCategory"));

export {
  Home,
  News,
  Tags,
  Blog,
  SignIn,
  Layout,
  OurTeam,
  Profile,
  Recource,
  NotFound,
  Settings,
  Publisher,
  OurResource,
  OurCategory,
  OurPartners,
  NewsCategory,
  ResourceCategory,
};
