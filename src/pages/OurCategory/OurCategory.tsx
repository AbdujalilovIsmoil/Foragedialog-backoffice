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
import { storage } from "@/services";

type ColumnsType<T extends object = object> = TableProps<T>["columns"];

interface DataType {
  id: string | number;
  name: {
    uz: string;
    ru: string;
    en: string;
    ger: string;
  };
  picturesId: string;
  picturePath?: string;
}

const OurCategory: React.FC = () => {
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
    queryKey: "ourCategory",
    path: "/OurCategory/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;

  const { mutate } = mutationHook({
    queryKey: ["ourCategory"],
    onSuccess: async () => onClose(),
    path: `/OurCategory/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Our Category`,
  });

  const mutateDelete = useDelete({
    queryKey: ["ourCategory"],
    path: "/OurCategory/Delete",
    successText: "Delete Our Category One",
    onError: async (error: unknown) => {
      if (error instanceof Error) {
        toast.error(error.message, { pauseOnHover: false });
      }
    },
  });

  // File upload hook
  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onError: async (error: unknown) => {
      toast.error("File upload failed");
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
      picturesId: string;
    }>
  >({
    id: "",
    name: {
      uz: "",
      ru: "",
      en: "",
      ger: "",
    },
    picturesId: "",
  });

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const changeLanguage = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    setValues({
      ...values,
      name: {
        ...values.name,
        [name]: value,
      },
    });
  };

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    uploadFile(formData, {
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
  };

  const openDrawData = (values: DataType) => {
    showDrawer();
    setIsPost(false);
    setValues({
      id: values.id,
      name: { ...values.name },
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
      render: (value) => {
        return (
          <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
        );
      },
    },
    {
      title: "Picture",
      dataIndex: "picturePath",
      render: (value) => value && <Image width={80} src={value} />,
    },
    {
      title: "Edit",
      render: (value) => {
        return (
          <Button type="text" size="large" onClick={() => openDrawData(value)}>
            <EditOutlined style={{ color: "green" }} />
          </Button>
        );
      },
    },
    {
      title: "Delete",
      render: ({ id }) => {
        return (
          <Button
            type="text"
            size="large"
            onClick={() => mutateDelete.mutate(id)}
          >
            <DeleteOutlined style={{ color: "red" }} />
          </Button>
        );
      },
    },
  ];

  console.log(storage.get("data"));
  

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
        title="Create Our Category"
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
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
                name={currentLang}
                rules={[{ required: true, message: "Please enter name" }]}
              >
                <Input
                  name={currentLang}
                  onChange={changeLanguage}
                  placeholder="Please enter name"
                  value={
                    values.name[currentLang as keyof typeof values.name] || ""
                  }
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item label="Upload Picture">
                <Upload
                  beforeUpload={(file) => {
                    handleUpload(file);
                    return false;
                  }}
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

export default OurCategory;
