import React, { useRef, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

// ✅ Image resize moduli
Quill.register("modules/imageResize", ImageResize);

// ✅ Custom image blot
const BlockEmbed = Quill.import("blots/block/embed");
class ImageBlot extends BlockEmbed {
  static create(url: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute("src", url);
    node.setAttribute("alt", "image");
    node.classList.add("ql-custom-media");
    return node;
  }
  static value(node: HTMLElement) {
    return node.getAttribute("src") || "";
  }
}
ImageBlot.blotName = "image";
ImageBlot.tagName = "img";
Quill.register(ImageBlot);

// ✅ Font size ro‘yxati
const Size = Quill.import("formats/size");
Size.whitelist = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "32px",
  "48px",
];
Quill.register(Size, true);

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const QuillEditorComponent: React.FC<QuillEditorProps> = ({
  value,
  onChange,
}) => {
  const quillRef = useRef<ReactQuill | null>(null);

  // 📤 Faylni upload qilish funksiyasi
  const uploadImage = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("https://back.foragedialog.uz/File/Uploadfile", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      console.log("data", data);

      return `https://back.foragedialog.uz/File/DownloadFile/download/${data?.content?.id}`;
    } catch (err) {
      console.error("Image upload error:", err);
      return null;
    }
  };

  // 🖼️ Custom image handler
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const imageUrl = await uploadImage(file);
      const quill = quillRef.current?.getEditor();

      if (imageUrl && quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", imageUrl);
        quill.setSelection((range.index + 1) as any);
      }
    };
  }, []);

  // 🧰 Quill modullar (useMemo bilan barqaror qilish)
  const modules = React.useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, false] }],
          [{ size: Size.whitelist }],
          ["bold", "italic", "underline"],
          [{ align: [] }],
          ["link", "image", "video"],
        ],
        handlers: { image: imageHandler },
      },
      imageResize: {},
    }),
    [imageHandler]
  );

  // 🔁 Content o‘zgarishini kuzatish
  const handleChange = useCallback(
    (_content: string, _delta: any, _source: any, editor: any) => {
      onChange(editor.getHTML());
    },
    [onChange]
  );

  return (
    <div>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ""}
        onChange={handleChange}
        modules={modules}
        preserveWhitespace
      />

      <style>{`
  .ql-custom-media {
    display: block;
    margin: 20px auto;
    width: 100%;
    max-width: 900px;
    border-radius: 12px;
    overflow: hidden;
  }
`}</style>
    </div>
  );
};

export default QuillEditorComponent;
