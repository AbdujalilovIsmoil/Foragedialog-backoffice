"use client";

import React, { useState, useMemo } from "react";
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
  Modal,
  Descriptions,
  Divider,
  Select,
  Image as AntdImage,
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  EyeOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FileUnknownOutlined,
} from "@ant-design/icons";
import { useGet, usePost, usePut, useDelete } from "@/hooks";

const { TabPane } = Tabs;
const { Option } = Select;

type Language = "uz" | "ru" | "en" | "ger";
const languages: Language[] = ["uz", "ru", "en", "ger"];

const DEFAULT_IMAGE = "https://via.placeholder.com/160?text=No+Image";

// === IMPORTANT: use NEXT_PUBLIC env var for client-side Next.js ===
const BASE_API = import.meta.env.VITE_REACT_API_URL || "";
const getFileUrl = (id?: string) =>
  id ? `${BASE_API}/File/DownloadFile/download/${id}` : "";

const isImage = (fileType?: string) => (fileType || "").startsWith("image/");
const getFileIcon = (fileType?: string) => {
  if (!fileType) return <FileUnknownOutlined style={{ fontSize: 40 }} />;
  const ft = fileType.toLowerCase();
  if (ft.includes("pdf"))
    return <FilePdfOutlined style={{ fontSize: 40, color: "red" }} />;
  if (ft.includes("word") || ft.includes("msword") || ft.includes("doc"))
    return <FileWordOutlined style={{ fontSize: 40, color: "blue" }} />;
  if (
    ft.includes("excel") ||
    ft.includes("spreadsheet") ||
    ft.includes("sheet")
  )
    return <FileExcelOutlined style={{ fontSize: 40, color: "green" }} />;
  return <FileUnknownOutlined style={{ fontSize: 40 }} />;
};

interface MultilangText {
  uz: string;
  ru: string;
  en: string;
  ger: string;
}
interface SizeObject {
  uz: string;
  ru: string;
  en: string;
  ger: string;
}

interface ResourceItem {
  id?: number;
  fileName: MultilangText;
  subject: MultilangText;
  resourceCategoryId?: number;
  publishedDate?: string;
  fileIdUZ?: string;
  fileIdRU?: string;
  fileIdEN?: string;
  fileIdGER?: string;
  fileType?: string; // common file type (keeps last uploaded type)
  size?: SizeObject;
}

const emptyMultilang: MultilangText = { uz: "", ru: "", en: "", ger: "" };
const emptySize: SizeObject = { uz: "", ru: "", en: "", ger: "" };

const ResourceManager: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>("uz");
  const [selectedResource, setSelectedResource] = useState<ResourceItem>({
    fileName: emptyMultilang,
    subject: emptyMultilang,
    size: emptySize,
  });

  const [fileLists, setFileLists] = useState<Record<Language, any[]>>({
    uz: [],
    ru: [],
    en: [],
    ger: [],
  });

  const [previews, setPreviews] = useState<Record<Language, string>>({
    uz: DEFAULT_IMAGE,
    ru: DEFAULT_IMAGE,
    en: DEFAULT_IMAGE,
    ger: DEFAULT_IMAGE,
  });

  // categories
  const { data: categories, isLoading: categoriesLoading } = useGet({
    path: "/ResourceCategory/GetAll",
    queryKey: "resource-categories",
  });

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
    successText: "Resource deleted",
    onSuccess: () => {
      refetch();
      message.success("Resource deleted");
    },
  });

  const resetForm = () => {
    setSelectedResource({
      fileName: emptyMultilang,
      subject: emptyMultilang,
      size: emptySize,
    });
    setFileLists({ uz: [], ru: [], en: [], ger: [] });
    setPreviews({
      uz: DEFAULT_IMAGE,
      ru: DEFAULT_IMAGE,
      en: DEFAULT_IMAGE,
      ger: DEFAULT_IMAGE,
    });
    setCurrentLang("uz");
  };

  const openDrawerForCreate = () => {
    resetForm();
    setDrawerOpen(true);
  };

  const openDrawerForEdit = (res: ResourceItem) => {
    setSelectedResource({
      ...res,
      fileName: res.fileName || emptyMultilang,
      subject: res.subject || emptyMultilang,
      size: res.size || emptySize,
    });

    const updatedFileLists: Record<Language, any[]> = {
      uz: [],
      ru: [],
      en: [],
      ger: [],
    };
    const updatedPreviews: Record<Language, string> = {
      uz: DEFAULT_IMAGE,
      ru: DEFAULT_IMAGE,
      en: DEFAULT_IMAGE,
      ger: DEFAULT_IMAGE,
    };

    if (res.fileIdUZ) {
      updatedFileLists.uz = [
        {
          uid: res.fileIdUZ,
          name: res.fileName?.uz || "file",
          status: "done",
          url: getFileUrl(res.fileIdUZ),
        },
      ];
      updatedPreviews.uz = getFileUrl(res.fileIdUZ);
    }
    if (res.fileIdRU) {
      updatedFileLists.ru = [
        {
          uid: res.fileIdRU,
          name: res.fileName?.ru || "file",
          status: "done",
          url: getFileUrl(res.fileIdRU),
        },
      ];
      updatedPreviews.ru = getFileUrl(res.fileIdRU);
    }
    if (res.fileIdEN) {
      updatedFileLists.en = [
        {
          uid: res.fileIdEN,
          name: res.fileName?.en || "file",
          status: "done",
          url: getFileUrl(res.fileIdEN),
        },
      ];
      updatedPreviews.en = getFileUrl(res.fileIdEN);
    }
    if (res.fileIdGER) {
      updatedFileLists.ger = [
        {
          uid: res.fileIdGER,
          name: res.fileName?.ger || "file",
          status: "done",
          url: getFileUrl(res.fileIdGER),
        },
      ];
      updatedPreviews.ger = getFileUrl(res.fileIdGER);
    }

    setFileLists(updatedFileLists);
    setPreviews(updatedPreviews);
    setCurrentLang("uz");
    setDrawerOpen(true);
  };

  // upload file to server (uses NEXT_PUBLIC_API_URL)
  const uploadFileToServer = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const resp = await fetch(`${BASE_API}/File/Uploadfile`, {
      method: "POST",
      body: formData,
    });
    if (!resp.ok) throw new Error("Upload failed");
    const json = await resp.json();
    return json?.content;
  };

  const handleBeforeUpload = (lang: Language) => async (file: File) => {
    try {
      const content = await uploadFileToServer(file);
      if (content?.id) {
        setSelectedResource((prev) => ({
          ...prev,
          fileType: content.contentType,
          size: { ...(prev.size || emptySize), [lang]: content.size || "" },
          ...(lang === "uz" && { fileIdUZ: content.id }),
          ...(lang === "ru" && { fileIdRU: content.id }),
          ...(lang === "en" && { fileIdEN: content.id }),
          ...(lang === "ger" && { fileIdGER: content.id }),
        }));

        setFileLists((prev) => ({
          ...prev,
          [lang]: [
            {
              uid: content.id,
              name: content.fileName || file.name,
              status: "done",
              url: getFileUrl(content.id),
            },
          ],
        }));
        setPreviews((prev) => ({ ...prev, [lang]: getFileUrl(content.id) }));

        message.success(`${file.name} uploaded for ${lang.toUpperCase()}`);
      } else {
        message.error(`${file.name} upload failed`);
      }
    } catch (err) {
      console.error(err);
      message.error(`Upload failed for ${lang.toUpperCase()}`);
    }
    return false; // prevent default Upload behaviour
  };

  const handleRemoveFile = (lang: Language) => () => {
    setSelectedResource((prev) => ({
      ...prev,
      ...(lang === "uz" && { fileIdUZ: undefined }),
      ...(lang === "ru" && { fileIdRU: undefined }),
      ...(lang === "en" && { fileIdEN: undefined }),
      ...(lang === "ger" && { fileIdGER: undefined }),
      size: { ...(prev.size || emptySize), [lang]: "" },
    }));

    setFileLists((prev) => ({ ...prev, [lang]: [] }));
    setPreviews((prev) => ({ ...prev, [lang]: DEFAULT_IMAGE }));
  };

  const handleSubmit = () => {
    if (
      !selectedResource.fileIdUZ &&
      !selectedResource.fileIdRU &&
      !selectedResource.fileIdEN &&
      !selectedResource.fileIdGER
    ) {
      message.warning("Please upload at least one file (per language)");
      return;
    }
    if (!selectedResource.fileName || !selectedResource.subject) {
      message.warning("Please fill names and subjects");
      return;
    }

    const payload: any = {
      id: selectedResource.id,
      fileName: selectedResource.fileName,
      subject: selectedResource.subject,
      resourceCategoryId: selectedResource.resourceCategoryId,
      publishedDate: selectedResource.publishedDate,
      fileIdUZ: selectedResource.fileIdUZ,
      fileIdRU: selectedResource.fileIdRU,
      fileIdEN: selectedResource.fileIdEN,
      fileIdGER: selectedResource.fileIdGER,
      fileType: selectedResource.fileType,
      size: selectedResource.size,
    };

    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k]
    );

    if (selectedResource.id) {
      updateResource.mutate(payload);
    } else {
      createResource.mutate(payload);
    }
  };

  // file preview component (image or icon). Ensure consistent width/height
  const FilePreview: React.FC<{ url: string; fileType?: string }> = ({
    url,
    fileType,
  }) => {
    if (isImage(fileType)) {
      return (
        <AntdImage
          src={url || DEFAULT_IMAGE}
          width={160}
          style={{
            height: 120,
            objectFit: "cover",
            borderRadius: 8,
            border: "1px solid #eee",
          }}
          fallback={DEFAULT_IMAGE}
          alt="preview"
        />
      );
    }
    return (
      <div
        style={{
          width: 160,
          height: 120,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          border: "1px solid #eee",
        }}
      >
        {getFileIcon(fileType)}
      </div>
    );
  };

  const columns = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id" },
      {
        title: "File Name (UZ)",
        dataIndex: ["fileName", "uz"],
        key: "fileNameUz",
      },
      { title: "Subject (UZ)", dataIndex: ["subject", "uz"], key: "subjectUz" },
      {
        title: "Category",
        dataIndex: "resourceCategoryId",
        key: "category",
        render: (catId: number) => {
          const cat = (categories || []).find((c: any) => c.id === catId);
          return <span>{cat?.categoryName?.uz ?? "-"}</span>;
        },
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, record: ResourceItem) => (
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedResource(record);
                // populate previews for modal
                setPreviews({
                  uz: record.fileIdUZ
                    ? getFileUrl(record.fileIdUZ)
                    : DEFAULT_IMAGE,
                  ru: record.fileIdRU
                    ? getFileUrl(record.fileIdRU)
                    : DEFAULT_IMAGE,
                  en: record.fileIdEN
                    ? getFileUrl(record.fileIdEN)
                    : DEFAULT_IMAGE,
                  ger: record.fileIdGER
                    ? getFileUrl(record.fileIdGER)
                    : DEFAULT_IMAGE,
                });
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
    ],
    [categories]
  );

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Tabs
          activeKey={currentLang}
          onChange={(key) => setCurrentLang(key as Language)}
          items={languages.map((lang) => ({
            key: lang,
            label: lang.toUpperCase(),
          }))}
        />
        <div style={{ marginLeft: 12 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openDrawerForCreate}
          >
            Create Resource
          </Button>
        </div>
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
        width={720}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        destroyOnClose
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Category" required>
            <Select
              placeholder="Select category"
              value={selectedResource.resourceCategoryId}
              loading={categoriesLoading}
              onChange={(val: number) =>
                setSelectedResource((prev) => ({
                  ...prev,
                  resourceCategoryId: val,
                }))
              }
            >
              {(categories || []).map((c: any) => (
                <Option key={c.id} value={c.id}>
                  {c.categoryName?.uz ?? c.id}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Tabs
            activeKey={currentLang}
            onChange={(key) => setCurrentLang(key as Language)}
          >
            {languages.map((lang) => (
              <TabPane tab={lang.toUpperCase()} key={lang}>
                <Form.Item label={`File Name (${lang.toUpperCase()})`} required>
                  <Input
                    value={selectedResource.fileName?.[lang] ?? ""}
                    onChange={(e) =>
                      setSelectedResource((prev) => ({
                        ...prev,
                        fileName: {
                          ...(prev.fileName ?? emptyMultilang),
                          [lang]: e.target.value,
                        },
                      }))
                    }
                  />
                </Form.Item>

                <Form.Item label={`Subject (${lang.toUpperCase()})`} required>
                  <Input
                    value={selectedResource.subject?.[lang] ?? ""}
                    onChange={(e) =>
                      setSelectedResource((prev) => ({
                        ...prev,
                        subject: {
                          ...(prev.subject ?? emptyMultilang),
                          [lang]: e.target.value,
                        },
                      }))
                    }
                  />
                </Form.Item>

                <Form.Item label={`Upload File (${lang.toUpperCase()})`}>
                  <Upload
                    beforeUpload={handleBeforeUpload(lang)}
                    fileList={fileLists[lang]}
                    onRemove={handleRemoveFile(lang)}
                    listType="picture"
                  >
                    {fileLists[lang].length === 0 && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <UploadOutlined />
                        <div>Upload</div>
                      </div>
                    )}
                  </Upload>

                  <div style={{ marginTop: 10 }}>
                    {/* fallback if preview URL unreachable */}
                    <img
                      src={previews[lang]}
                      width={160}
                      height={120}
                      style={{
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #eee",
                      }}
                      alt={`${lang}-preview`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          DEFAULT_IMAGE;
                      }}
                    />
                  </div>
                </Form.Item>
              </TabPane>
            ))}
          </Tabs>

          <Form.Item>
            <div style={{ display: "flex", gap: 8 }}>
              <Button htmlType="button" onClick={() => setDrawerOpen(false)}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" onClick={handleSubmit}>
                {selectedResource?.id ? "Update" : "Create"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Drawer>

      <Modal
        title={
          selectedResource?.fileName?.uz ||
          selectedResource?.fileName?.en ||
          "Resource"
        }
        open={modalOpen}
        footer={<Button onClick={() => setModalOpen(false)}>Close</Button>}
        onCancel={() => setModalOpen(false)}
        width={800}
      >
        {selectedResource && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="File Name (UZ)">
                {selectedResource.fileName?.uz || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Subject (UZ)">
                {selectedResource.subject?.uz || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="File IDs">
                {selectedResource.fileIdUZ ||
                  selectedResource.fileIdRU ||
                  selectedResource.fileIdEN ||
                  selectedResource.fileIdGER ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="File Type">
                {selectedResource.fileType || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Size">
                {JSON.stringify(selectedResource.size) || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Category">
                {(categories || []).find(
                  (c: any) => c.id === selectedResource.resourceCategoryId
                )?.categoryName?.uz ?? "-"}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Preview (per language)</Divider>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {languages.map((lang) => {
                const id =
                  lang === "uz"
                    ? selectedResource.fileIdUZ
                    : lang === "ru"
                    ? selectedResource.fileIdRU
                    : lang === "en"
                    ? selectedResource.fileIdEN
                    : selectedResource.fileIdGER;
                const url = id ? getFileUrl(id) : DEFAULT_IMAGE;
                return (
                  <div key={lang} style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      {lang.toUpperCase()}
                    </div>
                    <FilePreview
                      url={url}
                      fileType={selectedResource.fileType}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ResourceManager;
