import { useState, useEffect } from "react";
import { Button } from "@/components";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import { toast } from "react-toastify";
import { Table, Drawer, Form, Select, Row, Col, Tabs, Image } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@/assets/antd-design-icons";
import axios from "axios";

interface ReferenceBase {
  id: number;
  title: Record<string, string>;
  categoryId: number;
  blogId: number;
}

interface Blog {
  id: number;
  title: Record<string, string>;
  subject?: Record<string, string>;
  text?: Record<string, string>;
  publishedDate?: string;
  viewsCount?: number;
  images?: string[];
}

interface Category {
  uz: string;
  en: string;
  ru?: string;
  ger?: string;
}

interface ReferenceFull extends ReferenceBase {
  blog?: Blog;
  categories?: Category[];
}

const ReferenceToBlogModel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isPost, setIsPost] = useState(true);
  const [selectedRow, setSelectedRow] = useState<ReferenceBase | null>(null);
  const [form] = Form.useForm();

  const [expandedData, setExpandedData] = useState<ReferenceFull[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [viewData, setViewData] = useState<ReferenceFull | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [lang, setLang] = useState<"uz" | "ru" | "en" | "ger">("uz");

  // References (GET ALL)
  const { data, isLoading } = useGet({
    queryKey: "reference-to-blog",
    path: "/ReferenceToBlog/GetAll",
  });

  const { data: ourCategory } = useGet({
    queryKey: "our-category",
    path: "/OurCategory/GetAll",
  });

  // POST or PUT
  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["reference-to-blog"],
    path: `/ReferenceToBlog/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Reference`,
    onSuccess: async () => {
      onClose();
    },
  });

  // DELETE
  const mutateDelete = useDelete({
    queryKey: ["reference-to-blog"],
    path: "/ReferenceToBlog/Delete",
    successText: "Reference Deleted",
    onError: async (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
    },
  });

  // Category bo‘yicha data olish
  useEffect(() => {
    const fetchByCategory = async () => {
      if (!selectedCategory) return;
      try {
        const res = await axios.get(
          `https://back.foragedialog.uz/ReferenceToBlog/GetReferencesByCategoryIds?id=${selectedCategory}`
        );
        setExpandedData(res.data?.content || []);
      } catch (err) {
        console.error("Error fetching references by category", err);
      }
    };
    fetchByCategory();
  }, [selectedCategory]);

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setSelectedRow(null);
    form.resetFields();
  };

  const openEdit = (row: ReferenceBase) => {
    setIsPost(false);
    setSelectedRow(row);
    form.setFieldsValue({
      categoryId: row.categoryId,
      blogId: row.blogId,
    });
    setOpen(true);
  };

  const openView = (row: ReferenceFull) => {
    setViewData(row);
    setViewOpen(true);
  };

  const handleSubmit = (values: any) => {
    const payload = {
      id: isPost ? 0 : selectedRow?.id,
      categoryId: values.categoryId,
      blogId: values.blogId,
    };
    mutate(payload);
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "categories",
      render: (categories: Category[]) =>
        categories && categories.length > 0 ? categories[0][lang] || "-" : "-",
    },
    {
      title: "Blog",
      dataIndex: "blog",
      render: (blog: Blog) => (blog ? blog.title[lang] : "-"),
    },
    {
      title: "Actions",
      render: (row: ReferenceFull) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button type="text" size="large" onClick={() => openEdit(row)}>
            <EditOutlined style={{ color: "green" }} />
          </Button>
          <Button
            type="text"
            size="large"
            onClick={() => mutateDelete.mutate(`${row.id}`)}
          >
            <DeleteOutlined style={{ color: "red" }} />
          </Button>
          <Button type="text" size="large" onClick={() => openView(row)}>
            <EyeOutlined style={{ color: "blue" }} />
          </Button>
        </div>
      ),
    },
  ];

  const tabItems = ["uz", "ru", "en", "ger"].map((lng) => ({
    key: lng,
    label: lng.toUpperCase(),
    children: (
      <div>
        <h2>{viewData?.blog?.title[lng] || "-"}</h2>
        <p>
          <b>Subject:</b> {viewData?.blog?.subject?.[lng] || "-"}
        </p>
        <div
          dangerouslySetInnerHTML={{
            __html: viewData?.blog?.text?.[lng] || "",
          }}
        />
      </div>
    ),
  }));

  const { data: blogData } = useGet({
    path: "/Blog/GetAll",
    queryKey: "blog-data",
  });

  console.log(data);

  return (
    <>
      {/* Lang select */}
      <div style={{ marginBottom: 20, display: "flex", gap: 20 }}>
        <Select
          style={{ width: 120 }}
          value={lang}
          onChange={(val) => setLang(val)}
        >
          <Select.Option value="uz">UZ</Select.Option>
          <Select.Option value="ru">RU</Select.Option>
          <Select.Option value="en">EN</Select.Option>
          <Select.Option value="ger">GER</Select.Option>
        </Select>

        <Select
          placeholder="Select Category"
          style={{ width: 250 }}
          onChange={(val) => setSelectedCategory(val)}
          allowClear
        >
          {Array.isArray(data) &&
            data.map((el: ReferenceBase) => (
              <Select.Option key={el.id} value={el.categoryId}>
                Category {el.id}
              </Select.Option>
            ))}
        </Select>

        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </div>

      {/* Table */}
      <Table<ReferenceFull>
        columns={columns}
        dataSource={expandedData}
        rowKey={(record) => record.id}
        loading={isLoading}
      />

      {/* Drawer Create/Update */}
      <Drawer
        title={`${isPost ? "Create" : "Update"} Reference`}
        open={open}
        width={500}
        onClose={onClose}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Category ID"
                name="categoryId"
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select CategoryId">
                  {Array.isArray(ourCategory) &&
                    ourCategory.map(
                      (el: { id: number; name: Record<string, string> }) => (
                        <Select.Option key={el.id} value={el.id}>
                          {el.name?.[lang] || "-"}
                        </Select.Option>
                      )
                    )}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Blog ID"
                name="blogId"
                rules={[{ required: true, message: "Please select blog" }]}
              >
                <Select placeholder="Select BlogId">
                  {Array.isArray(blogData) &&
                    blogData.map((ref: ReferenceBase) => (
                      <Select.Option key={ref.id} value={ref.id}>
                        {ref.title?.[lang] || "-"}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      </Drawer>

      {/* Drawer View */}
      <Drawer
        title="View Blog"
        open={viewOpen}
        width={800}
        onClose={() => setViewOpen(false)}
      >
        {viewData?.blog ? (
          <div>
            <p>
              <b>Published:</b> {viewData.blog.publishedDate}
            </p>
            <p>
              <b>Views:</b> {viewData.blog.viewsCount}
            </p>

            <div style={{ marginBottom: 20 }}>
              <b>Categories:</b>
              <ul>
                {viewData.categories?.map((c, idx) => (
                  <li key={idx}>{c[lang]}</li>
                ))}
              </ul>
            </div>

            <Tabs defaultActiveKey="uz" items={tabItems} />

            {viewData.blog.images?.length ? (
              <div style={{ marginTop: 20 }}>
                <b>Images:</b>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {viewData.blog.images.map((imgId) => (
                    <Image
                      key={imgId}
                      src={`https://back.foragedialog.uz/File/DownloadFile/download/${imgId}`}
                      alt="blog"
                      style={{ width: 150, borderRadius: 8 }}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p>No Data</p>
        )}
      </Drawer>
    </>
  );
};

export default ReferenceToBlogModel;
