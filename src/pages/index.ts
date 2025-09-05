import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const News = lazy(() => import("./News"));
const Layout = lazy(() => import("./Layout"));
const Profile = lazy(() => import("./Profile"));
const Settings = lazy(() => import("./Settings"));
const Articles = lazy(() => import("./Articles"));
const Category = lazy(() => import("./Category"));
const NotFound = lazy(() => import("./Not-Found"));
const SignIn = lazy(() => import("./Auth/Sign-In"));

export {
  Home,
  News,
  SignIn,
  Layout,
  Profile,
  NotFound,
  Settings,
  Articles,
  Category,
};
