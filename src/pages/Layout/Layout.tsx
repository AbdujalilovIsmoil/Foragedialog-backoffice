import { storage } from "@/services";
import { Button } from "@/components";
import { SiteLogo } from "@/assets/images";
import { Layout as LayoutStyles } from "@/assets/styles";
import { LogoutOutlined, UserOutlined, BulbOutlined } from "@ant-design/icons";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Layout as AntdLayout,
  Avatar,
  DatePicker,
  Dropdown,
  Menu,
  Space,
  theme,
  ConfigProvider,
  Image,
} from "antd";
import {
  TagOutlined,
  HomeOutlined,
  FundOutlined,
  NotificationOutlined,
} from "@/assets/antd-design-icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useState } from "react";

const siderStyle: React.CSSProperties = {
  top: 0,
  bottom: 0,
  height: "100vh",
  overflow: "auto",
  position: "sticky",
  insetInlineStart: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

const ProfileMenu = () => {
  const navigate = useNavigate();

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === "profile") {
      navigate({
        pathname: "/uz/pages/profile",
      });
    } else if (key === "logout") {
      storage.clear();
      navigate("/uz/pages/sign-in");
    }
  };

  const items = [
    {
      key: "profile",
      label: "Profile",
      icon: <UserOutlined style={{ fontSize: "16px" }} />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined style={{ fontSize: "16px" }} />,
    },
  ];

  dayjs.extend(customParseFormat);

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      menu={{ items, onClick: handleMenuClick }}
    >
      <Button
        type="text"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        <Avatar
          size="large"
          src="https://api.dicebear.com/7.x/miniavs/svg?seed=John"
          style={{ backgroundColor: "#1677ff" }}
        />
        <span style={{ fontWeight: 500, fontSize: 16 }}>John Doe</span>
      </Button>
    </Dropdown>
  );
};

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const lang: string = location.pathname.split("/")[1];
  const pathName = location.pathname.split("/").slice(2).join("/");

  const [themeMode, setThemeMode] = useState<"light" | "dark">("light");

  const navItems = [
    { id: 1, path: "/", icon: HomeOutlined, label: "Bosh sahifa" },
    {
      id: 2,
      label: "News categoriya",
      path: `/pages/category`,
      icon: NotificationOutlined,
    },
    {
      id: 3,
      icon: FundOutlined,
      path: "/pages/resource",
      label: "Resurs kategoriya",
    },
    { id: 4, label: "Blog taglar", icon: TagOutlined, path: "/pages/tags" },
  ];

  const renderNavItems = navItems.map((el) => {
    return {
      key: el.id,
      label: el.label,
      icon: <el.icon style={{ fontSize: "18px" }} />,
    };
  });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onSelect = (key: string) => {
    const connectPathName = lang.concat(navItems[Number(key) - 1].path);
    navigate({ pathname: `/${connectPathName}` });
  };

  const dateFormat = "YYYY/MM/DD";
  const findId = navItems.find((el) => `${el.path}` === `/${pathName}`);
  const date = new Date();

  const languages = [
    { key: "uz", label: "Uzbek", flag: "🇺🇿" },
    { key: "ru", label: "Русский", flag: "🇷🇺" },
    { key: "en", label: "English", flag: "🇬🇧" },
    { key: "de", label: "Deutsch", flag: "🇩🇪" },
  ];

  const LanguageSelector = () => {
    const [currentLang, setCurrentLang] = useState(languages[0]);

    const handleMenuClick = ({ key }: { key: string }) => {
      const lang = languages.find((l) => l.key === key);
      if (lang) setCurrentLang(lang);
    };

    return (
      <Dropdown
        menu={{
          items: languages.map((lang) => ({
            key: lang.key,
            label: (
              <span style={{ fontSize: 18 }}>
                {lang.flag} {lang.label}
              </span>
            ),
          })),
          onClick: handleMenuClick,
        }}
        trigger={["click"]}
      >
        <Button type="text" size="large">
          <Space>
            <span style={{ fontSize: 18 }}>{currentLang.flag}</span>
            <span style={{ fontSize: 18 }}>{currentLang.label}</span>
          </Space>
        </Button>
      </Dropdown>
    );
  };

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ConfigProvider>
      <AntdLayout>
        <AntdLayout.Header
          style={{
            top: 0,
            zIndex: 1,
            height: "100%",
            width: "100%",
            padding: "0px 24px",
            display: "flex",
            position: "sticky",
            alignItems: "center",
            background: colorBgContainer,
            justifyContent: "space-between",
          }}
        >
          <Image src={SiteLogo} alt="foragedialog" style={{ width: "100px" }} />
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <DatePicker
              value={dayjs(date)}
              format={dateFormat}
              size="large"
              defaultValue={dayjs(new Date())}
            />
            <LanguageSelector />
            <Button type="text" icon={<BulbOutlined />} onClick={toggleTheme}>
              {themeMode === "light" ? "Dark" : "Light"}
            </Button>
            <ProfileMenu />
          </div>
        </AntdLayout.Header>

        <AntdLayout>
          <AntdLayout.Sider breakpoint="md" style={siderStyle}>
            <Menu
              theme="dark"
              mode="vertical"
              items={renderNavItems}
              style={{ flex: 1, fontSize: "16px" }}
              onSelect={(info) => onSelect(info.key)}
              defaultSelectedKeys={[String(findId?.id)]}
            />
          </AntdLayout.Sider>

          <AntdLayout.Content
            style={{ padding: "24px 16px", overflow: "initial" }}
          >
            <LayoutStyles
              padding="24px"
              minHeight="100vh"
              borderRadius={borderRadiusLG}
              backgroundColor={colorBgContainer}
            >
              <Outlet />
            </LayoutStyles>
          </AntdLayout.Content>
        </AntdLayout>
      </AntdLayout>
    </ConfigProvider>
  );
}

export default Layout;
