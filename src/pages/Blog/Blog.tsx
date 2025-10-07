import { CKEditor, Button } from "@/components";
import { useState, type ChangeEvent } from "react";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import {
  EyeOutlined,
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@/assets/antd-design-icons";
import {
  Drawer,
  Select,
  Input,
  Form,
  Row,
  Col,
  Upload,
  Table,
  Tabs,
  message,
  Image,
  Modal,
  Tag,
  Descriptions,
  Divider,
} from "antd";

interface MultilangText {
  uz: string;
  ru: string;
  en: string;
  ger: string;
}

interface NewsValues {
  id?: string | number;
  subject: MultilangText;
  title: MultilangText;
  text: MultilangText;
  categories: number[];
  tags: number[];
  images: string[];
  readingTime: string;
  publishedDate: string;
  publisherId: number;
}

interface DataType extends NewsValues {
  key: string | number;
}

const languages: (keyof MultilangText)[] = ["uz", "ru", "en", "ger"];

const defaultValues: NewsValues = {
  subject: { uz: "", ru: "", en: "", ger: "" },
  title: { uz: "", ru: "", en: "", ger: "" },
  text: { uz: "", ru: "", en: "", ger: "" },
  categories: [],
  tags: [],
  images: [],
  readingTime: "",
  publishedDate: new Date().toISOString(),
  publisherId: 0,
};

const News: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [currentLang, setCurrentLang] = useState<keyof MultilangText>("uz");
  const [values, setValues] = useState<NewsValues>({ ...defaultValues });
  const [viewItem, setViewItem] = useState<NewsValues | null>(null);

  // API hooks
  const { data: newsData, refetch: refetchNews } = useGet({
    path: "/Blog/GetAll",
    queryKey: "blog",
  });
  const { data: categoriesData } = useGet({
    queryKey: "categories",
    path: "/NewsCategory/GetAll",
  });
  const { data: tagsData } = useGet({
    queryKey: "tags",
    path: "/Tags/GetAll",
  });
  const { data: publishersData } = useGet({
    queryKey: "publishers",
    path: "/Publisher/GetAll",
  });

  const postNews = usePost({
    path: "/Blog/Create",
    queryKey: ["blog"],
    onSuccess: () => {
      setVisible(false);
      setValues({ ...defaultValues });
      refetchNews();
      message.success("✅ Blog created successfully");
    },
  });

  const putNews = usePut({
    path: "/Blog/Update",
    queryKey: ["blog"],
    onSuccess: () => {
      setVisible(false);
      setValues({ ...defaultValues });
      refetchNews();
      message.success("✅ Blog updated successfully");
    },
  });

  const deleteNews = useDelete({
    path: "/Blog/Delete",
    successText: "",
    queryKey: ["blog"],
    onSuccess: () => {
      refetchNews();
      message.success("🗑️ Blog deleted successfully");
    },
  });

  // 🧠 Input change
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof NewsValues,
    lang?: keyof MultilangText
  ) => {
    if (lang) {
      setValues((prev) => ({
        ...prev,
        [field]: { ...(prev[field] as MultilangText), [lang]: e.target.value },
      }));
    } else {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  // 🧠 Select change
  const handleSelectChange = (
    field: "categories" | "tags" | "publisherId",
    value: any
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // 🖼 Upload image
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        import.meta.env.VITE_REACT_API_URL + "/File/Uploadfile",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      const contentId = data?.content?.id;
      if (contentId) {
        setValues((prev) => ({
          ...prev,
          images: [...prev.images, contentId],
        }));
        message.success(`${file.name} uploaded successfully`);
      } else {
        message.error(`${file.name} upload failed`);
      }
    } catch {
      message.error(`${file.name} upload failed`);
    }

    return false;
  };

  // 🗑 Remove image
  const handleImageRemove = (file: any) => {
    const id = file.uid;
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((imgId) => imgId !== id),
    }));
    return true;
  };

  // 💾 Submit
  const handleSubmit = () => {
    if (values.id) {
      putNews.mutate(values, {
        onSuccess: () => {
          setValues({ ...defaultValues });
        },
      });
    } else {
      postNews.mutate(values, {
        onSuccess: () => {
          setValues({ ...defaultValues });
        },
      });
    }
  };

  // ✏️ Edit
  const openDrawerForEdit = (record: any) => {
    console.log(values);

    setValues({
      id: record.id,
      subject:
        typeof record.subject === "object"
          ? record.subject
          : { uz: record.subject || "", ru: "", en: "", ger: "" },
      title:
        typeof record.title === "object"
          ? record.title
          : { uz: record.title || "", ru: "", en: "", ger: "" },
      text:
        typeof record.text === "object"
          ? record.text
          : { uz: record.text || "", ru: "", en: "", ger: "" },
      categories: Array.isArray(record.categories)
        ? record.categories.map((c: any) => c?.id ?? c)
        : [],
      tags: Array.isArray(record.tags)
        ? record.tags.map((t: any) => t?.id ?? t)
        : [],
      images: record.images || [],
      readingTime: record.readingTime || "",
      publishedDate: record.publishedDate || new Date().toISOString(),
      publisherId: record.publisherId || 0,
    });
    setVisible(true);
  };

  // 👁 View
  const openViewModal = (record: DataType) => {
    setViewItem(record);
    setViewModalVisible(true);
  };

  // ➕ Create
  const openCreateDrawer = () => {
    setValues({ ...defaultValues });
    setVisible(true);
  };

  // Table columns
  const columns = [
    { title: "ID", dataIndex: "id" },
    {
      title: "Title",
      dataIndex: "title",
      render: (val: MultilangText) => val?.[currentLang] || "",
    },
    {
      title: "View",
      render: (_: any, record: DataType) => (
        <Button
          type="default"
          icon={<EyeOutlined />}
          onClick={() => openViewModal(record)}
        />
      ),
    },
    {
      title: "Edit",
      render: (_: any, record: DataType) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => openDrawerForEdit(record)}
        />
      ),
    },
    {
      title: "Delete",
      render: (_: any, record: DataType) => (
        <Button
          danger
          type="default"
          icon={<DeleteOutlined />}
          onClick={() => deleteNews.mutate(`${record.id}`)}
        />
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Tabs
          activeKey={currentLang}
          onChange={(key) => setCurrentLang(key as keyof MultilangText)}
          items={languages.map((lang) => ({
            key: lang,
            label: lang.toUpperCase(),
          }))}
        />
        <Button type="primary" onClick={openCreateDrawer}>
          Create News
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={(newsData || []).map((item: any) => ({
          ...item,
          key: item.id,
        }))}
        rowKey="key"
        style={{ marginBottom: 16 }}
      />

      {/* Drawer (Create/Edit) */}
      <Drawer
        title={values.id ? "Edit News" : "Create News"}
        placement="right"
        width={900}
        onClose={() => setVisible(false)}
        open={visible}
        bodyStyle={{ padding: 16, height: "100%" }}
      >
        <Tabs
          activeKey={currentLang}
          onChange={(key) => setCurrentLang(key as keyof MultilangText)}
          items={languages.map((lang) => ({
            key: lang,
            label: lang.toUpperCase(),
          }))}
        />
        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Title">
                <Input
                  value={values.title[currentLang]}
                  onChange={(e) => handleInputChange(e, "title", currentLang)}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Text">
                <CKEditor
                  key={currentLang}
                  value={values.text[currentLang]}
                  onChange={(data) =>
                    setValues((prev) => ({
                      ...prev,
                      text: { ...prev.text, [currentLang]: data },
                    }))
                  }
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Categories">
                <Select
                  mode="multiple"
                  value={values?.categories}
                  onChange={(v) => handleSelectChange("categories", v)}
                >
                  {categoriesData?.map((c: any) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.categories?.[currentLang] || ""}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Tags">
                <Select
                  mode="multiple"
                  value={values.tags}
                  onChange={(v) => handleSelectChange("tags", v)}
                  placeholder="Select tags"
                  optionFilterProp="children"
                  style={{ width: "100%" }}
                >
                  {tagsData?.map((t: any) => {
                    const tagLabel =
                      typeof t.tagName === "object"
                        ? t.tagName[currentLang] || t.tagName.uz || "No name"
                        : t.tagName || "No name";
                    return (
                      <Select.Option key={t.id} value={t.id}>
                        {tagLabel}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Publisher">
                <Select
                  value={values.publisherId}
                  onChange={(v) => handleSelectChange("publisherId", v)}
                >
                  {publishersData?.map((p: any) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name || ""}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Images">
                <Upload
                  beforeUpload={handleImageUpload}
                  onRemove={handleImageRemove}
                  multiple
                  listType="picture"
                  fileList={values.images.map((id) => ({
                    uid: id,
                    name: id,
                    url: `${
                      import.meta.env.VITE_REACT_API_URL
                    }/File/DownloadFile/download/${id}`,
                  }))}
                >
                  <Button icon={<UploadOutlined />}>Upload Images</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Published Date">
                <Input
                  type="datetime-local"
                  value={
                    values.publishedDate
                      ? values.publishedDate.slice(0, 16)
                      : ""
                  }
                  onChange={(e) => handleInputChange(e, "publishedDate")}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Button type="primary" htmlType="submit">
                {values.id ? "Update News" : "Create News"}
              </Button>
            </Col>
          </Row>
        </Form>
      </Drawer>

      {/* Modal (View) */}
      <Modal
        open={viewModalVisible}
        title={viewItem?.title?.[currentLang] || "News Details"}
        footer={
          <Button type="primary" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        }
        onCancel={() => setViewModalVisible(false)}
        width={1000}
        bodyStyle={{ padding: "24px" }}
      >
        {viewItem && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <Descriptions bordered column={2} size="middle">
              <Descriptions.Item label="Title">
                {viewItem.title?.[currentLang]}
              </Descriptions.Item>
              <Descriptions.Item label="Publisher" span={2}>
                {
                  publishersData?.find(
                    (p: any) => p.id === viewItem.publisherId
                  )?.name
                }
              </Descriptions.Item>
              <Descriptions.Item label="Published Date">
                {new Date(viewItem.publishedDate).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            <Divider orientation="left">Text</Divider>
            <div
              style={{
                padding: 16,
                border: "1px solid #f0f0f0",
                borderRadius: 6,
                backgroundColor: "#fafafa",
                maxHeight: 300,
                overflowY: "auto",
              }}
              dangerouslySetInnerHTML={{
                __html: viewItem.text?.[currentLang] || "",
              }}
            />

            <Divider orientation="left">Categories & Tags</Divider>
            <div style={{ marginBottom: 12 }}>
              {(viewItem.categories || []).map((catId) => {
                const cat = categoriesData?.find((c: any) => c.id === catId);
                return (
                  cat && (
                    <Tag color="blue" key={catId}>
                      {cat.categoryName?.[currentLang]}
                    </Tag>
                  )
                );
              })}
            </div>
            <div>
              {(viewItem.tags || []).map((tagId) => {
                const tag = tagsData?.find((t: any) => t.id === tagId);

                return (
                  tag && (
                    <Tag color="green" key={tagId}>
                      {tag.tagName?.[currentLang] || tag.name}
                    </Tag>
                  )
                );
              })}
            </div>

            <Divider orientation="left">Images</Divider>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {viewItem.images?.map((id) => (
                <Image
                  key={id}
                  width={140}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: 6 }}
                  src={`${
                    import.meta.env.VITE_REACT_API_URL
                  }/File/DownloadFile/download/${id}`}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default News;
