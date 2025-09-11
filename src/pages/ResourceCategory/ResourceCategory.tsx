import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, TabsProps } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useEffect, useState } from "react";
import { CategorySection, CategoryTopContainer } from "./style";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Col, Row, Form, Tabs, Table, Input, Drawer, Tooltip } from "antd";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

type LangKey = "uz" | "ru" | "en" | "ger";

interface DataType {
  id: string | number;
  categoryName: Record<LangKey, string>;
}

const langs: LangKey[] = ["uz", "ru", "en", "ger"];

const Category: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [searchParams, setSearchParams] = useSearchParams();
  const langParam = (searchParams.get("lang") as LangKey) || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState<LangKey>(langParam);

  useEffect(() => {
    if (!searchParams.get("lang") || !searchParams.get("current")) {
      setSearchParams({ lang: "uz", current: "1" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useGet({
    queryKey: "resource-category",
    path: "/ResourceCategory/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["resource-category"],
    path: `/ResourceCategory/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Resource Category`,
    onSuccess: async () => {
      // server muvaffaqiyatli bo'lsa formni tozalaymiz va drawerni yopamiz
      form.resetFields();
      setIsPost(true);
      setOpen(false);
      // agar kerak bo'lsa, refetch useGet hook ichida avtomatik bo'ladi (react-query)
    },
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
    onSuccess: async () => {
      // agar delete muvaffaqiyatli bo'lsa
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
    // create uchun bo'sh qiymatlar o'rnatamiz (id = 0)
    form.setFieldsValue({ id: 0, uz: "", ru: "", en: "", ger: "" });
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
  };

  const openDrawData = (record: DataType) => {
    setOpen(true);
    setIsPost(false);
    // record.categoryName: { uz, ru, en, ger }
    form.setFieldsValue({
      id: Number(record.id),
      uz: record.categoryName?.uz ?? "",
      ru: record.categoryName?.ru ?? "",
      en: record.categoryName?.en ?? "",
      ger: record.categoryName?.ger ?? "",
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Resource Category",
      dataIndex: "categoryName",
      render: (value: DataType["categoryName"]) => {
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
          onClick={() => mutateDelete.mutate(`${Number(id)}`)}
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
        dataSource={Array.isArray(data) ? data : []}
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
          onFinish={() => {
            const allValues = form.getFieldsValue();
            const payload = {
              id: isPost ? 0 : Number(allValues.id || 0),
              categoryName: {
                uz: String(allValues.uz || ""),
                ru: String(allValues.ru || ""),
                en: String(allValues.en || ""),
                ger: String(allValues.ger || ""),
              },
            };
            mutate(payload);
          }}
        >
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            {langs.map((lang) => (
              <Col
                span={24}
                key={lang}
                style={{ display: currentLang === lang ? "block" : "none" }}
              >
                <Form.Item
                  label="Category"
                  name={lang}
                  rules={[{ required: true, message: "Please enter category" }]}
                >
                  <Input placeholder="Please enter category" />
                </Form.Item>
              </Col>
            ))}
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
