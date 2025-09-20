import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, TabsProps } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useEffect, useState } from "react";
import { CategorySection, CategoryTopContainer } from "./style";
import { DeleteOutlined, EditOutlined } from "@/assets/antd-design-icons";
import { Col, Row, Form, Tabs, Table, Input, Drawer, Tooltip } from "antd";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

type LangKey = "uz" | "ru" | "en" | "ger";

interface DataType {
  id: string | number;
  categoryName: Record<LangKey, string>;
}

const Category: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useSearchParams();
  const langParam = (searchParams.get("lang") as LangKey) || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState<LangKey>(langParam);

  useEffect(() => {
    // ✅ reload bo‘lsa ham default param o‘rnatiladi
    if (!searchParams.get("lang") || !searchParams.get("current")) {
      setSearchParams({ lang: "uz", current: "1" });
    }
  }, [searchParams, setSearchParams]);

  const { data, isLoading } = useGet({
    queryKey: "resource-category", // ✅ unikal bo‘lishi kerak
    path: "/ResourceCategory/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["resource-category"],
    onSuccess: async () => {
      onClose();
      form.resetFields();
    },
    path: `/ResourceCategory/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Resource Category`,
  });

  const mutateDelete = useDelete({
    queryKey: ["resource-category"],
    path: "/ResourceCategory/Delete",
    successText: "Deleted Resource successfully",
    onError: async (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
  });

  const onChange = (key: string) => {
    const selectedLang = key as LangKey;
    setCurrentLang(selectedLang);
    setSearchParams({
      lang: selectedLang,
      current,
    });
  };

  const showDrawer = () => {
    setOpen(true);
    setIsPost(true);
    form.resetFields();
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
  };

  const openDrawData = (record: DataType) => {
    setOpen(true);
    setIsPost(false);
    form.setFieldsValue({
      ...record.categoryName,
      id: record.id,
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Resource Category",
      dataIndex: "categoryName",
      render: (value: DataType["categoryName"]) => {
        if (!value) return null;
        return (
          <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
        );
      },
    },
    {
      title: "Edit",
      render: (_, record) => (
        <Button type="text" size="large" onClick={() => openDrawData(record)}>
          <EditOutlined style={{ color: "green" }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: ({ id }) => (
        <Button
          type="text"
          size="large"
          onClick={() => mutateDelete.mutate(id)}
        >
          <DeleteOutlined style={{ color: "red" }} />
        </Button>
      ),
    },
  ];

  const items: TabsProps["items"] = [
    { key: "uz", label: "Uzbek" },
    { key: "ru", label: "Rus" },
    { key: "en", label: "English" },
    { key: "ger", label: "German" },
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
        dataSource={Array.isArray(data) ? data : []} // ✅ fallback
        loading={isLoading}
        pagination={{
          current: Number(current),
        }}
        rowKey={(record) => record.id}
        onChange={(e) =>
          setSearchParams({ lang: currentLang, current: String(e.current) })
        }
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Resource Category" : "Update Resource Category"}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Tabs
          items={items}
          onChange={onChange}
          activeKey={currentLang}
          defaultActiveKey={currentLang}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={(values) =>
            mutate({
              id: values.id,
              categoryName: {
                uz: values.uz,
                ru: values.ru,
                en: values.en,
                ger: values.ger,
              },
            })
          }
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Category"
                name={currentLang}
                rules={[{ required: true, message: "Please enter category" }]}
              >
                <Input placeholder="Please enter category" />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit">
            {isPost ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </CategorySection>
  );
};

export default Category;
