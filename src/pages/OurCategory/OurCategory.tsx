import { Button } from "@/components";
import { toast } from "react-toastify";
import type { TableProps, TabsProps, UploadFile } from "antd";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import { useEffect, useState } from "react";
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

interface ApiItem {
  id?: string | number;
  name?: { uz?: string; ru?: string; en?: string; ger?: string };
  picturesId?: string | null;
  images?: string[];
  [k: string]: any;
}

interface DataType {
  id: string | number;
  name: { uz: string; ru: string; en: string; ger: string };
  images: string[];
}

const OurCategory: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState<string>(lang);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [nameValues, setNameValues] = useState({
    uz: "",
    ru: "",
    en: "",
    ger: "",
  }); // ← barcha tillar state

  useEffect(() => {
    setSearchParams({ lang: currentLang, current });
  }, [currentLang]);

  const { data: rawData, isLoading } = useGet({
    queryKey: "ourCategory",
    path: "/OurCategory/GetAll",
  });

  const tableData: DataType[] = (rawData || []).map((it: ApiItem) => {
    const nameObj = it.name || { uz: "", ru: "", en: "", ger: "" };
    const imgs: string[] =
      Array.isArray(it.images) && it.images.length
        ? it.images
        : it.picturesId
        ? [it.picturesId]
        : [];
    return { id: it.id as string | number, name: nameObj, images: imgs };
  });

  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["ourCategory"],
    path: `/OurCategory/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Our Category`,
    onSuccess: () => onClose(),
  });

  const mutateDelete = useDelete({
    queryKey: ["ourCategory"],
    path: "/OurCategory/Delete",
    successText: "Delete Our Category One",
    onError: (error: unknown) => {
      if (error instanceof Error) toast.error(error.message);
    },
  });

  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (uploaded: any) => {
      const fileId =
        uploaded?.content?.id || uploaded?.id || uploaded?.data?.id;
      const fileName =
        uploaded?.content?.fileName || uploaded?.fileName || "file";
      if (!fileId) {
        toast.error("Upload response missing id");
        return;
      }
      setImages((prev) => [...prev, fileId]);
      setFileList((prev) => [
        ...prev,
        {
          uid: fileId,
          name: fileName,
          url: `${
            import.meta.env.VITE_REACT_API_URL
          }/File/DownloadFile/download?id=${fileId}`,
          status: "done",
        },
      ]);
    },
    onError: () => toast.error("File upload failed"),
  });

  const onChangeTab = (key: string) => setCurrentLang(key);

  const showDrawer = () => {
    setOpen(true);
    setIsPost(true);
    setNameValues({ uz: "", ru: "", en: "", ger: "" }); // ← reset all languages
    form.setFieldsValue({ id: undefined, name: "" }); // only currentLang input controlled by form
    setFileList([]);
    setImages([]);
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setNameValues({ uz: "", ru: "", en: "", ger: "" });
    form.resetFields();
    setFileList([]);
    setImages([]);
  };

  const handleImageUpload = (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    uploadFile(formData);
    return false;
  };

  const openDrawData = (row: DataType) => {
    setOpen(true);
    setIsPost(false);
    setNameValues({ ...row.name }); // barcha tillar state ga
    form.setFieldsValue({ id: row.id, name: row.name }); // ← object ko'rinishida
    setFileList(
      row.images.map((id) => ({
        uid: id,
        name: id,
        url: `${
          import.meta.env.VITE_REACT_API_URL
        }/File/DownloadFile/download?id=${id}`,
        status: "done",
      }))
    );
    setImages([...row.images]);
  };

  const onSubmit = () => {
    const payload: any = { name: nameValues, picturesId: images[0] || null };
    if (!isPost) payload.id = form.getFieldValue("id");
    if (!payload.picturesId) {
      toast.error("Please upload at least one picture");
      return;
    }
    mutate(payload);
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value) => (
        <Tooltip title={value[currentLang as keyof DataType["name"]]}>
          {value[currentLang as keyof DataType["name"]]}
        </Tooltip>
      ),
    },
    {
      title: "Pictures",
      dataIndex: "images",
      render: (imgs) =>
        imgs.length ? (
          <Row gutter={8}>
            {imgs.map((id: number) => (
              <Col key={id}>
                <Image
                  width={80}
                  src={`${
                    import.meta.env.VITE_REACT_API_URL
                  }/File/DownloadFile/download?id=${id}`}
                  fallback={`${
                    import.meta.env.VITE_REACT_API_URL
                  }/File/DownloadFile/download?id=${id}`}
                />
              </Col>
            ))}
          </Row>
        ) : (
          <span>No Images</span>
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
      render: (record) => (
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
        <Tabs items={items} onChange={onChangeTab} activeKey={currentLang} />
        <Button type="primary" onClick={showDrawer}>
          Create
        </Button>
      </Row>

      <Table<DataType>
        columns={columns}
        dataSource={tableData}
        loading={isLoading}
        pagination={{ current: Number(current) }}
        rowKey={(record) => record.id}
        onChange={(pagination) =>
          setSearchParams({
            lang: currentLang,
            current: String(pagination.current),
          })
        }
      />

      <Drawer
        width={500}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Our Category" : "Edit Our Category"}
        styles={{ body: { paddingBottom: 80 } }}
      >
        <Tabs items={items} onChange={onChangeTab} activeKey={currentLang} />
        <Form layout="vertical" form={form} onFinish={onSubmit}>
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label={`Name (${currentLang.toUpperCase()})`}
            name={["name", currentLang]} // ← shu yer
            rules={[{ required: true, message: "Please enter name" }]}
          >
            <Input
              value={nameValues[currentLang as keyof typeof nameValues]}
              onChange={(e) =>
                setNameValues((prev) => ({
                  ...prev,
                  [currentLang]: e.target.value,
                }))
              }
            />
          </Form.Item>

          <Form.Item label="Upload Picture">
            <Upload
              beforeUpload={handleImageUpload}
              listType="picture"
              fileList={fileList}
              onRemove={(file) => {
                setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                setImages((prev) => prev.filter((id) => id !== file.uid));
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            {isPost ? "Create" : "Update"}
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default OurCategory;
