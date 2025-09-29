import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useEffect, useState } from "react";
import { CategorySection, CategoryTopContainer } from "./style";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@/assets/antd-design-icons";
import {
  Col,
  Row,
  Form,
  Table,
  Input,
  Drawer,
  Tooltip,
  Upload,
  Image,
  Tabs,
} from "antd";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

interface DataType {
  id: string | number;
  imageName: string;
  fileId: string;
}

const ImageModel: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const current = searchParams.get("current");
  const [fileId, setFileId] = useState<string>("");

  const [form] = Form.useForm();

  useEffect(() => {
    if (!current) {
      setSearchParams({ current: String(1) });
    }
  }, []);

  // GET all
  const { data, isLoading } = useGet({
    queryKey: "image-model",
    path: "/ImageModel/GetAll",
  });

  // POST or PUT
  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["image-model"],
    onSuccess: async () => onClose(),
    path: `/ImageModel/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Image`,
  });

  // DELETE
  const mutateDelete = useDelete({
    queryKey: ["image-model"],
    path: "/ImageModel/Delete",
    successText: "Delete Image Successfully",
    onError: async (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
  });

  const showDrawer = () => setOpen(true);

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    form.resetFields();
    setFileId("");
  };

  type DynamicValues = {
    id?: string | number;
    imageName: string;
    fileId: string;
  };

  // Upload logic
  const uploadProps = {
    name: "file",
    action: "https://back.foragedialog.uz/File/UploadFile",
    method: "post" as const,
    showUploadList: false,
    onChange(info: any) {
      if (info.file.status === "done") {
        const content = info.file.response?.content;
        if (content?.id) {
          setFileId(content.id);
          form.setFieldsValue({ fileId: content.id });
          toast.success("File uploaded successfully");
        }
      } else if (info.file.status === "error") {
        toast.error("File upload failed");
      }
    },
  };

  const openDrawData = (row: DataType) => {
    showDrawer();
    setIsPost(false);
    setFileId(row.fileId);

    // Form qiymatlarni set qilamiz
    form.setFieldsValue({
      id: row.id,
      imageName: row.imageName,
      fileId: row.fileId,
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Image Name",
      dataIndex: "imageName",
      render: (value) => <Tooltip title={value}>{value}</Tooltip>,
    },
    {
      title: "Preview",
      dataIndex: "fileId",
      render: (fileId: string) => (
        <Image
          src={`https://back.foragedialog.uz/File/DownloadFile/download/${fileId}`}
          alt="preview"
          style={{
            width: 80,
            height: 80,
            objectFit: "cover",
            borderRadius: 8,
          }}
        />
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

  const items = [
    { key: "uz", label: "Uzbek" },
    { key: "ru", label: "Rus" },
    { key: "en", label: "English" },
    { key: "ger", label: "German" },
  ];

  // ✅ Update / Create formatini to‘g‘riladik
  const handleSubmit = (values: DynamicValues) => {
    const payload = {
      id: isPost ? 0 : values.id, // create bo'lsa id=0
      fileId: fileId,
      imageName: values.imageName,
    };

    console.log("👉 Payload:", payload); // Debug uchun
    mutate(payload);
  };

  return (
    <CategorySection>
      <CategoryTopContainer>
        <Tabs items={items} />
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </CategoryTopContainer>

      <Table<DataType>
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{
          current: Number(current || 1),
        }}
        rowKey={(record) => record.id}
        onChange={(e) => setSearchParams({ current: String(e.current) })}
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={`${isPost ? "Create" : "Update"} Image`}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ imageName: "", fileId: "" }}
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="id" hidden>
                <Input type="hidden" />
              </Form.Item>

              <Form.Item
                label="Image Name"
                name="imageName"
                rules={[{ required: true, message: "Please enter image name" }]}
              >
                <Input placeholder="Please enter image name" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Upload Image"
                name="fileId"
                rules={[{ required: true }]}
              >
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
                {fileId && (
                  <img
                    src={`https://back.foragedialog.uz/File/DownloadFile/download/${fileId}`}
                    alt="preview"
                    style={{
                      marginTop: 16,
                      width: "100%",
                      maxHeight: 250,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                )}
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" disabled={!fileId}>
            Submit
          </Button>
        </Form>
      </Drawer>
    </CategorySection>
  );
};

export default ImageModel;
