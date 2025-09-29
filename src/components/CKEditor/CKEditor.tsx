// QuillEditorComponent.tsx
import React, { useRef } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

// 📌 Base embed
const BlockEmbed = Quill.import("blots/block/embed");

// 📌 Custom Video Blot
class VideoBlot extends BlockEmbed {
  static create(url: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute("src", url);
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", "true");
    node.classList.add("ql-custom-media");
    return node;
  }

  static value(node: HTMLElement) {
    return node.getAttribute("src") || "";
  }
}
VideoBlot.blotName = "video";
VideoBlot.tagName = "iframe";
Quill.register(VideoBlot);

// 📌 Custom Image Blot
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

// 📌 Rasm resize
Quill.register("modules/imageResize", ImageResize);

// 📌 Font size whitelist
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

  const handleChange = (
    _content: string,
    _delta: any,
    _source: any,
    editor: any
  ) => {
    onChange(editor.getHTML());
  };

  return (
    <div>
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
          height: 400px !important;
        }
      `}</style>
    </div>
  );
};

export default QuillEditorComponent;
