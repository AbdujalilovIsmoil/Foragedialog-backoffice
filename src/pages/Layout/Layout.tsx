import { Layout as LayoutStyles } from "@/assets/styles";
import { Layout as AntdLayout, Menu, theme } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  HomeOutlined,
  FundOutlined,
  SettingOutlined,
  FileTextOutlined,
  NotificationOutlined,
} from "@/assets/antd-design-icons";

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

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const lang: string = location.pathname.split("/")[1];
  const pathName = location.pathname.split("/").slice(2).join("/");

  const navItems = [
    {
      id: 1,
      path: "/",
      icon: HomeOutlined,
      label: "Bosh sahifa",
    },
    {
      id: 2,
      path: `/pages/news`,
      label: "Yangiliklar",
      icon: NotificationOutlined,
    },
    {
      id: 3,
      label: "Resurslar",
      icon: FundOutlined,
      path: "/pages/resource",
    },
    {
      id: 4,
      label: "Categoriyalar",
      path: `/pages/category`,
      icon: NotificationOutlined,
    },
    {
      id: 5,
      label: "Maqolalar",
      icon: FileTextOutlined,
      path: `/pages/articles`,
    },
    {
      id: 6,
      label: "Sozlamalar",
      icon: SettingOutlined,
      path: `/pages/settings`,
    },
  ];

  const renderNavItems = navItems.map((el) => {
    return {
      key: el.id,
      label: el.label,
      icon: <el.icon style={{ fontSize: "16px" }} />,
    };
  });

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const onSelect = (key: string) => {
    const connectPathName = lang.concat(navItems[Number(key) - 1].path);

    navigate({
      pathname: `/${connectPathName}`,
    });
  };

  const findId = navItems.find((el) => `${el.path}` === `/${pathName}`);

  return (
    <>
      <AntdLayout hasSider>
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
        <AntdLayout>
          <AntdLayout.Header
            style={{
              top: 0,
              zIndex: 1,
              padding: 0,
              width: "100%",
              display: "flex",
              position: "sticky",
              alignItems: "center",
              background: colorBgContainer,
            }}
          ></AntdLayout.Header>
          <AntdLayout.Content
            style={{ padding: "24px 16px 0", overflow: "initial" }}
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
    </>
  );
}

export default Layout;
