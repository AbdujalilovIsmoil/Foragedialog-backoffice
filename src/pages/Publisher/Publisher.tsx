import { get } from "lodash";
import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, UploadFile } from "antd";
import { useState, type ChangeEvent } from "react";
import { useGet, usePost, usePut, useDelete } from "@/hooks";
import { Col, Row, Table, Drawer, Form, Input, Upload, Image } from "antd";
import {
  EditOutlined,
  UploadOutlined,
  DeleteOutlined,
} from "@/assets/antd-design-icons";

interface Publisher {
  id: number | string;
  name: string;
  imageId?: string;
}

const BASE_URL = "http://95.130.227.28:8080";
const DEFAULT_IMAGE = "https://via.placeholder.com/80?text=No+Image";

const getFileUrl = (id?: string) =>
  id ? `${BASE_URL}/File/DownloadFile/download/${id}` : DEFAULT_IMAGE;

const PublisherComponent: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);

  const [values, setValues] = useState<Publisher>({
    id: 0,
    name: "",
    imageId: "",
  });

  const [uploadedFile, setUploadedFile] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_IMAGE);

  // GET ALL PUBLISHERS
  const { data: rawData = [], isLoading } = useGet({
    queryKey: "publishers",
    path: "/Publisher/GetAll",
  });

  const publishersData: Publisher[] = Array.isArray(rawData) ? rawData : [];

  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["publishers"],
    path: `/Publisher/${isPost ? "Create" : "Update"}`,
    successText: `Publisher ${isPost ? "created" : "updated"} successfully`,
    onSuccess: () => onClose(),
    onError: (err: any) => toast.error(err?.title || "Something went wrong"),
  });

  const mutateDelete = useDelete({
    queryKey: ["publishers"],
    path: "/Publisher/Delete",
    successText: "Deleted successfully",
    onError: (err: any) => toast.error(err?.title || "Delete failed"),
  });

  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (uploaded) => {
      const id = get(uploaded, "content.id", "");
      setValues((prev) => ({ ...prev, imageId: id }));
      setPreviewImage(getFileUrl(id));
      setUploadedFile([
        {
          uid: id,
          name: get(uploaded, "content.fileName", "image"),
          status: "done",
          url: getFileUrl(id),
        },
      ]);
    },
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result.startsWith("data:image")) setPreviewImage(result);
    };
    reader.readAsDataURL(file);

    uploadFile(formData);
    return false;
  };

  const openDrawer = (record?: Publisher) => {
    if (record) {
      setIsPost(false);
      setValues({ ...record });
      setPreviewImage(getFileUrl(record.imageId));
      setUploadedFile([
        {
          uid: record.imageId || "1",
          name: "image",
          status: "done",
          url: getFileUrl(record.imageId),
        },
      ]);
    } else {
      setIsPost(true);
      setValues({ id: 0, name: "", imageId: "" });
      setPreviewImage(DEFAULT_IMAGE);
      setUploadedFile([]);
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setUploadedFile([]);
    setPreviewImage(DEFAULT_IMAGE);
    setValues({ id: 0, name: "", imageId: "" });
  };

  const handleChangeField = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!values.name) {
      toast.error("Name is required");
      return;
    }
    if (!values.imageId) {
      toast.error("Please upload an image");
      return;
    }
    mutate(values);
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
      render: (_v, record) => (
        <Image
          width={80}
          src={getFileUrl(record.imageId)}
          fallback={DEFAULT_IMAGE}
        />
      ),
    },
    {
      title: "Edit",
      render: (_: any, record: Publisher) => (
        <Button type="text" onClick={() => openDrawer(record)}>
          <EditOutlined style={{ color: "green", fontSize: 22 }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: (_: any, record: Publisher) => (
        <Button type="text" onClick={() => mutateDelete.mutate(`${record.id}`)}>
          <DeleteOutlined style={{ color: "red", fontSize: 22 }} />
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row
        justify="space-between"
        style={{
          display: "flex",
          marginBottom: 16,
          justifyContent: "flex-end",
        }}
      >
        <Button type="primary" onClick={() => openDrawer()}>
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
        title={isPost ? "Create Publisher" : "Update Publisher"}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Col span={24}>
            <Form.Item label="Name" required>
              <Input
                name="name"
                value={values.name}
                onChange={handleChangeField}
                placeholder="Enter publisher name"
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Upload Image" required>
              <Upload
                beforeUpload={handleUpload}
                fileList={uploadedFile}
                onRemove={() => {
                  setValues((prev) => ({ ...prev, imageId: "" }));
                  setUploadedFile([]);
                  setPreviewImage(DEFAULT_IMAGE);
                }}
                listType="picture"
              >
                <Button icon={<UploadOutlined />}>Upload</Button>
              </Upload>
              <div style={{ marginTop: 10 }}>
                <Image width={80} src={previewImage} fallback={DEFAULT_IMAGE} />
              </div>
            </Form.Item>
          </Col>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default PublisherComponent;
