import { useState } from "react";
import {
  Row,
  Col,
  Card,
  Table,
  Tag,
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Popconfirm,
} from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  NotificationOutlined,
  DatabaseOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import CountUp from "react-countup";
import { useGet, useDelete, usePost, usePut } from "@/hooks";
import { get } from "lodash";

const { Option } = Select;

const Home = () => {
  const blogs = useGet({ queryKey: "blog", path: "/Blog/GetAll" });
  const users = useGet({ queryKey: "user", path: "/User/GetAll" });
  const news = useGet({ queryKey: "news", path: "/News/GetAll" });
  const resource = useGet({ queryKey: "resource", path: "/Resource/GetAll" });

  // Drawer va form state
  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const deleteUser = useDelete({
    queryKey: ["user"],
    path: "/User/Delete",
    successText: "User deleted",
    onError: (err: any) => console.error(err),
  });

  const createUser = usePost({
    queryKey: ["user"],
    path: "/User/Create",
    successText: "User created",
    onSuccess: () => {
      setOpen(false);
      users.refetch();
    },
    onError: (err: any) => console.error(err),
  });

  const updateUser = usePut({
    queryKey: ["user"],
    path: "/User/Update",
    successText: "User updated",
    onSuccess: () => {
      setOpen(false);
      users.refetch();
    },
    onError: (err: any) => console.error(err),
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
      value: get(users, "data", []).length,
      icon: <UserOutlined />,
      color: "#52c41a",
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

  const openCreateDrawer = () => {
    setIsCreate(true);
    setSelectedUser(null);
    setOpen(true);
  };

  const openEditDrawer = (user: any) => {
    setIsCreate(false);
    setSelectedUser(user);
    setOpen(true);
  };

  const handleSubmit = (values: any) => {
    if (isCreate) {
      createUser.mutate(values);
    } else {
      updateUser.mutate({ ...selectedUser, ...values });
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Username", dataIndex: "userName", key: "userName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Password", dataIndex: "password", key: "password" },
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
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => deleteUser.mutate(`${record.id}`)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Stats */}
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
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
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
                <div>
                  <div
                    style={{ fontSize: 16, fontWeight: 500, color: "#595959" }}
                  >
                    {item.title}
                  </div>
                  <div
                    style={{ fontSize: 28, fontWeight: 700, color: item.color }}
                  >
                    <CountUp end={item.value} duration={2} />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row justify="end" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openCreateDrawer}
        >
          Create User
        </Button>
      </Row>

      {/* Users Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 4px 18px rgba(0,0,0,0.05)" }}
      >
        <Table
          rowKey="id"
          columns={columns}
          pagination={false}
          dataSource={get(users, "data", [])}
        />
      </Card>

      {/* Drawer for Create/Update */}
      <Drawer
        title={isCreate ? "Create User" : "Update User"}
        width={400}
        onClose={() => setOpen(false)}
        open={open}
      >
        <Form
          layout="vertical"
          initialValues={selectedUser || { role: "User" }}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Username"
            name="userName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: isCreate }]}
          >
            <Input
              type="password"
              placeholder={isCreate ? "" : "Leave blank to keep current"}
            />
          </Form.Item>
          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select>
              <Option value="Admin">Admin</Option>
              <Option value="User">User</Option>
            </Select>
          </Form.Item>
          {!isCreate && (
            <Form.Item
              label="Signed In"
              name="isSigned"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Yes</Option>
                <Option value={false}>No</Option>
              </Select>
            </Form.Item>
          )}
          <Button type="primary" htmlType="submit">
            {isCreate ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default Home;
