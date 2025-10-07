import { useState, useEffect } from "react";
import { Button } from "@/components";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import { toast } from "react-toastify";
import { Table, Drawer, Form, Select, Row, Col, Image } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@/assets/antd-design-icons";
import axios from "axios";

interface ReferenceToPictures {
  id: number;
  categoryId: number;
  picturesModelId: number;
  downloadLinks?: string[];
}

interface Category {
  id: number;
  name: Record<string, string>;
}

interface PicturesModel {
  id: number;
  categoryName: Record<string, string>;
}

const ReferenceToPicturesModel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isPost, setIsPost] = useState(true);
  const [selectedRow, setSelectedRow] = useState<ReferenceToPictures | null>(
    null
  );
  const [form] = Form.useForm();

  const [expandedData, setExpandedData] = useState<ReferenceToPictures[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [viewData, setViewData] = useState<ReferenceToPictures | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

  const [lang, setLang] = useState<"uz" | "ru" | "en" | "ger">("uz");

  // Get all references
  const { data, isLoading, refetch } = useGet({
    queryKey: "reference-to-pictures",
    path: "/ReferenceToPictures/GetAll",
  });

  // Get categories and pictures models
  const { data: categories } = useGet({
    queryKey: "categories",
    path: "/OurCategory/GetAll",
  });

  const { data: picturesModels } = useGet({
    queryKey: "pictures-models",
    path: "/PicturesModel/GetAll",
  });

  // POST or PUT
  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["reference-to-pictures"],
    path: `/ReferenceToPictures/${isPost ? "Create" : "Update"}`,
    successText: `Successfully ${isPost ? "created" : "updated"} reference`,
    onSuccess: () => {
      onClose();
      refetch();
      fetchByCategory();
    },
  });

  // DELETE
  const mutateDelete = useDelete({
    queryKey: ["reference-to-pictures"],
    path: "/ReferenceToPictures/Delete",
    successText: "Reference deleted",
    onError: (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
    },
    onSuccess: () => fetchByCategory(),
  });

  // ✅ Category bo‘yicha data olish
  const fetchByCategory = async () => {
    try {
      if (!selectedCategory) {
        setExpandedData(data?.content || []);
        return;
      }
      const res = await axios.get(
        `https://back.foragedialog.uz/ReferenceToPictures/GetReferencesByCategoryIds?id=${selectedCategory}`
      );
      setExpandedData(res.data?.content || []);
    } catch (err) {
      console.error("Error fetching by category:", err);
    }
  };

  useEffect(() => {
    fetchByCategory();
  }, [selectedCategory, data]);

  // 🧩 Drawer control
  const showDrawer = () => {
    setOpen(true);
    setIsPost(true);
    form.resetFields();
  };

  const onClose = () => {
    setOpen(false);
    setSelectedRow(null);
    form.resetFields();
  };

  const openEdit = (row: ReferenceToPictures) => {
    setIsPost(false);
    setSelectedRow(row);
    form.setFieldsValue({
      categoryId: row.categoryId,
      picturesModelId: row.picturesModelId,
    });
    setOpen(true);
  };

  const openView = (row: ReferenceToPictures) => {
    setViewData(row);
    setViewOpen(true);
  };

  const handleSubmit = (values: any) => {
    const payload = {
      id: isPost ? 0 : selectedRow?.id,
      categoryId: values.categoryId,
      picturesModelId: values.picturesModelId,
    };
    mutate(payload);
  };

  const columns = [
    {
      title: "Category",
      dataIndex: "categoryId",
      render: (id: number) =>
        categories?.find((c: Category) => c.id === id)?.name?.[lang] || "-",
    },
    {
      title: "Pictures Model",
      dataIndex: "picturesModelId",
      render: (id: number) =>
        picturesModels?.find((p: PicturesModel) => p.id === id)?.title?.[
          lang
        ] || "-",
    },
    {
      title: "Images",
      dataIndex: "downloadLinks",
      render: (links: string[]) =>
        links?.length ? (
          <Image
            src={links[0]}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 6,
            }}
          />
        ) : (
          "-"
        ),
    },
    {
      title: "Actions",
      render: (row: ReferenceToPictures) => (
        <div style={{ display: "flex", gap: 10 }}>
          <Button type="text" onClick={() => openEdit(row)}>
            <EditOutlined style={{ color: "green" }} />
          </Button>
          <Button type="text" onClick={() => mutateDelete.mutate(`${row.id}`)}>
            <DeleteOutlined style={{ color: "red" }} />
          </Button>
          <Button type="text" onClick={() => openView(row)}>
            <EyeOutlined style={{ color: "blue" }} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Lang and Category filter */}
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
          placeholder="Filter by Category"
          allowClear
          style={{ width: 250 }}
          onChange={(val) => setSelectedCategory(val || null)}
        >
          {categories?.map((cat: Category) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.name?.[lang] || "-"}
            </Select.Option>
          ))}
        </Select>

        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </div>

      {/* Table */}
      <Table<ReferenceToPictures>
        columns={columns}
        dataSource={expandedData}
        rowKey={(r) => r.id}
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
                label="Category"
                name="categoryId"
                rules={[
                  { required: true, message: "Please select a category" },
                ]}
              >
                <Select placeholder="Select Category">
                  {categories?.map((cat: Category) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.name?.[lang] || "-"}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Pictures Model"
                name="picturesModelId"
                rules={[
                  { required: true, message: "Please select a pictures model" },
                ]}
              >
                <Select placeholder="Select Pictures Model">
                  {picturesModels?.map((p: PicturesModel) => {
                    console.log(p);

                    return (
                      <Select.Option key={p.id} value={p.id}>
                        {p.categoryName?.[lang] || "-"}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" style={{ marginTop: 10 }}>
            {isPost ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>

      {/* View Drawer */}
      <Drawer
        title="View Reference Images"
        open={viewOpen}
        width={800}
        onClose={() => setViewOpen(false)}
      >
        {viewData ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 15 }}>
            {viewData.downloadLinks && viewData.downloadLinks.length > 0 ? (
              viewData.downloadLinks.map((link, idx) => (
                <Image
                  key={idx}
                  src={link}
                  alt={`image-${idx}`}
                  style={{
                    width: 180,
                    height: 180,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ))
            ) : (
              <p>No images found</p>
            )}
          </div>
        ) : (
          <p>No Data</p>
        )}
      </Drawer>
    </>
  );
};

export default ReferenceToPicturesModel;
