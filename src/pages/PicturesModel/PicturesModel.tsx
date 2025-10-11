import { useState } from "react";
import { Button } from "@/components";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import { toast } from "react-toastify";
import { Table, Drawer, Form, Select, Row, Col, Tooltip, Image } from "antd";
import { DeleteOutlined, EditOutlined } from "@/assets/antd-design-icons";

interface CategoryType {
  id: number;
  category: {
    uz: string;
    ru: string;
    en: string;
    ger: string;
  };
}

interface ImageType {
  id: number;
  imageName: string;
  fileId: string;
}

interface PicturesType {
  id: number;
  categoryId: number;
  CategoryName: {
    uz: string;
    ru: string;
    en: string;
    ger: string;
  };
  imagesIds: number[];
  imageModels: ImageType[];
}

const PicturesModel: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [isPost, setIsPost] = useState(true);
  const [selectedRow, setSelectedRow] = useState<PicturesType | null>(null);

  const [form] = Form.useForm();

  // Categories
  const { data: categories } = useGet({
    queryKey: "image-categories",
    path: "/ImageCategory/GetAll",
  });

  // Images (array qaytadi)
  const { data: images } = useGet({
    queryKey: "images",
    path: "/ImageModel/GetAll",
  });

  // PicturesModel (GET ALL)
  const { data, isLoading } = useGet({
    queryKey: "pictures-model",
    path: "/PicturesModel/GetAll",
  });

  // POST or PUT
  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["pictures-model"],
    path: `/PicturesModel/${isPost ? "Create" : "UpdateModel"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Picture`,
    onSuccess: async () => onClose(),
  });

  // DELETE
  const mutateDelete = useDelete({
    queryKey: ["pictures-model"],
    path: "/PicturesModel/Delete",
    successText: "Picture Deleted",
    onError: async (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
    },
  });

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setSelectedRow(null);
    form.resetFields();
  };

  // Edit
  const openEdit = (row: PicturesType) => {
    setIsPost(false);
    setSelectedRow(row);
    form.setFieldsValue({
      categoryId: row.categoryId,
      imagesIds: row.imagesIds,
    });
    setOpen(true);
  };

  // Submit
  const handleSubmit = (values: any) => {
    const selectedCategory = categories?.find(
      (cat: CategoryType) => cat.id === values.categoryId
    );

    if (!selectedCategory) {
      toast.error("Category not found");
      return;
    }

    const payload = {
      id: isPost ? 0 : selectedRow?.id,
      categoryId: values.categoryId,
      categoryName: selectedCategory.category,
      imagesIds: values.imagesIds || [],
    };
    mutate(payload);
  };

  // Table columns
  const columns = [
    {
      title: "Category",
      dataIndex: "categoryName",
      render: (value: PicturesType["CategoryName"]) => (
        <Tooltip title={value.uz}>{value.uz}</Tooltip>
      ),
    },
    {
      title: "Images (Preview)",
      dataIndex: "imageModels",
      render: (images: PicturesType["imageModels"]) =>
        images && images.length > 0 ? (
          images.slice(0, 2).map((img) => (
            <Image
              key={img.id}
              src={`https://back.foragedialog.uz/File/DownloadFile/download/${img.fileId}`}
              alt={img.imageName}
              style={{
                width: 50,
                height: 50,
                objectFit: "cover",
                marginRight: 5,
                borderRadius: 4,
              }}
            />
          ))
        ) : (
          <i>No Images</i>
        ),
    },
    {
      title: "Edit",
      render: (row: PicturesType) => (
        <Button type="text" size="large" onClick={() => openEdit(row)}>
          <EditOutlined style={{ color: "green" }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: (row: PicturesType) => (
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
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </div>

      <Table<PicturesType>
        columns={columns}
        dataSource={data || []}
        rowKey={(record) => record.id}
        loading={isLoading}
        expandable={{
          expandedRowRender: (record) => (
            <div>
              <h4>All Images:</h4>
              {record.imageModels && record.imageModels.length > 0 ? (
                record.imageModels.map((img) => (
                  <div key={img.id} style={{ marginBottom: 8 }}>
                    <Image
                      src={`https://back.foragedialog.uz/File/DownloadFile/download/${img.fileId}`}
                      alt={img.imageName}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                    <div>{img.imageName}</div>
                  </div>
                ))
              ) : (
                <i>No Images Found</i>
              )}
            </div>
          ),
        }}
      />

      {/* Drawer (Create / Update) */}
      <Drawer
        title={`${isPost ? "Create" : "Update"} Picture`}
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
                rules={[{ required: true, message: "Please select category" }]}
              >
                <Select placeholder="Select Category">
                  {categories?.map((cat: CategoryType) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.category.uz} / {cat.category.en}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Images"
                name="imagesIds"
                rules={[{ required: true, message: "Please select images" }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select Images"
                  optionFilterProp="children"
                >
                  {images?.map((img: ImageType) => (
                    <Select.Option key={img.id} value={img.id}>
                      {img.imageName}
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

export default PicturesModel;
