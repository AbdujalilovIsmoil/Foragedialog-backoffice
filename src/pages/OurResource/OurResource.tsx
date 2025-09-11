import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, TabsProps, UploadFile } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useState, type ChangeEvent } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import {
  Col,
  Row,
  Form,
  Tabs,
  Table,
  Input,
  Drawer,
  Tooltip,
  Upload,
  Image,
} from "antd";
import { get } from "lodash";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

interface DataType {
  id: string | number;
  title: Record<string, string>;
  description: Record<string, string>;
  fileId?: string;
  fileName?: string;
  filePath?: string;
}

const BASE_URL = "http://95.130.227.28:8080";
const DEFAULT_IMAGE = "https://via.placeholder.com/80?text=No+Image";

const fileTypeIcons: Record<string, string> = {
  pdf: "https://img.icons8.com/color/48/000000/pdf.png",
  doc: "https://img.icons8.com/color/48/000000/ms-word.png",
  docx: "https://img.icons8.com/color/48/000000/ms-word.png",
  xls: "https://img.icons8.com/color/48/000000/ms-excel.png",
  xlsx: "https://img.icons8.com/color/48/000000/ms-excel.png",
  ppt: "https://img.icons8.com/color/48/000000/ms-powerpoint.png",
  pptx: "https://img.icons8.com/color/48/000000/ms-powerpoint.png",
  txt: "https://img.icons8.com/ios-filled/50/000000/document.png",
};

const getFileUrl = (id?: string) => {
  if (!id) return "";
  return `${BASE_URL}/File/DownloadFile/download?id=${id}`;
};

const getFileIcon = (fileName?: string, fileUrl?: string) => {
  if (!fileUrl) return DEFAULT_IMAGE;
  const ext = fileName?.split(".").pop()?.toLowerCase() || "";
  if (ext.match(/(jpeg|jpg|png|gif)$/)) return fileUrl; // agar rasm bo‘lsa
  return fileTypeIcons[ext] || DEFAULT_IMAGE; // icon
};

const OurResources: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentLang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current");

  const [values, setValues] = useState<{
    id?: string | number;
    title: Record<string, string>;
    description: Record<string, string>;
    filePath?: string;
  }>({
    id: undefined,
    title: { uz: "", ru: "", en: "", ger: "" },
    description: { uz: "", ru: "", en: "", ger: "" },
    filePath: "",
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_IMAGE);

  const { data, isLoading } = useGet({
    queryKey: "ourResources",
    path: "/OurResources/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["ourResources"],
    path: `/OurResources/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Resource`,
    onSuccess: () => onClose(),
    onError: (err: any) => {
      if (err?.errors?.FilePath) toast.error(err.errors.FilePath[0]);
    },
  });

  const mutateDelete = useDelete({
    queryKey: ["ourResources"],
    path: "/OurResources/Delete",
    successText: "Delete Resource",
    onError: (error: unknown) => {
      if (error instanceof Error)
        toast.error(error.message, { pauseOnHover: false });
    },
  });

  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (uploaded) => {
      const id = get(uploaded, "content.id", "");
      const name = get(uploaded, "content.fileName", "");
      const url = getFileUrl(id);
      setPreviewImage(getFileIcon(name, url));
      setFileList([
        {
          uid: id,
          name,
          status: "done",
          url,
        },
      ]);
      setValues((prev) => ({ ...prev, filePath: url }));
    },
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result.startsWith("data:image")) setPreviewImage(result);
      else setPreviewImage(DEFAULT_IMAGE);
    };
    reader.readAsDataURL(file);

    uploadFile(formData);
    return false;
  };

  const openDrawData = (record: DataType) => {
    setIsPost(false);
    setValues({
      id: record.id,
      title: { ...record.title },
      description: { ...record.description },
      filePath: record.filePath || getFileUrl(record.fileId),
    });
    setOpen(true);

    const url = record.filePath || getFileUrl(record.fileId);
    setPreviewImage(getFileIcon(record.fileName, url));
    setFileList([
      {
        uid: record.fileId || "1",
        name: record.fileName || "file",
        status: "done",
        url,
      },
    ]);
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setFileList([]);
    setValues({
      id: undefined,
      title: { uz: "", ru: "", en: "", ger: "" },
      description: { uz: "", ru: "", en: "", ger: "" },
      filePath: "",
    });
    setPreviewImage(DEFAULT_IMAGE);
  };

  const changeLanguage = (
    e: ChangeEvent<HTMLInputElement>,
    field: "title" | "description"
  ) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [field]: { ...prev[field], [name]: value },
    }));
  };

  const onChangeTab = (key: string) => {
    setSearchParams({
      lang: key,
      current: String(searchParams.get("current") || 1),
    });
  };

  const handleSubmit = () => {
    if (!values.filePath) {
      toast.error("Please upload a file before submitting");
      return;
    }
    mutate(values);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Title",
      dataIndex: "title",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "File",
      dataIndex: "fileId",
      render: (_value, record) => (
        <Image
          width={80}
          src={record.filePath || getFileUrl(record.fileId)}
          fallback={DEFAULT_IMAGE}
        />
      ),
    },
    {
      title: "Edit",
      render: (_: any, record: DataType) => (
        <Button type="text" size="large" onClick={() => openDrawData(record)}>
          <EditOutlined style={{ color: "green" }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: (_: any, record: DataType) => (
        <Button
          type="text"
          size="large"
          onClick={() => mutateDelete.mutate(`${record.id}`)}
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
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Tabs items={items} onChange={onChangeTab} activeKey={currentLang} />
        <Button type="primary" onClick={() => setOpen(true)}>
          Create
        </Button>
      </Row>

      <Table<DataType>
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ current: Number(current || 1) }}
        rowKey={(record) => record.id}
        onChange={(e) =>
          setSearchParams({ lang: currentLang, current: String(e.current) })
        }
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Resource" : "Update Resource"}
        style={{ paddingBottom: 80 }}
      >
        <Tabs items={items} onChange={onChangeTab} activeKey={currentLang} />

        <Form layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Title" required>
                <Input
                  name={currentLang}
                  value={values.title[currentLang]}
                  onChange={(e) => changeLanguage(e, "title")}
                  placeholder="Enter title"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Description" required>
                <Input
                  name={currentLang}
                  value={values.description[currentLang]}
                  onChange={(e) => changeLanguage(e, "description")}
                  placeholder="Enter description"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Upload File" required>
                <Upload
                  beforeUpload={handleUpload}
                  fileList={fileList}
                  onRemove={() => {
                    setFileList([]);
                    setPreviewImage(DEFAULT_IMAGE);
                    setValues((prev) => ({ ...prev, filePath: "" }));
                  }}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
                <div style={{ marginTop: 10 }}>
                  <Image
                    width={80}
                    src={previewImage}
                    fallback={DEFAULT_IMAGE}
                  />
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit">
            {isPost ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default OurResources;
