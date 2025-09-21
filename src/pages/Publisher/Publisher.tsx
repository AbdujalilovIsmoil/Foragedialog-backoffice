import { useState } from "react";
import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, UploadFile } from "antd";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import {
  Col,
  Row,
  Table,
  Drawer,
  Form,
  Input,
  Upload,
  Image,
  Popconfirm,
} from "antd";
import {
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@/assets/antd-design-icons";

interface Publisher {
  id: number | string;
  name: string;
  imageId?: string;
}

interface FileResponse {
  fileName: string;
  contentType: string;
  path: string;
  id: string;
}

const BASE_URL = "https://back.foragedialog.uz";
const DEFAULT_IMAGE = "https://via.placeholder.com/120?text=No+Image";

const getFileUrl = (id?: string) =>
  id ? `${BASE_URL}/File/DownloadFile/download/${id}` : DEFAULT_IMAGE;

const PublisherComponent: React.FC = () => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [isPost, setIsPost] = useState(true);
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_IMAGE);
  const [uploadedFile, setUploadedFile] = useState<UploadFile[]>([]);
  const [currentId, setCurrentId] = useState<number | string | null>(null);

  // GET ALL
  const { data: rawData = [], isLoading } = useGet({
    queryKey: "publishers",
    path: "/Publisher/GetAll",
  });
  const publishersData: Publisher[] = Array.isArray(rawData) ? rawData : [];

  // CREATE
  const { mutate: createPublisher } = usePost({
    queryKey: ["publishers"],
    path: "/Publisher/Create",
    successText: "Publisher created successfully",
    onSuccess: () => onClose(),
  });

  // UPDATE
  const { mutate: updatePublisher } = usePut({
    queryKey: ["publishers"],
    path: "/Publisher/Update",
    successText: "Publisher updated successfully",
    onSuccess: () => onClose(),
  });

  const deletePublisher = useDelete({
    queryKey: ["publishers"],
    path: "/Publisher/Delete",
    successText: "Publisher deleted successfully",
  });

  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    onSuccess: (uploaded: { content: FileResponse }) => {
      const id = uploaded.content.id;
      const fileName = uploaded.content.fileName;
      const fileUrl = getFileUrl(id);

      setPreviewImage(fileUrl);
      setUploadedFile([
        { uid: id, name: fileName, status: "done", url: fileUrl },
      ]);
      form.setFieldValue("imageId", id);
      toast.success("File uploaded successfully");
    },
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData);
    return false; // prevent auto-upload
  };

  const openDrawer = (record?: Publisher) => {
    if (record) {
      setIsPost(false);
      setCurrentId(record.id);

      const imageUrl = getFileUrl(record.imageId);
      setPreviewImage(imageUrl);

      setUploadedFile(
        record.imageId
          ? [
              {
                uid: record.imageId,
                name: "image",
                status: "done",
                url: imageUrl,
              },
            ]
          : []
      );

      form.setFieldsValue(record);
    } else {
      setIsPost(true);
      setCurrentId(null);
      setPreviewImage(DEFAULT_IMAGE);
      setUploadedFile([]);
      form.resetFields();
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    form.resetFields();
    setPreviewImage(DEFAULT_IMAGE);
    setUploadedFile([]);
    setIsPost(true);
    setCurrentId(null);
  };

  const handleSubmit = (values: Publisher) => {
    if (isPost) {
      createPublisher(values);
    } else {
      updatePublisher({ ...values, id: currentId });
    }
  };

  const columns: TableProps<Publisher>["columns"] = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text) => text || "-",
    },
    {
      title: "Image",
      dataIndex: "imageId",
      render: (_, record) => (
        <Image
          width={80}
          height={80}
          src={getFileUrl(record.imageId)}
          fallback={DEFAULT_IMAGE}
          style={{
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      ),
    },
    {
      title: "Actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 12 }}>
          <Button type="default" onClick={() => openDrawer(record)}>
            <EditOutlined style={{ color: "blue" }} />
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this publisher?"
            okText="Yes"
            cancelText="No"
            onConfirm={() => deletePublisher.mutate(`${record.id}`)}
          >
            <Button danger>
              <DeleteOutlined />
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row justify="end" style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => openDrawer()}
        >
          Create Publisher
        </Button>
      </Row>

      <Table<Publisher>
        columns={columns}
        dataSource={publishersData}
        loading={isLoading}
        rowKey={(record) => record.id}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        destroyOnClose
        title={isPost ? "Create Publisher" : "Update Publisher"}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ name: "", imageId: "" }}
        >
          <Col span={24}>
            <Form.Item
              label="Name"
              name="name"
              rules={[
                { required: true, message: "Please enter publisher name" },
              ]}
            >
              <Input placeholder="Enter publisher name" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Upload Image"
              name="imageId"
              rules={[{ required: true, message: "Please upload an image" }]}
            >
              <Upload
                beforeUpload={handleUpload}
                fileList={uploadedFile}
                onRemove={() => {
                  form.setFieldValue("imageId", "");
                  setUploadedFile([]);
                  setPreviewImage(DEFAULT_IMAGE);
                }}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>

              <div style={{ marginTop: 10 }}>
                <Image
                  width={120}
                  height={120}
                  src={previewImage}
                  fallback={DEFAULT_IMAGE}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
              </div>
            </Form.Item>
          </Col>

          <Button type="primary" htmlType="submit" block>
            {isPost ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default PublisherComponent;
