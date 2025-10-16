import React, { useRef, useCallback } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";

// ✅ Image resize moduli
Quill.register("modules/imageResize", ImageResize);

// ✅ Custom image blot (rasm uchun)
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

  // 🎥 YouTube video qo'shish handler (barcha formatlar uchun)
  const videoHandler = useCallback(() => {
    const url = prompt("YouTube video URL kiriting:");
    if (!url) return;

    let videoId = "";
    const patterns = [
      /youtube\.com\/watch\?v=([^&]+)/, // watch?v=
      /youtu\.be\/([^?&]+)/, // youtu.be/
      /youtube\.com\/embed\/([^?&]+)/, // embed/
      /youtube\.com\/shorts\/([^?&]+)/, // shorts/
      /youtube\.com\/live\/([^?&]+)/, // live/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }

    if (!videoId) {
      alert("❌ YouTube link noto‘g‘ri formatda!");
      return;
    }

    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const quill = quillRef.current?.getEditor();

    if (quill) {
      const range = quill.getSelection(true);
      if (range) {
        quill.insertEmbed(range.index, "video", embedUrl);
        quill.setSelection({ index: range.index + 1, length: 0 }); // ✅ to‘g‘ri turdagi argument
      }
    }
  }, []);

  // 🧰 Quill modullar (image + video + resize)
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
        handlers: { image: imageHandler, video: videoHandler },
      },
      imageResize: {},
    }),
    [imageHandler, videoHandler]
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
  .ql-toolbar.ql-snow {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    overflow-x: auto;
    white-space: nowrap;
    gap: 4px;
  }

  .ql-toolbar.ql-snow .ql-formats {
    display: flex;
    align-items: center;
    margin-right: 6px;
  }

  .ql-toolbar.ql-snow button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ql-custom-media {
    display: block;
    margin: 20px auto;
    width: 100%;
    max-width: 900px;
    border-radius: 12px;
    overflow: hidden;
  }

  .ql-video {
    display: block;
    margin: 20px auto;
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    overflow: hidden;
  }
`}</style>
    </div>
  );
};

export default QuillEditorComponent;
