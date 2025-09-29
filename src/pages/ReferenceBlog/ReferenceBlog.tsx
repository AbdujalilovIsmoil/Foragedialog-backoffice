import { useState, useEffect } from "react";
import { Button } from "@/components";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import { toast } from "react-toastify";
import { Table, Drawer, Form, Select, Row, Col } from "antd";
import { DeleteOutlined, EditOutlined } from "@/assets/antd-design-icons";
import axios from "axios";

interface ReferenceBase {
  id: number;
  categoryId: number;
  blogId: number;
}

interface Blog {
  id: number;
  title: {
    uz: string;
    en: string;
  };
}

interface Category {
  uz: string;
  en: string;
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

  // References (GET ALL)
  const { data, isLoading } = useGet({
    queryKey: "reference-to-blog",
    path: "/ReferenceToBlog/GetAll",
  });

  // POST or PUT
  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["reference-to-blog"],
    path: `/ReferenceToBlog/${isPost ? "Create" : "UpdateModel"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Reference`,
    onSuccess: async () => onClose(),
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

  // Expand GetAll -> GetReferencesByCategoryIds
  useEffect(() => {
    const fetchExpanded = async () => {
      if (!data?.content) return;

      try {
        const categoryIds = [
          ...new Set(data.content.map((ref: ReferenceBase) => ref.categoryId)),
        ];

        const requests = categoryIds.map((id) =>
          axios.get(
            `https://back.foragedialog.uz/ReferenceToBlog/GetReferencesByCategoryIds?id=${id}`
          )
        );

        const responses = await Promise.all(requests);

        // barcha natijalarni bitta arrayga solish
        const merged: ReferenceFull[] = responses.flatMap(
          (res) => res.data?.content || []
        );

        setExpandedData(merged);
      } catch (err) {
        console.error("Error fetching expanded references", err);
      }
    };

    fetchExpanded();
  }, [data]);

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setSelectedRow(null);
    form.resetFields();
  };

  // Edit
  const openEdit = (row: ReferenceBase) => {
    setIsPost(false);
    setSelectedRow(row);
    form.setFieldsValue({
      categoryId: row.categoryId,
      blogId: row.blogId,
    });
    setOpen(true);
  };

  // Submit
  const handleSubmit = (values: any) => {
    const payload = {
      id: isPost ? 0 : selectedRow?.id,
      categoryId: values.categoryId,
      blogId: values.blogId,
    };
    mutate(payload);
  };

  // Table columns
  const columns = [
    {
      title: "Category",
      dataIndex: "categories",
      render: (categories: Category[]) =>
        categories && categories.length > 0
          ? `${categories[0].uz} / ${categories[0].en}`
          : "-",
    },
    {
      title: "Blog",
      dataIndex: "blog",
      render: (blog: Blog) =>
        blog ? `${blog.title.uz} / ${blog.title.en}` : "-",
    },
    {
      title: "Edit",
      render: (row: ReferenceBase) => (
        <Button type="text" size="large" onClick={() => openEdit(row)}>
          <EditOutlined style={{ color: "green" }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: (row: ReferenceBase) => (
        <Button
          type="text"
          size="large"
          onClick={() => mutateDelete.mutate(`${row.id}`)}
        >
          <DeleteOutlined style={{ color: "red" }} />
        </Button>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          display: "flex",
          marginBottom: 50,
          justifyContent: "flex-end",
        }}
      >
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </div>

      <Table<ReferenceFull>
        columns={columns}
        dataSource={expandedData}
        rowKey={(record) => record.id}
        loading={isLoading}
      />

      {/* Drawer (Create / Update) */}
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
                  {data?.content?.map((ref: ReferenceBase) => (
                    <Select.Option key={ref.categoryId} value={ref.categoryId}>
                      Category #{ref.categoryId}
                    </Select.Option>
                  ))}
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
                  {expandedData?.map((ref) => (
                    <Select.Option key={ref.blogId} value={ref.blogId}>
                      {ref.blog?.title?.uz || `Blog #${ref.blogId}`}
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
    </>
  );
};

export default ReferenceToBlogModel;
