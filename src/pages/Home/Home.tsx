import { get } from "lodash";
import { useState } from "react";
import CountUp from "react-countup";
import { Button } from "@/components";
import { Link, useLocation } from "react-router-dom";
import { useGet, useDelete, usePost, usePut } from "@/hooks";
import {
  Row,
  Col,
  Tag,
  Card,
  Form,
  Table,
  Input,
  Select,
  Drawer,
  Popconfirm,
} from "antd";
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  NotificationOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";

interface selectedUserInterface {
  id: number;
  role: string;
  email: string;
  token: string;
  userName: string;
  isSigned: boolean;
  password?: string;
}

const Home = () => {
  const [form] = Form.useForm();
  const location = useLocation();
  const lang = location.pathname.split("/")[1] || "uz";

  const blogs = useGet({ queryKey: "blog", path: "/Blog/GetAll" });
  const users = useGet({ queryKey: "user", path: "/User/GetAll" });
  const news = useGet({ queryKey: "news", path: "/News/GetAll" });
  const resource = useGet({ queryKey: "resource", path: "/Resource/GetAll" });

  const [open, setOpen] = useState(false);
  const [isCreate, setIsCreate] = useState(true);
  const [selectedUser, setSelectedUser] = useState<
    Partial<selectedUserInterface>
  >({});

  const deleteUser = useDelete({
    queryKey: ["user"],
    path: "/User/Delete",
    successText: "User deleted",
    onError: (err) => console.error(err),
  });

  const createUser = usePost({
    queryKey: ["user"],
    path: "/User/Create",
    successText: "User created",
    onError: (err) => console.error(err),
    onSuccess: () => {
      setOpen(false);
      users.refetch();
    },
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
      color: "#1677ff",
      path: "/pages/blog",
      icon: <FileTextOutlined />,
      value: get(blogs, "data", []).length,
      bg: "linear-gradient(135deg, #e6f0ff, #f0f5ff)",
    },
    {
      path: "/",
      title: "Users",
      color: "#52c41a",
      icon: <UserOutlined />,
      value: get(users, "data", []).length,
      bg: "linear-gradient(135deg, #f6ffed, #f0fff5)",
    },
    {
      title: "News",
      color: "#fa8c16",
      path: "/pages/news",
      icon: <NotificationOutlined />,
      value: get(news, "data", []).length,
      bg: "linear-gradient(135deg, #fff7e6, #fff2e8)",
    },
    {
      title: "Resources",
      color: "#eb2f96",
      path: "/pages/resource",
      icon: <DatabaseOutlined />,
      value: get(resource, "data", []).length,
      bg: "linear-gradient(135deg, #fff0f6, #fff5f9)",
    },
  ];

  const openCreateDrawer = () => {
    setIsCreate(true);
    setSelectedUser({});
    form.resetFields(); // inputlarni tozalash
    setOpen(true);
  };

  const openEditDrawer = (user: selectedUserInterface) => {
    setSelectedUser(user);
    setIsCreate(false);
    form.setFieldsValue(user); // edit bo‘lsa formni to‘ldirish
    setOpen(true);
  };

  const handleSubmit = (values: selectedUserInterface) => {
    if (!isCreate && !values.password) {
      delete values.password; // update-da parol bo‘sh bo‘lsa yubormaymiz
    }
    isCreate
      ? createUser.mutate(values)
      : updateUser.mutate({ ...selectedUser, ...values });
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
      key: "isSigned",
      title: "Signed In",
      dataIndex: "isSigned",
      render: (isSigned: boolean) =>
        isSigned ? <Tag color="green">Yes</Tag> : <Tag>No</Tag>,
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: selectedUserInterface, record: selectedUserInterface) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => openEditDrawer(record)}
          />
          <Popconfirm
            okText="Yes"
            cancelText="No"
            title="Are you sure to delete?"
            onConfirm={() => deleteUser.mutate(`${record.id}`)}
          >
            <Button type="primary" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
        {stats.map((item, i) => (
          <Col xs={24} sm={12} md={12} lg={6} key={i}>
            <Card
              hoverable
              bordered={false}
              style={{
                borderRadius: 16,
                cursor: "pointer",
                background: item.bg,
                transition: "all 0.3s ease",
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
              }}
            >
              <Link
                to={`/${lang}${item.path}`}
                style={{ display: "flex", alignItems: "center", gap: 16 }}
              >
                <div
                  style={{
                    width: 55,
                    height: 55,
                    fontSize: 24,
                    color: "#fff",
                    display: "flex",
                    borderRadius: "50%",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: item.color,
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
              </Link>
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

      <Drawer
        open={open}
        width={400}
        onClose={() => setOpen(false)}
        title={isCreate ? "Create User" : "Update User"}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="userName"
            label="Full Name"
            rules={[{ required: true }]}
          >
            <Input type="text" />
          </Form.Item>

          <Form.Item
            name="email"
            label="User Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: isCreate }]}
          >
            <Input.Password
              placeholder={isCreate ? "" : "Leave blank to keep current"}
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item label="Role" name="role" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="Admin">Admin</Select.Option>
              <Select.Option value="User">User</Select.Option>
            </Select>
          </Form.Item>

          {!isCreate && (
            <Form.Item name="isSigned" label="Signed In">
              <Select>
                <Select.Option value={true}>Yes</Select.Option>
                <Select.Option value={false}>No</Select.Option>
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
