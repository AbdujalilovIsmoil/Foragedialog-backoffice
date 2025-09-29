// QuillEditorComponent.tsx
import React, { useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

// Quill modulini ro'yxatga qo'shish
Quill.register("modules/imageResize", ImageResize);

// Rasm va video uchun custom CSS class
const Image = Quill.import("formats/image");
Image.className = "ql-custom-media";
Quill.register(Image, true);

const Video = Quill.import("formats/video");
Video.className = "ql-custom-media";
Quill.register(Video, true);

// Font size px orqali whitelist
const Size = Quill.import("formats/size");
Size.whitelist = [
  "10px",
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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, false] }],
      [{ size: Size.whitelist }],
      ["bold", "italic", "underline"],
      [{ align: [] }],
      ["image", "link", "video"],
    ],
    imageResize: {},
  };

  // Rasm upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !quillRef.current) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/upload", { method: "POST", body: formData });
      const data = await res.json();

      const editor = quillRef.current.getEditor();
      const range = editor.getSelection(true);

      if (range) {
        editor.insertText(range.index, "\n", "user");
        editor.insertEmbed(range.index + 1, "image", data.url, "user");
        editor.insertText(range.index + 2, "\n", "user");
        editor.setSelection(range.index + 3, 0);
        onChange(editor.root.innerHTML);
      }
    } catch (err) {
      console.error("Upload xatolik:", err);
    }
  };

  // // Link yoki YouTube video embed
  // const handleLink = () => {
  //   if (!quillRef.current) return;
  //   const editor = quillRef.current.getEditor();
  //   const range = editor.getSelection(true);
  //   if (!range) return;

  //   const url = prompt("Linkni kiriting:");
  //   if (!url) return;

  //   const youtubeMatch = url.match(
  //     /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/
  //   );

  //   if (youtubeMatch) {
  //     const videoId = youtubeMatch[1];
  //     const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  //     editor.insertText(range.index, "\n", "user");
  //     editor.insertEmbed(range.index + 1, "video", embedUrl, "user");
  //     editor.insertText(range.index + 2, "\n", "user");
  //     editor.setSelection(range.index + 3, 0);
  //   } else {
  //     editor.format("link", url);
  //   }

  //   onChange(editor.root.innerHTML);
  // };

  const handleChange = (
    _content: string,
    _delta: any,
    _source: any,
    editor: any
  ) => {
    onChange(editor.getHTML());
    console.log(editor.getHTML())
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleImageUpload}
      />
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
      />
      <style>{`
        .ql-custom-media {
          display: block;
          margin: 20px auto;
          width: 100% !important;
          height: 400px;
          object-fit: cover;
        }
        .ql-custom-media[src*="youtube.com/embed"] {
          height: 400px;
          width: 100% !important;
        }
        .ql-align-left { text-align: left; }
        .ql-align-center { text-align: center; }
        .ql-align-right { text-align: right; }
      `}</style>
    </div>
  );
};

export default QuillEditorComponent;
