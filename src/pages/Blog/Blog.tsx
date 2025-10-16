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
  Spin,
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
  categoriesIds: number[] | string[];
  tagsIds: number[] | string[];
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
  categoriesIds: [],
  tagsIds: [],
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
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

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
      form.resetFields();
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
      form.resetFields();
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

  // inputlar uchun
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof NewsValues,
    lang?: keyof MultilangText
  ) => {
    const value = e.target.value;
    if (lang) {
      setValues((prev) => ({
        ...prev,
        [field]: { ...(prev[field] as MultilangText), [lang]: value },
      }));
    } else {
      setValues((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSelectChange = (
    field: "categories" | "tags" | "publisherId",
    value: any
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  // Rasm upload
  const handleImageUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(
        import.meta.env.VITE_REACT_API_URL + "/File/Uploadfile",
        { method: "POST", body: formData }
      );
      const data = await response.json();
      const id = data?.content?.id;
      if (id) {
        const updated = [...values.images, id];
        setValues((prev) => ({ ...prev, images: updated }));
        message.success(`${file.name} uploaded`);
      }
    } catch {
      message.error(`${file.name} upload failed`);
    }
    return false;
  };

  const handleImageRemove = (file: any) => {
    const updated = values.images.filter((id) => id !== file.uid);
    setValues((prev) => ({ ...prev, images: updated }));
    return true;
  };

  // Submit
  const handleSubmit = () => {
    if (values.id) putNews.mutate(values);
    else postNews.mutate(values);
  };

  // Edit bosilganda GetById orqali olish
  const openDrawerForEdit = async (record: any) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_REACT_API_URL}/Blog/GetById?id=${record.id}`
      );
      const data = await res.json();
      const content = data?.content || data;

      const updatedValues: NewsValues = {
        id: content.id,
        tagsIds: content.tagsIds || [],
        categoriesIds: content.categoriesIds || [],
        subject: content.subject || defaultValues.subject,
        title: content.title || defaultValues.title,
        text: content.text || defaultValues.text,
        categories: content.categories?.map((c: any) => c.id) || [],
        tags: content.tags?.map((t: any) => t.id) || [],
        images: content.images || [],
        readingTime: content.readingTime || "",
        publishedDate: content.publishedDate || new Date().toISOString(),
        publisherId: content.publisherId || 0,
      };

      setValues(updatedValues);
      form.setFieldsValue(updatedValues);
      setVisible(true);
    } catch (err) {
      message.error("❌ Ma'lumotni olishda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  // View bosilganda GetById orqali olish
  const openViewModal = async (record: DataType) => {
    try {
      setLoading(true);
      const res = await fetch(
        `${import.meta.env.VITE_REACT_API_URL}/Blog/GetById?id=${record.id}`
      );
      const data = await res.json();
      const content = data?.content || data;
      setViewItem(content);
      setViewModalVisible(true);
    } catch {
      message.error("❌ Ma'lumotni olishda xatolik");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDrawer = () => {
    form.resetFields();
    setValues({ ...defaultValues });
    setVisible(true);
  };

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
        <Button icon={<EyeOutlined />} onClick={() => openViewModal(record)} />
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
          icon={<DeleteOutlined />}
          onClick={() => deleteNews.mutate(`${record.id}`)}
        />
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
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
          dataSource={(newsData || []).map((i: any) => ({
            ...i,
            key: i.id,
          }))}
          rowKey="key"
        />

        {/* Drawer (Create/Edit) */}
        <Drawer
          title={values.id ? "Edit News" : "Create News"}
          open={visible}
          onClose={() => setVisible(false)}
          width={900}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Tabs
              activeKey={currentLang}
              onChange={(key) => setCurrentLang(key as keyof MultilangText)}
              items={languages.map((lang) => ({
                key: lang,
                label: lang.toUpperCase(),
              }))}
            />

            <Row gutter={16}>
              {/* Title */}
              <Col span={24}>
                <Form.Item
                  label="Title"
                  name={["title", currentLang]}
                  rules={[{ required: true, message: "Enter title" }]}
                >
                  <Input
                    onChange={(e) => handleInputChange(e, "title", currentLang)}
                  />
                </Form.Item>
              </Col>

              {/* Text */}
              <Col span={24}>
                <Form.Item
                  label="Text"
                  name={["text", currentLang]}
                  rules={[{ required: true, message: "Enter text" }]}
                >
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

              {/* Categories */}
              <Col span={24}>
                <Form.Item label="Categories" name="categories" required>
                  <Select
                    mode="multiple"
                    value={values.categories}
                    onChange={(v) => handleSelectChange("categories", v)}
                  >
                    {categoriesData?.map((c: any) => (
                      <Select.Option key={c.id} value={c.id}>
                        {c.categoryName?.[currentLang]}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Tags */}
              <Col span={24}>
                <Form.Item label="Tags" name="tags" required>
                  <Select
                    mode="multiple"
                    value={values.tags}
                    onChange={(v) => handleSelectChange("tags", v)}
                  >
                    {tagsData?.map((t: any) => (
                      <Select.Option key={t.id} value={t.id}>
                        {t.tagName?.[currentLang] || t.tagName?.uz || "No name"}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Publisher */}
              <Col span={24}>
                <Form.Item label="Publisher" name="publisherId" required>
                  <Select
                    value={values.publisherId}
                    onChange={(v) => handleSelectChange("publisherId", v)}
                  >
                    {publishersData?.map((p: any) => (
                      <Select.Option key={p.id} value={p.id}>
                        {p.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              {/* Images */}
              <Col span={24}>
                <Form.Item label="Images" name="images" required>
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
                    <Button icon={<UploadOutlined />}>Upload</Button>
                  </Upload>
                </Form.Item>
              </Col>

              {/* Date */}
              <Col span={24}>
                <Form.Item label="Published Date" name="publishedDate" required>
                  <Input
                    type="datetime-local"
                    value={values.publishedDate.slice(0, 16)}
                    onChange={(e) => handleInputChange(e, "publishedDate")}
                  />
                </Form.Item>
              </Col>

              <Col span={24}>
                <Button type="primary" htmlType="submit">
                  {values.id ? "Update" : "Create"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Drawer>

        {/* View Modal */}
        <Modal
          open={viewModalVisible}
          title={viewItem?.title?.[currentLang] || "Blog details"}
          onCancel={() => setViewModalVisible(false)}
          footer={
            <Button onClick={() => setViewModalVisible(false)}>Close</Button>
          }
          width={900}
        >
          {viewItem && (
            <>
              <Descriptions bordered size="middle" column={2}>
                <Descriptions.Item label="Title">
                  {viewItem.title?.[currentLang]}
                </Descriptions.Item>
                <Descriptions.Item label="Publisher">
                  {
                    publishersData?.find(
                      (p: any) => p.id === viewItem.publisherId
                    )?.name
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Published">
                  {new Date(viewItem.publishedDate).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>

              <Divider orientation="left">Text</Divider>
              <div
                style={{
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 12,
                  maxHeight: 300,
                  overflowY: "auto",
                }}
                dangerouslySetInnerHTML={{
                  __html: viewItem.text?.[currentLang],
                }}
              />

              <Divider orientation="left">Categories & Tags</Divider>
              <div style={{ marginBottom: 12 }}>
                {viewItem.categories?.map((id) => {
                  const cat = categoriesData?.find((c: any) => c.id === id);
                  return (
                    <Tag color="blue" key={id}>
                      {cat?.categoryName?.[currentLang]}
                    </Tag>
                  );
                })}
              </div>
              <div>
                {viewItem.tags?.map((id) => {
                  const tag = tagsData?.find((t: any) => t.id === id);
                  return (
                    <Tag color="green" key={id}>
                      {tag?.tagName?.[currentLang] || tag?.tagName?.uz}
                    </Tag>
                  );
                })}
              </div>

              <Divider orientation="left">Images</Divider>
              <div className="flex flex-wrap gap-3">
                {viewItem.images?.map((id) => (
                  <Image
                    key={id}
                    width={140}
                    height={100}
                    src={`${
                      import.meta.env.VITE_REACT_API_URL
                    }/File/DownloadFile/download/${id}`}
                    style={{ objectFit: "cover", borderRadius: 6 }}
                  />
                ))}
              </div>
            </>
          )}
        </Modal>
      </div>
    </Spin>
  );
};

export default News;
