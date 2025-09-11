import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, TabsProps, UploadFile } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useEffect, useState, type ChangeEvent } from "react";
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

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

interface DataType {
  id: string | number;
  name: { uz: string; ru: string; en: string; ger: string };
  about: { uz: string; ru: string; en: string; ger: string };
  link: string;
  picturesId: string;
}

const API_URL =
  import.meta.env.VITE_REACT_API_URL || "http://95.130.227.28:8080";

const OurPartners: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState(lang);

  const [values, setValues] = useState({
    id: "",
    name: { uz: "", ru: "", en: "", ger: "" },
    about: { uz: "", ru: "", en: "", ger: "" },
    link: "",
    picturesId: "",
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // Tabs uchun onChange
  const onChange = (key: string) => {
    setCurrentLang(key);
    setSearchParams({ lang: key, current: String(current) });
  };

  // Drawer va formni yopish
  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setFileList([]);
    setValues({
      id: "",
      name: { uz: "", ru: "", en: "", ger: "" },
      about: { uz: "", ru: "", en: "", ger: "" },
      link: "",
      picturesId: "",
    });
  };

  useEffect(() => {
    setSearchParams({ lang: currentLang, current: String(current) });
  }, []);

  const { data, isLoading } = useGet<DataType[]>({
    queryKey: "ourPartners",
    path: "/OurPartners/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["ourPartners"],
    onSuccess: onClose,
    path: `/OurPartners/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Our Partner`,
  });

  const mutateDelete = useDelete({
    queryKey: ["ourPartners"],
    path: "/OurPartners/Delete",
    successText: "Delete Partner",
    onError: (error: unknown) => {
      if (error instanceof Error)
        toast.error(error.message, { pauseOnHover: false });
    },
  });

  const changeLanguage = (
    e: ChangeEvent<HTMLInputElement>,
    field: "name" | "about"
  ) => {
    const { value, name } = e.target;
    setValues((prev) => ({
      ...prev,
      [field]: { ...prev[field], [name]: value },
    }));
  };

  // File upload
  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (response: any) => {
      const uploaded = response.content;
      setValues((prev) => ({ ...prev, picturesId: uploaded.id }));
      setFileList([
        {
          uid: uploaded.id,
          name: uploaded.fileName,
          status: "done",
          url: `${
            import.meta.env.VITE_REACT_API_URL
          }/File/DownloadFile/download?id=${uploaded.id}`,
        },
      ]);
    },
    onError: () => toast.error("Upload failed"),
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData);
    return false;
  };

  const showDrawer = () => {
    setOpen(true);
    setIsPost(true);
    setValues({
      id: "",
      name: { uz: "", ru: "", en: "", ger: "" },
      about: { uz: "", ru: "", en: "", ger: "" },
      link: "",
      picturesId: "",
    });
    setFileList([]);
  };

  const openDrawData = (row: DataType) => {
    setOpen(true);
    setIsPost(false);
    setValues({
      id: row.id,
      name: { ...row.name },
      about: { ...row.about },
      link: row.link,
      picturesId: row.picturesId,
    });
    if (row.picturesId) {
      setFileList([
        {
          uid: row.picturesId,
          name: "image",
          status: "done",
          url: `${API_URL}/File/DownloadFile/download?id=${row.picturesId}`,
        },
      ]);
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "About",
      dataIndex: "about",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "Link",
      dataIndex: "link",
      render: (value) => (
        <a href={value} target="_blank" rel="noopener noreferrer">
          {value}
        </a>
      ),
    },
    {
      title: "Picture",
      dataIndex: "picturesId",
      render: (_, record) =>
        record.picturesId ? (
          <Image
            width={80}
            src={`${
              import.meta.env.VITE_REACT_API_URL
            }/File/DownloadFile/download?id=${record.picturesId}`}
          />
        ) : (
          <span>No Image</span>
        ),
    },
    {
      title: "Edit",
      render: (_, record) => (
        <Button type="text" size="large" onClick={() => openDrawData(record)}>
          <EditOutlined style={{ color: "green" }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: (_, record) => (
        <Button
          type="text"
          size="large"
          onClick={() => mutateDelete.mutate(record.id)}
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
        <Tabs items={items} onChange={onChange} activeKey={currentLang} />
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </Row>

      <Table<DataType>
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ current: Number(current) }}
        rowKey={(record) => record.id}
        onChange={(e) => setSearchParams({ lang, current: String(e.current) })}
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Partner" : "Update Partner"}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Tabs items={items} onChange={onChange} activeKey={currentLang} />
        <Form layout="vertical" onFinish={() => mutate(values)}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Name" rules={[{ required: true }]}>
                <Input
                  name={currentLang}
                  value={values.name[currentLang]}
                  onChange={(e) => changeLanguage(e, "name")}
                  placeholder="Enter name"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="About" rules={[{ required: true }]}>
                <Input
                  name={currentLang}
                  value={values.about[currentLang]}
                  onChange={(e) => changeLanguage(e, "about")}
                  placeholder="Enter about"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Link" rules={[{ required: true }]}>
                <Input
                  value={values.link}
                  onChange={(e) =>
                    setValues({ ...values, link: e.target.value })
                  }
                  placeholder="Enter link"
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item label="Upload Picture">
                <Upload
                  beforeUpload={handleUpload}
                  fileList={fileList}
                  onRemove={() => {
                    setValues({ ...values, picturesId: "" });
                    setFileList([]);
                  }}
                  listType="picture"
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default OurPartners;
