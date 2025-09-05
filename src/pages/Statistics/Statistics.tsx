import { Button } from "@/components";
import type { TableProps } from "antd";
import { CategorySection } from "./style";
import { useGet, usePut } from "@/hooks";
import { EditOutlined } from "@ant-design/icons";
import { useSearchParams } from "react-router-dom";
import { useState, type ChangeEvent } from "react";
import { Col, Row, Form, Table, Input, Drawer } from "antd";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

interface DataType {
  id: string | number;
  projects: string | number;
  teamMembers: string | number;
  happyClients: string | number;
  yearsExperience: string | number;
}

const Resource: React.FC = () => {
  const [open, setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current");

  const { data, isLoading } = useGet({
    queryKey: "statistics",
    path: "/Statistics/Get",
  });

  const { mutate } = usePut({
    queryKey: ["statistics"],
    onSuccess: async () => onClose(),
    path: "/Statistics/Update",
    successText: `Success Update statistics`,
  });

  const showDrawer = () => setOpen(true);

  const onClose = () => setOpen(false);

  type DynamicValues = {
    id: string | number;
    projects: number | string;
    teamMembers: number | string;
    happyClients: number | string;
    yearsExperience: number | string;
  };

  const [values, setValues] = useState<Partial<DynamicValues>>({
    id: "",
    happyClients: 0,
    projects: 0,
    teamMembers: 0,
    yearsExperience: 0,
  });

  const changeLanguage = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setValues({
      ...values,
      [name]: value,
    });
  };

  const openDrawData = (values: {
    id: string | number;
    categoryName: { uz: string; ru: string; en: string; ger: string };
  }) => {
    showDrawer();

    setValues(values);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Happy Clients",
      dataIndex: "happyClients",
    },
    {
      title: "Team Members",
      dataIndex: "teamMembers",
    },
    {
      title: "Projects",
      dataIndex: "projects",
    },
    {
      title: "Years Experience",
      dataIndex: "yearsExperience",
    },
    {
      title: "Edit",
      render: (value) => {
        return (
          <Button type="text" size="large" onClick={() => openDrawData(value)}>
            <EditOutlined style={{ color: "green" }} />
          </Button>
        );
      },
    },
  ];

  return (
    <CategorySection>
      <Table<DataType>
        columns={columns}
        dataSource={[data]}
        loading={isLoading}
        pagination={{
          current: Number(current || 1),
        }}
        onChange={(e) => setSearchParams({ lang, current: String(e.current) })}
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title="Create categories"
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <Form layout="vertical" onFinish={() => mutate(values)}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="projects"
                label="Projects"
                rules={[{ message: "Please enter category" }]}
              >
                <Input
                  type="number"
                  name="projects"
                  value={values.projects}
                  onChange={changeLanguage}
                  defaultValue={values.projects}
                  placeholder="Please enter project"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="happyClients"
                label="Happy Clients"
                rules={[{ message: "Please enter happy clients" }]}
              >
                <Input
                  type="number"
                  name="happyClients"
                  onChange={changeLanguage}
                  value={values.happyClients}
                  defaultValue={values.happyClients}
                  placeholder="Please enter happy clients"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="teamMembers"
                label="Team Members"
                rules={[{ message: "Please enter team members" }]}
              >
                <Input
                  type="number"
                  name="teamMembers"
                  onChange={changeLanguage}
                  value={values.teamMembers}
                  defaultValue={values.teamMembers}
                  placeholder="Please enter team members"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item
                name="yearsExperience"
                label="Years Experience"
                rules={[{ message: "Please enter years experience" }]}
              >
                <Input
                  type="number"
                  name="yearsExperience"
                  onChange={changeLanguage}
                  value={values.yearsExperience}
                  defaultValue={values.yearsExperience}
                  placeholder="Please enter years experience"
                />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      </Drawer>
    </CategorySection>
  );
};

export default Resource;
