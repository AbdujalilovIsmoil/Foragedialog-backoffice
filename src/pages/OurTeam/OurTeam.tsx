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

interface TeamMember {
  id: string | number;
  name: Record<string, string>;
  role: Record<string, string>;
  about: Record<string, string>;
  experience: Record<string, string>;
  skills: Array<Record<string, string>>;
  picturesId?: string;
}

const BASE_URL = "http://95.130.227.28:8080";
const DEFAULT_IMAGE = "https://via.placeholder.com/80?text=No+Image";
const getFileUrl = (id?: string) =>
  id ? `${BASE_URL}/File/DownloadFile/download?id=${id}` : "";

const OurTeam: React.FC = () => {
  const [isPost, setIsPost] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const lang = searchParams.get("lang") || "uz";
  const current = searchParams.get("current") || "1";
  const [currentLang, setCurrentLang] = useState(lang);

  const [values, setValues] = useState<{
    id?: string | number;
    name: Record<string, string>;
    role: Record<string, string>;
    about: Record<string, string>;
    experience: Record<string, string>;
    skills: Array<Record<string, string>>;
  }>({
    id: undefined,
    name: { uz: "", ru: "", en: "", ger: "" },
    role: { uz: "", ru: "", en: "", ger: "" },
    about: { uz: "", ru: "", en: "", ger: "" },
    experience: { uz: "", ru: "", en: "", ger: "" },
    skills: [{ uz: "", ru: "", en: "", ger: "" }],
  });

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

  // Drawer open qilish (create/update)
  const openDrawData = (record?: TeamMember) => {
    if (record) {
      setIsPost(false);
      setValues({
        id: record.id,
        name: { ...record.name },
        role: { ...record.role },
        about: { ...record.about },
        experience: { ...record.experience },
        skills: record.skills.length
          ? [...record.skills]
          : [{ uz: "", ru: "", en: "", ger: "" }],
      });
      setUploadedPictureId(record.picturesId || "");
      const url = getFileUrl(record.picturesId);
      setPreviewImage(url || DEFAULT_IMAGE);
      setUploadedFileList([
        { uid: record.picturesId || "1", name: "picture", status: "done", url },
      ]);
    } else {
      setIsPost(true);
    }
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
    setIsPost(true);
    setUploadedFileList([]);
    setPreviewImage(DEFAULT_IMAGE);
    setUploadedPictureId("");
    setValues({
      id: undefined,
      name: { uz: "", ru: "", en: "", ger: "" },
      role: { uz: "", ru: "", en: "", ger: "" },
      about: { uz: "", ru: "", en: "", ger: "" },
      experience: { uz: "", ru: "", en: "", ger: "" },
      skills: [{ uz: "", ru: "", en: "", ger: "" }],
    });
  };

  const changeField = (
    e: ChangeEvent<HTMLInputElement>,
    field: keyof typeof values
  ) => {
    const { name, value } = e.target;
    if (field === "skills") {
      const index = Number(name.split("-")[1]);
      const langKey = name.split("-")[0] as "uz" | "ru" | "en" | "ger";
      setValues((prev) => {
        const newSkills = [...prev.skills];
        newSkills[index][langKey] = value;
        return { ...prev, skills: newSkills };
      });
    } else {
      setValues((prev) => ({
        ...prev,
        [field]: {
          ...(prev[field as "name" | "role" | "about" | "experience"] as Record<
            string,
            string
          >),
          [name]: value,
        },
      }));
    }
  };

  const addSkill = () =>
    setValues((prev) => ({
      ...prev,
      skills: [...prev.skills, { uz: "", ru: "", en: "", ger: "" }],
    }));

  const removeSkill = (index: number) =>
    setValues((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));

  const onChangeTab = (key: string) => {
    setCurrentLang(key);
    setSearchParams({ lang: key, current });
  };

  const handleSubmit = () => {
    if (!uploadedPictureId) {
      toast.error("Please upload a picture");
      return;
    }
    mutate({ ...values, picturesId: uploadedPictureId });
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

        <Form layout="vertical" onFinish={handleSubmit}>
          {["name", "role", "about", "experience"].map((field) => (
            <Col span={24} key={field}>
              <Form.Item
                label={field.charAt(0).toUpperCase() + field.slice(1)}
                required
              >
                <Input
                  name={currentLang}
                  value={
                    (
                      values[field as keyof typeof values] as Record<
                        string,
                        string
                      >
                    )[currentLang]
                  }
                  onChange={(e) => changeField(e, field as keyof typeof values)}
                  placeholder={`Enter ${field}`}
                />
              </Form.Item>
            </Col>
          ))}

          <Col span={24}>
            <Form.Item label="Skills">
              {values.skills.map((skill, index) => (
                <div
                  key={index}
                  style={{ display: "flex", gap: 8, marginBottom: 8 }}
                >
                  <Input
                    name={`${currentLang}-${index}`}
                    value={skill[currentLang]}
                    onChange={(e) => changeField(e, "skills")}
                    placeholder={`Skill ${index + 1}`}
                  />
                  <Button type="default" onClick={() => removeSkill(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="dashed" onClick={addSkill}>
                Add Skill
              </Button>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item label="Upload Picture" required>
              <Upload
                beforeUpload={handleUpload}
                fileList={uploadedFileList}
                onRemove={() => {
                  setUploadedPictureId("");
                  setUploadedFileList([]);
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

export default OurTeam;
