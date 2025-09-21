import { get } from "lodash";
import { useState } from "react";
import { Button } from "@/components";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { useDelete, useGet, usePost, usePut } from "@/hooks";
import type { TableProps, TabsProps, UploadFile } from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from "@/assets/antd-design-icons";
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

interface TeamMember {
  id: string | number;
  name: Record<string, string>;
  role: Record<string, string>;
  about: Record<string, string>;
  experience: Record<string, string>;
  skills: Array<Record<string, string>>;
  picturesId?: string;
}

const BASE_URL = "https://back.foragedialog.uz";
const DEFAULT_IMAGE = "https://via.placeholder.com/80?text=No+Image";
const getFileUrl = (id?: string) =>
  id ? `${BASE_URL}/File/DownloadFile/download/${id}` : "";

const OurTeam: React.FC = () => {
  const [form] = Form.useForm();
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState(lang);

  const [uploadedPictureId, setUploadedPictureId] = useState<string>("");
  const [uploadedFileList, setUploadedFileList] = useState<UploadFile[]>([]);
  const [previewImage, setPreviewImage] = useState<string>(DEFAULT_IMAGE);

  const { data, refetch, isLoading } = useGet({
    queryKey: "ourTeam",
    path: "/OurTeam/GetAll",
  });

  const mutationHook = isPost ? usePost : usePut;
  const { mutate } = mutationHook({
    queryKey: ["ourTeam"],
    path: `/OurTeam/${isPost ? "Create" : "Update"}`,
    successText: `Success ${isPost ? "Create" : "Update"} Team Member`,
    onSuccess: () => {
      onClose();
      refetch();
    },
    onError: (err: any) => toast.error(err?.title || "Something went wrong"),
  });

  const mutateDelete = useDelete({
    queryKey: ["ourTeam"],
    path: "/OurTeam/Delete",
    successText: "Deleted successfully",
    onError: (err: any) => toast.error(err?.title || "Delete failed"),
  });

  const { mutate: uploadFile } = usePost({
    queryKey: ["uploadFile"],
    path: "/File/UploadFile",
    successText: "File uploaded successfully",
    onSuccess: (uploaded) => {
      const id = get(uploaded, "content.id", "");
      const name = get(uploaded, "content.fileName", "");
      setUploadedPictureId(id);
      const url = getFileUrl(id);
      setPreviewImage(url || DEFAULT_IMAGE);
      setUploadedFileList([{ uid: id, name, status: "done", url }]);
      form.setFieldValue("picturesId", id);
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

  // Drawer open qilish
  const openDrawData = (record?: TeamMember) => {
    if (record) {
      setIsPost(false);
      setSelectedId(record.id); // <-- id saqlandi
      form.setFieldsValue({
        ...record,
        picturesId: record.picturesId,
      });
      setUploadedPictureId(record.picturesId || "");
      const url = getFileUrl(record.picturesId);
      setPreviewImage(url || DEFAULT_IMAGE);
      setUploadedFileList([
        { uid: record.picturesId || "1", name: "picture", status: "done", url },
      ]);
    } else {
      setIsPost(true);
      setSelectedId(null); // <-- create bo'lsa id yo'q
      form.resetFields();
      setUploadedFileList([]);
      setPreviewImage(DEFAULT_IMAGE);
      setUploadedPictureId("");
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setSelectedId(null);
    setUploadedFileList([]);
    setPreviewImage(DEFAULT_IMAGE);
    setUploadedPictureId("");
    form.resetFields();
  };

  const onChangeTab = (key: string) => {
    setCurrentLang(key);
    setSearchParams({ lang: key, current });
  };

  const handleSubmit = (values: any) => {
    if (!values.picturesId) {
      toast.error("Please upload a picture");
      return;
    }

    const payload = {
      ...values,
      picturesId: uploadedPictureId,
    };

    if (!isPost && selectedId) {
      // faqat update payti id yuboramiz
      (payload as any).id = selectedId;
    }

    mutate(payload);
  };

  const columns: ColumnsType<TeamMember> = [
    {
      title: "Name",
      dataIndex: "name",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (value) => (
        <Tooltip title={value[currentLang]}>{value[currentLang]}</Tooltip>
      ),
    },
    {
      title: "Picture",
      dataIndex: "picturesId",
      render: (_v, record) => (
        <Image
          width={80}
          src={getFileUrl(record.picturesId) || DEFAULT_IMAGE}
          fallback={DEFAULT_IMAGE}
        />
      ),
    },
    {
      title: "Edit",
      render: (_: any, record: TeamMember) => (
        <Button type="text" size="large" onClick={() => openDrawData(record)}>
          <EditOutlined style={{ color: "green" }} />
        </Button>
      ),
    },
    {
      title: "Delete",
      render: (_: any, record: TeamMember) => (
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
        <Tabs
          items={items}
          onChange={onChangeTab}
          activeKey={currentLang}
          defaultActiveKey={currentLang}
        />
        <Button type="primary" onClick={() => openDrawData()}>
          Create
        </Button>
      </Row>

      <Table<TeamMember>
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={{ current: Number(current) }}
        rowKey={(record) => record.id}
        onChange={(e) =>
          setSearchParams({ lang: currentLang, current: String(e.current) })
        }
      />

      <Drawer
        width={600}
        open={open}
        onClose={onClose}
        title={isPost ? "Create Team Member" : "Update Team Member"}
      >
        <Tabs items={items} onChange={onChangeTab} activeKey={currentLang} />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: { uz: "", ru: "", en: "", ger: "" },
            role: { uz: "", ru: "", en: "", ger: "" },
            about: { uz: "", ru: "", en: "", ger: "" },
            experience: { uz: "", ru: "", en: "", ger: "" },
            skills: [{ uz: "", ru: "", en: "", ger: "" }],
            picturesId: "",
          }}
        >
          {["name", "role", "about", "experience"].map((field) => (
            <Col span={24} key={field}>
              <Form.Item
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                name={[field, currentLang]}
                rules={[
                  {
                    required: true,
                    message: `Please enter ${field} in ${currentLang}`,
                  },
                ]}
              >
                <Input placeholder={`Enter ${field}`} />
              </Form.Item>
            </Col>
          ))}

          <Col span={24}>
            <Form.List name="skills">
              {(fields, { add, remove }) => (
                <Form.Item label="Skills" required>
                  {fields.map((field, index) => (
                    <div
                      key={field.key}
                      style={{ display: "flex", gap: 8, marginBottom: 8 }}
                    >
                      <Form.Item
                        {...field}
                        name={[field.name, currentLang]}
                        rules={[
                          {
                            required: true,
                            message: `Please enter skill ${
                              index + 1
                            } in ${currentLang}`,
                          },
                        ]}
                        noStyle
                      >
                        <Input placeholder={`Skill ${index + 1}`} />
                      </Form.Item>
                      <Button type="default" onClick={() => remove(field.name)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button type="dashed" onClick={() => add()}>
                    Add Skill
                  </Button>
                </Form.Item>
              )}
            </Form.List>
          </Col>

          <Col span={24}>
            <Form.Item
              label="Upload Picture"
              name="picturesId"
              rules={[{ required: true, message: "Please upload a picture" }]}
            >
              <Upload
                beforeUpload={handleUpload}
                fileList={uploadedFileList}
                onRemove={() => {
                  setUploadedPictureId("");
                  setUploadedFileList([]);
                  setPreviewImage(DEFAULT_IMAGE);
                  form.setFieldValue("picturesId", "");
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

export default OurTeam;
