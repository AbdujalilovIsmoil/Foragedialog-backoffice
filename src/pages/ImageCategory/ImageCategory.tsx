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

interface DataType {
  id: number;
  category: {
    uz: string;
    ru: string;
    en: string;
    ger: string;
  };
}

const Category: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState(lang);

  const [form] = Form.useForm();

  useEffect(() => {
    if (!lang) {
      setSearchParams({ lang: "uz", current: "1" });
    }
  }, []);

  // GET
  const { data, isLoading } = useGet({
    queryKey: "image-category",
    path: "/ImageCategory/GetAll",
  });

  // POST or PUT
  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["image-category"],
    onSuccess: async () => onClose(),
    path: `/ImageCategory/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Category`,
  });

  // DELETE
  const mutateDelete = useDelete({
    queryKey: ["image-category"],
    path: "/ImageCategory/Delete",
    successText: "Delete Category One",
    onError: async (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
  });

  // Tabsni almashtirish
  const onChange = (key: string) => {
    setCurrentLang(key);
    setSearchParams({
      lang: key,
      current: current,
    });
  };

  const showDrawer = () => setOpen(true);

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    form.resetFields();
    setValues({
      id: 0,
      category: { uz: "", ru: "", en: "", ger: "" },
    });
  };

  type DynamicValues = {
    id: number;
    category: {
      uz: string;
      ru: string;
      en: string;
      ger: string;
    };
  };

  const [values, setValues] = useState<DynamicValues>({
    id: 0,
    category: { uz: "", ru: "", en: "", ger: "" },
  });

  // Drawerda ma’lumotni ochish (Update uchun)
  const openDrawData = (row: DataType) => {
    showDrawer();
    setIsPost(false);
    setValues({
      id: row.id,
      category: { ...row.category },
    });

    // formga mavjud qiymatlarni joylash
    form.setFieldsValue({
      ...row.category,
    });
  };

  // Table columns
  const columns: ColumnsType<DataType> = [
    {
      title: "Image Category",
      dataIndex: "category",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "Edit",
      render: (row) => (
        <Button type="text" size="large" onClick={() => openDrawData(row)}>
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

  // Tabs
  const items: TabsProps["items"] = [
    { key: "uz", label: "Uzbek" },
    { key: "ru", label: "Rus" },
    { key: "en", label: "English" },
    { key: "ger", label: "German" },
  ];

  // ✅ Create / Update submit
  const handleSubmit = (formValues: any) => {
    const payload = {
      id: isPost ? 0 : Number(values.id),
      category: {
        uz: formValues.uz || "",
        ru: formValues.ru || "",
        en: formValues.en || "",
        ger: formValues.ger || "",
      },
    };
    mutate(payload);
  };

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
          current: Number(current),
        }}
        rowKey={(record) => record.id}
        onChange={(e) => setSearchParams({ lang, current: String(e.current) })}
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={`${isPost ? "Create" : "Update"} Category`}
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
          onFinish={handleSubmit}
          initialValues={values.category}
        >
          <Row gutter={16}>
            {/* 4ta inputni Form.Item qilib beramiz */}
            <Col
              span={24}
              style={{ display: currentLang === "uz" ? "block" : "none" }}
            >
              <Form.Item
                label="Category (Uzbek)"
                name="uz"
                rules={[{ required: true, message: "Please enter category" }]}
              >
                <Input placeholder="Please enter Uzbek category" />
              </Form.Item>
            </Col>

            <Col
              span={24}
              style={{ display: currentLang === "ru" ? "block" : "none" }}
            >
              <Form.Item
                label="Category (Russian)"
                name="ru"
                rules={[{ required: true, message: "Please enter category" }]}
              >
                <Input placeholder="Please enter Russian category" />
              </Form.Item>
            </Col>

            <Col
              span={24}
              style={{ display: currentLang === "en" ? "block" : "none" }}
            >
              <Form.Item
                label="Category (English)"
                name="en"
                rules={[{ required: true, message: "Please enter category" }]}
              >
                <Input placeholder="Please enter English category" />
              </Form.Item>
            </Col>

            <Col
              span={24}
              style={{ display: currentLang === "ger" ? "block" : "none" }}
            >
              <Form.Item
                label="Category (German)"
                name="ger"
                rules={[{ required: true, message: "Please enter category" }]}
              >
                <Input placeholder="Please enter German category" />
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

export default Category;
