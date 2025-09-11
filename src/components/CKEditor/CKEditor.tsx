import "./index.css";
import React, { useState, useEffect, useMemo } from "react";
import { CKEditor, useCKEditorCloud } from "@ckeditor/ckeditor5-react";

interface CKEditorInterface {
  ckeDitorData: string;
  setCkeDitorData: React.Dispatch<React.SetStateAction<string>>;
}

const CKEditorComponent = ({
  ckeDitorData,
  setCkeDitorData,
}: CKEditorInterface) => {
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  const cloud = useCKEditorCloud({
    version: "46.0.3",
    ckbox: { version: "2.6.1" },
  });

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const { ClassicEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== "success" || !isLayoutReady)
      return { ClassicEditor: null, editorConfig: null };

    const {
      ClassicEditor,
      Autoformat,
      AutoImage,
      Autosave,
      BlockQuote,
      Bold,
      CKBox,
      CKBoxImageEdit,
      CloudServices,
      Emoji,
      Essentials,
      Heading,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsert,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      MediaEmbed,
      Mention,
      Paragraph,
      PasteFromOffice,
      PictureEditing,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Underline,
    } = cloud.CKEditor;

    return {
      ClassicEditor,
      editorConfig: {
        plugins: [
          Autoformat,
          AutoImage,
          Autosave,
          BlockQuote,
          Bold,
          CKBox,
          CKBoxImageEdit,
          CloudServices,
          Emoji,
          Essentials,
          Heading,
          ImageBlock,
          ImageCaption,
          ImageInline,
          ImageInsert,
          ImageInsertViaUrl,
          ImageResize,
          ImageStyle,
          ImageTextAlternative,
          ImageToolbar,
          ImageUpload,
          Indent,
          IndentBlock,
          Italic,
          Link,
          LinkImage,
          List,
          ListProperties,
          MediaEmbed,
          Mention,
          Paragraph,
          PasteFromOffice,
          PictureEditing,
          Table,
          TableCaption,
          TableCellProperties,
          TableColumnResize,
          TableProperties,
          TableToolbar,
          TextTransformation,
          TodoList,
          Underline,
        ],
        toolbar: {
          items: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "|",
            "emoji",
            "link",
            "insertImage",
            "ckbox",
            "mediaEmbed",
            "insertTable",
            "blockQuote",
            "|",
            "bulletedList",
            "numberedList",
            "todoList",
            "outdent",
            "indent",
          ],
          shouldNotGroupWhenFull: false,
        },
        cloudServices: {
          tokenUrl: import.meta.env.VITE_CLOUD_SERVICES_TOKEN_URL,
        },
        licenseKey: import.meta.env.VITE_LICENSE_KEY,
        placeholder: "Type or paste your content here!",
      },
    };
  }, [cloud, isLayoutReady]);

  return (
    <>
      {ClassicEditor && editorConfig && (
        <CKEditor
          editor={ClassicEditor}
          data={`${ckeDitorData}`}
          config={editorConfig}
          onChange={(_, editor) => {
            const data = editor.getData();

            setCkeDitorData(data);
          }}
        />
      )}
    </>
  );
};

export default CKEditorComponent;
