import { Row, Col, Card, Table, Tag } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  NotificationOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { useGet } from "@/hooks";
import { get } from "lodash";

const Home = () => {
  const blogs = useGet({
    queryKey: "blog",
    path: "/Blog/GetAll",
  });

  const users = useGet({
    queryKey: "user",
    path: "/User/GetAll",
  });

  const news = useGet({
    queryKey: "news",
    path: "/News/GetAll",
  });

  const resource = useGet({
    queryKey: "resource",
    path: "/Resource/GetAll",
  });

  const stats = [
    {
      title: "Blogs",
      value: get(blogs, "data", []).length,
      icon: <FileTextOutlined />,
      color: "#1677ff",
      bg: "linear-gradient(135deg, #e6f0ff, #f0f5ff)",
    },
    {
      title: "Users",
      color: "#52c41a",
      icon: <UserOutlined />,
      value: get(users, "data", []).length,
      bg: "linear-gradient(135deg, #f6ffed, #f0fff5)",
    },
    {
      title: "News",
      value: get(news, "data", []).length,
      icon: <NotificationOutlined />,
      color: "#fa8c16",
      bg: "linear-gradient(135deg, #fff7e6, #fff2e8)",
    },
    {
      title: "Resources",
      value: get(resource, "data", []).length,
      icon: <DatabaseOutlined />,
      color: "#eb2f96",
      bg: "linear-gradient(135deg, #fff0f6, #fff5f9)",
    },
  ];

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Username",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Password",
      dataIndex: "password",
      key: "password",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={role === "Admin" ? "red" : "blue"}>{role}</Tag>
      ),
    },
    {
      title: "Signed In",
      dataIndex: "isSigned",
      key: "isSigned",
      render: (isSigned: boolean) =>
        isSigned ? <Tag color="green">Yes</Tag> : <Tag color="default">No</Tag>,
    },
  ];

  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((item, i) => (
          <Col xs={24} sm={12} md={12} lg={6} key={i}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                background: item.bg,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                transition: "all 0.3s ease",
                cursor: "pointer",
              }}
              hoverable
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: item.color,
                    color: "#fff",
                    fontSize: 24,
                    boxShadow: `0 4px 10px ${item.color}40`,
                  }}
                >
                  {item.icon}
                </div>

                {/* Text section */}
                <div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#595959",
                    }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    <CountUp end={item.value} duration={2} />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 4px 18px rgba(0,0,0,0.05)",
        }}
      >
        <Table
          rowKey="id"
          columns={columns}
          pagination={false}
          dataSource={get(users, "data", [])}
        />
      </Card>
    </div>
  );
};

export default Home;
