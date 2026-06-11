import { useRef, useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { supabase } from "@/shared/lib/supabase";
import { toast } from "sonner";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  bucket: "avatars" | "team-logos";
  placeholder?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, bucket, placeholder = "Carregar imagem", className = "" }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. O limite é 5MB.");
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao enviar imagem";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative overflow-hidden rounded-xl border-2 border-dashed border-border/60 bg-card/40 transition-all hover:border-primary-glow/40 cursor-pointer ${className}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {value ? (
        <>
          <img src={value} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
            {uploading
              ? <Loader2 className="size-5 animate-spin text-white" />
              : <Camera className="size-5 text-white" />
            }
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
          {uploading
            ? <Loader2 className="size-5 animate-spin" />
            : <>
                <Upload className="size-5" />
                <span className="text-xs">{placeholder}</span>
              </>
          }
        </div>
      )}
    </div>
  );
}
