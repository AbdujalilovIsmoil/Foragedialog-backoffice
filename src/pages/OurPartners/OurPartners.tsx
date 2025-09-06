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
  name: {
    uz: string;
    ru: string;
    en: string;
    ger: string;
  };
  about: {
    uz: string;
    ru: string;
    en: string;
    ger: string;
  };
  link: string;
  picturesId: string;
  picturePath?: string; // backend qaytaradigan path
}

const OurPartners: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current");
  const [currentLang, setCurrentLang] = useState(lang);

  useEffect(() => {
    if (!lang) {
      setSearchParams({ lang: "uz", current: String(1) });
    } else {
      setSearchParams({ lang, current: String(current ? current : 1) });
    }
  }, []);

  const { data, isLoading } = useGet({
    queryKey: "ourPartners",
    path: "/OurPartners/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["ourPartners"],
    onSuccess: async () => onClose(),
    path: `/OurPartners/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Our Partner`,
  });

  const mutateDelete = useDelete({
    queryKey: ["ourPartners"],
    path: "/OurPartners/Delete",
    successText: "Delete Partner",
    onError: async (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
  });

  const onChange = (key: string) => {
    setCurrentLang(key);
    setSearchParams({
      lang: key,
      current: String(searchParams.get("current")),
    });
  };

  const showDrawer = () => setOpen(true);

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setFileList([]);
  };

  type DynamicValues<T extends object = {}> = {
    id: string | number;
  } & T;

  const [values, setValues] = useState<
    DynamicValues<{
      name: Record<string, string>;
      about: Record<string, string>;
      link: string;
      picturesId: string;
    }>
  >({
    id: "",
    name: { uz: "", ru: "", en: "", ger: "" },
    about: { uz: "", ru: "", en: "", ger: "" },
    link: "",
    picturesId: "",
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const changeLanguage = (
    e: ChangeEvent<HTMLInputElement>,
    field: "name" | "about"
  ) => {
    const { value, name } = e.target;
    setValues({
      ...values,
      [field]: {
        ...values[field],
        [name]: value,
      },
    });
  };

  // ✅ Upload hookdan foydalanamiz
  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (uploaded: any) => {
      setValues((prev) => ({
        ...prev,
        picturesId: uploaded.id,
      }));

      setFileList([
        {
          uid: uploaded.id,
          name: uploaded.fileName,
          status: "done",
          url: uploaded.path,
        },
      ]);
    },
  });

  const handleUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData);
    return false; // prevent auto upload
  };

  const openDrawData = (values: DataType) => {
    showDrawer();
    setIsPost(false);
    setValues({
      id: values.id,
      name: { ...values.name },
      about: { ...values.about },
      link: values.link,
      picturesId: values.picturesId,
    });

    if (values.picturePath) {
      setFileList([
        {
          uid: values.picturesId,
          name: "image",
          status: "done",
          url: values.picturePath,
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
      dataIndex: "picturePath",
      render: (value) => {
        return <Image width={80} src={value} />;
      },
    },
    {
      title: "Edit",
      render: (value) => (
        <Button type="text" size="large" onClick={() => openDrawData(value)}>
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

  const items: TabsProps["items"] = [
    { key: "uz", label: "Uzbek" },
    { key: "ru", label: "Rus" },
    { key: "en", label: "English" },
    { key: "ger", label: "German" },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Tabs
          items={items}
          onChange={onChange}
          activeKey={currentLang}
          defaultActiveKey={currentLang}
        />
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </Row>

      <Table<DataType>
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{
          current: Number(current || 1),
        }}
        rowKey={(record) => record.id}
        onChange={(e) => setSearchParams({ lang, current: String(e.current) })}
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Partner" : "Update Partner"}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Tabs
          items={items}
          onChange={onChange}
          activeKey={currentLang}
          defaultActiveKey={currentLang}
        />

        <Form layout="vertical" onFinish={() => mutate(values)}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Name"
                name={`name-${currentLang}`}
                rules={[{ required: true }]}
              >
                <Input
                  name={currentLang}
                  onChange={(e) => changeLanguage(e, "name")}
                  placeholder="Enter name"
                  value={values.name[currentLang]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="About"
                name={`about-${currentLang}`}
                rules={[{ required: true }]}
              >
                <Input
                  name={currentLang}
                  onChange={(e) => changeLanguage(e, "about")}
                  placeholder="Enter about"
                  value={values.about[currentLang]}
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Link" name="link" rules={[{ required: true }]}>
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
