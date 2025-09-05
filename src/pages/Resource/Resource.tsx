import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, TabsProps } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useEffect, useState, type ChangeEvent } from "react";
import { CategorySection, CategoryTopContainer } from "./style";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Row, Form, Tabs, Table, Input, Drawer, Tooltip } from "antd";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

interface DataType {
  id: string | number;
  categoryName: string;
}

const Resource: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current");
  const [currentLang, setCurrentLang] = useState(lang);

  useEffect(() => {
    if (!lang) {
      setSearchParams({ lang: "uz", current: String(1) });
    } else {
      setSearchParams({ lang, current: String(current ? current : 1) });
    }
  }, []);

  const { data, isLoading } = useGet({
    queryKey: "resource",
    path: "/ResourceCategory/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["resource"],
    onSuccess: async () => onClose(),
    path: `/ResourceCategory/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Resource`,
  });

  const mutateDelete = useDelete({
    queryKey: ["resource"],
    path: "/ResourceCategory/Delete",
    successText: "Delete Resource One",
    onError: async (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
  });

  const onChange = (key: string) => {
    setCurrentLang(key);
    setSearchParams({
      lang: key,
      current: String(searchParams.get("current")),
    });
  };

  const showDrawer = () => setOpen(true);

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
  };

  type DynamicValues<T extends object = {}> = {
    id: string | number;
  } & T;

  const [values, setValues] = useState<
    DynamicValues<{
      categoryName: Record<string, string>;
    }>
  >({
    id: "",
    categoryName: {
      uz: "",
      ru: "",
      en: "",
      ger: "",
    },
  });

  const changeLanguage = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setValues({
      ...values,
      categoryName: {
        ...values.categoryName,
        [name]: value,
      },
    });
  };

  const openDrawData = (values: {
    id: string | number;
    categoryName: { uz: string; ru: string; en: string; ger: string };
  }) => {
    showDrawer();
    setIsPost(false);

    setValues({ id: values.id, categoryName: { ...values.categoryName } });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Resurs",
      dataIndex: "categoryName",
      render: (value) => {
        return (
          <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
        );
      },
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
    {
      title: "Delete",
      render: ({ id }) => {
        return (
          <Button
            type="text"
            size="large"
            onClick={() => mutateDelete.mutate(id)}
          >
            <DeleteOutlined style={{ color: "red" }} />
          </Button>
        );
      },
    },
  ];

  const items: TabsProps["items"] = [
    {
      key: "uz",
      label: "Uzbek",
    },
    {
      key: "ru",
      label: "Rus",
    },
    {
      key: "en",
      label: "English",
    },
    {
      key: "ger",
      label: "German",
    },
  ];

  return (
    <CategorySection>
      <CategoryTopContainer>
        <Tabs
          items={items}
          onChange={onChange}
          activeKey={currentLang}
          defaultActiveKey={currentLang}
        />
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </CategoryTopContainer>
      <Table<DataType>
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{
          current: Number(current || 1),
        }}
        rowKey={(record) => record.id}
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
        <Tabs
          items={items}
          onChange={onChange}
          activeKey={currentLang}
          defaultActiveKey={currentLang}
        />

        <Form layout="vertical" onFinish={() => mutate(values)}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Resource"
                name={currentLang}
                rules={[{ required: true, message: "Please enter category" }]}
              >
                <Input
                  name={currentLang}
                  onChange={changeLanguage}
                  placeholder="Please enter category"
                  defaultValue={
                    values.categoryName[
                      currentLang as keyof typeof values.categoryName
                    ]
                  }
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
