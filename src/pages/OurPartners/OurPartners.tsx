import { useState } from "react";
import { Button } from "@/components";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import type { TableProps, TabsProps, UploadFile } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@/assets/antd-design-icons";
import {
  Row,
  Form,
  Tabs,
  Table,
  Input,
  Image,
  Drawer,
  Upload,
  Tooltip,
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
  import.meta.env.VITE_REACT_API_URL || "https://back.foragedialog.uz";

const OurPartners: React.FC = () => {
  const [form] = Form.useForm();
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState(lang);

  const { data, isLoading } = useGet({
    queryKey: "ourPartners",
    path: "/OurPartners/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["ourPartners"],
    path: `/OurPartners/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Partner`,
    onSuccess: () => {
      onClose();
    },
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

  // Drawer yopish
  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setFileList([]);
    form.resetFields();
  };

  // Drawer ochish (create)
  const showDrawer = () => {
    setOpen(true);
    setIsPost(true);
    setFileList([]);
    form.resetFields();
  };

  // Drawer ochish (edit)
  const openDrawData = (row: DataType) => {
    setOpen(true);
    setIsPost(false);
    form.setFieldsValue({
      id: row.id,
      name: row.name,
      about: row.about,
      link: row.link,
      picturesId: row.picturesId,
    });

    if (row.picturesId) {
      setFileList([
        {
          uid: row.picturesId,
          name: "image",
          status: "done",
          url: `${API_URL}/File/DownloadFile/download/${row.picturesId}`,
        },
      ]);
    }
  };

  // Tilni almashtirish (faqat Table uchun)
  const onChangeLang = (key: string) => {
    setCurrentLang(key);
    setSearchParams({ lang: key, current });
  };

  // Upload fayl
  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (response: any) => {
      const uploaded = response.content;
      form.setFieldValue("picturesId", uploaded.id);
      setFileList([
        {
          uid: uploaded.id,
          name: uploaded.fileName,
          status: "done",
          url: `${API_URL}/File/DownloadFile/download/${uploaded.id}`,
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
            src={`${API_URL}/File/DownloadFile/download/${record.picturesId}`}
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

  const handleSubmit = (values: any) => {
    if (!values.picturesId) {
      toast.error("Please upload a picture");
      return;
    }

    // barcha tillarni to‘liq yuborish
    const fullValues = {
      ...values,
      name: {
        uz: values.name?.uz || "",
        ru: values.name?.ru || "",
        en: values.name?.en || "",
        ger: values.name?.ger || "",
      },
      about: {
        uz: values.about?.uz || "",
        ru: values.about?.ru || "",
        en: values.about?.en || "",
        ger: values.about?.ger || "",
      },
    };

    mutate(fullValues);
  };

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Tabs items={items} onChange={onChangeLang} activeKey={currentLang} />
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
        width={600}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Partner" : "Update Partner"}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            id: "",
            name: { uz: "", ru: "", en: "", ger: "" },
            about: { uz: "", ru: "", en: "", ger: "" },
            link: "",
            picturesId: "",
          }}
        >
          {/* ID ni yashirin field */}
          <Form.Item name="id" hidden>
            <Input type="hidden" />
          </Form.Item>

          {/* Tabs ichida barcha tillar uchun form */}
          <Tabs
            items={items.map((lang) => ({
              key: lang.key,
              label: lang.label,
              children: (
                <>
                  <Form.Item
                    label={`Name (${lang.label})`}
                    name={["name", lang.key]}
                    rules={[
                      {
                        required: lang.key === "uz",
                        message: "Please enter name",
                      },
                    ]}
                  >
                    <Input placeholder={`Enter name in ${lang.label}`} />
                  </Form.Item>

                  <Form.Item
                    label={`About (${lang.label})`}
                    name={["about", lang.key]}
                    rules={[
                      {
                        required: lang.key === "uz",
                        message: "Please enter about",
                      },
                    ]}
                  >
                    <Input placeholder={`Enter about in ${lang.label}`} />
                  </Form.Item>
                </>
              ),
            }))}
          />

          <Form.Item
            label="Link"
            name="link"
            rules={[
              { required: true, message: "Please enter link" },
              { type: "url", message: "Please enter valid URL" },
            ]}
          >
            <Input placeholder="Enter link" />
          </Form.Item>

          <Form.Item
            label="Upload Picture"
            name="picturesId"
            rules={[{ required: true, message: "Please upload a picture" }]}
          >
            <Upload
              beforeUpload={handleUpload}
              fileList={fileList}
              onRemove={() => {
                form.setFieldValue("picturesId", "");
                setFileList([]);
              }}
              listType="picture"
            >
              <Button icon={<UploadOutlined />}>Upload</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default OurPartners;
