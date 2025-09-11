import { useState } from "react";
import {
  Row,
  Card,
  Table,
  Button,
  Drawer,
  Form,
  Input,
  Upload,
  Popconfirm,
  Tabs,
  message,
  Image,
  Modal,
  Descriptions,
  Divider,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useGet, usePost, usePut, useDelete } from "@/hooks";

const { TabPane } = Tabs;
const DEFAULT_IMAGE = "https://via.placeholder.com/80?text=No+Image";
const languages: ("uz" | "ru" | "en" | "ger")[] = ["uz", "ru", "en", "ger"];

const getFileUrl = (id?: string) =>
  id
    ? `${
        import.meta.env.VITE_REACT_API_URL
      }/File/DownloadFile/download?id=${id}`
    : "";

interface MultilangText {
  uz: string;
  ru: string;
  en: string;
  ger: string;
}

interface ResourceItem {
  id?: number;
  fileName: MultilangText;
  subject: MultilangText;
  fileId?: string;
  fileType?: string;
  size?: string;
  publishedDate?: string;
}

const emptyMultilang: MultilangText = { uz: "", ru: "", en: "", ger: "" };

const ResourceManager: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<"uz" | "ru" | "en" | "ger">(
    "uz"
  );
  const [selectedResource, setSelectedResource] = useState<ResourceItem>({
    fileName: emptyMultilang,
    subject: emptyMultilang,
  });
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState(DEFAULT_IMAGE);

  const [fileNameLang, setFileNameLang] =
    useState<MultilangText>(emptyMultilang);
  const [subjectLang, setSubjectLang] = useState<MultilangText>(emptyMultilang);

  const {
    data: resources,
    refetch,
    isLoading,
  } = useGet({
    path: "/Resource/GetAll",
    queryKey: "resource",
  });

  const createResource = usePost({
    path: "/Resource/Create",
    queryKey: ["resource"],
    onSuccess: () => {
      setDrawerOpen(false);
      resetForm();
      refetch();
      message.success("Resource created");
    },
  });

  const updateResource = usePut({
    path: "/Resource/Update",
    queryKey: ["resource"],
    onSuccess: () => {
      setDrawerOpen(false);
      resetForm();
      refetch();
      message.success("Resource updated");
    },
  });

  const deleteResource = useDelete({
    path: "/Resource/Delete",
    queryKey: ["resource"],
    onSuccess: () => {
      refetch();
      message.success("Resource deleted");
    },
  });

  const resetForm = () => {
    setSelectedResource({ fileName: emptyMultilang, subject: emptyMultilang });
    setFileList([]);
    setPreviewUrl(DEFAULT_IMAGE);
    setFileNameLang(emptyMultilang);
    setSubjectLang(emptyMultilang);
    setCurrentLang("uz");
  };

  const openDrawerForCreate = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (res: ResourceItem) => {
    setSelectedResource(res);
    setFileNameLang(res.fileName || emptyMultilang);
    setSubjectLang(res.subject || emptyMultilang);

    if (res.fileId) {
      setFileList([
        {
          uid: res.fileId,
          name: res.fileName?.uz || "file",
          status: "done",
          url: getFileUrl(res.fileId),
        },
      ]);
      setPreviewUrl(getFileUrl(res.fileId));
    } else {
      setFileList([]);
      setPreviewUrl(DEFAULT_IMAGE);
    }

    setCurrentLang("uz");
    setDrawerOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_REACT_API_URL}/File/Uploadfile`,
        { method: "POST", body: formData }
      );
      const data = await response.json();
      const content = data?.content;

      if (content?.id) {
        setSelectedResource((prev) => ({
          ...prev,
          fileId: content.id,
          fileType: content.contentType,
          size: content.size || "",
        }));
        setPreviewUrl(getFileUrl(content.id));
        setFileList([
          {
            uid: content.id,
            name: content.fileName,
            status: "done",
            url: getFileUrl(content.id),
          },
        ]);
        message.success(`${file.name} uploaded successfully`);
      } else {
        message.error(`${file.name} upload failed`);
      }
    } catch (err) {
      console.error(err);
      message.error(`${file.name} upload failed`);
    }

    return false; // prevent default upload
  };

  const handleSubmit = () => {
    if (!selectedResource?.fileId) {
      message.warning("Please upload a file");
      return;
    }

    const payload: ResourceItem = {
      fileName: fileNameLang,
      subject: subjectLang,
      fileId: selectedResource.fileId,
      fileType: selectedResource.fileType,
      size: selectedResource.size,
      id: selectedResource?.id,
    };

    if (selectedResource?.id) {
      updateResource.mutate(payload);
    } else {
      createResource.mutate(payload);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "File Name (Uz)",
      dataIndex: ["fileName", "uz"],
      key: "fileNameUz",
    },
    { title: "Subject (Uz)", dataIndex: ["subject", "uz"], key: "subjectUz" },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ResourceItem) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedResource(
                record || { fileName: emptyMultilang, subject: emptyMultilang }
              );
              setModalOpen(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            onClick={() => openDrawerForEdit(record)}
          />
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => deleteResource.mutate(`${record.id}`)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={currentLang}
          onChange={(key) => setCurrentLang(key as any)}
          items={languages.map((lang) => ({
            key: lang,
            label: lang.toUpperCase(),
          }))}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openDrawerForCreate}
        >
          Create Resource
        </Button>
      </Row>

      <Card>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={resources || []}
          loading={isLoading}
        />
      </Card>

      <Drawer
        title={selectedResource?.id ? "Edit Resource" : "Create Resource"}
        width={600}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        <Tabs
          activeKey={currentLang}
          onChange={(key) => setCurrentLang(key as any)}
        >
          {languages.map((lang) => (
            <TabPane tab={lang.toUpperCase()} key={lang}>
              <Form layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                  label={`File Name (${lang})`}
                  rules={[{ required: true }]}
                >
                  <Input
                    value={fileNameLang[lang] || ""}
                    onChange={(e) =>
                      setFileNameLang({
                        ...fileNameLang,
                        [lang]: e.target.value,
                      })
                    }
                  />
                </Form.Item>
                <Form.Item
                  label={`Subject (${lang})`}
                  rules={[{ required: true }]}
                >
                  <Input
                    value={subjectLang[lang] || ""}
                    onChange={(e) =>
                      setSubjectLang({ ...subjectLang, [lang]: e.target.value })
                    }
                  />
                </Form.Item>

                {lang === currentLang && (
                  <>
                    <Form.Item label="Upload File" required>
                      <Upload
                        beforeUpload={handleFileUpload}
                        fileList={fileList}
                        listType="picture-card"
                        onRemove={() => {
                          setFileList([]);
                          setPreviewUrl(DEFAULT_IMAGE);
                          setSelectedResource((prev) => ({
                            ...prev,
                            fileId: "",
                            fileType: "",
                            size: "",
                          }));
                        }}
                      >
                        {fileList.length === 0 && (
                          <div>
                            <UploadOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        )}
                      </Upload>
                      <div style={{ marginTop: 10 }}>
                        <img src={previewUrl} width={80} alt="preview" />
                      </div>
                    </Form.Item>

                    <Button type="primary" htmlType="submit">
                      {selectedResource?.id ? "Update" : "Create"}
                    </Button>
                  </>
                )}
              </Form>
            </TabPane>
          ))}
        </Tabs>
      </Drawer>

      <Modal
        title={selectedResource?.fileName?.[currentLang] || ""}
        open={modalOpen}
        footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
        onCancel={() => setModalOpen(false)}
      >
        {selectedResource && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="File Name">
                {selectedResource.fileName?.[currentLang] || ""}
              </Descriptions.Item>
              <Descriptions.Item label="Subject">
                {selectedResource.subject?.[currentLang] || ""}
              </Descriptions.Item>
              <Descriptions.Item label="File ID">
                {selectedResource.fileId || ""}
              </Descriptions.Item>
              <Descriptions.Item label="File Type">
                {selectedResource.fileType || ""}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {selectedResource.size || ""}
              </Descriptions.Item>
            </Descriptions>
            <Divider>Preview</Divider>
            {selectedResource.fileId && (
              <Image src={getFileUrl(selectedResource.fileId)} width={200} />
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourceManager;
