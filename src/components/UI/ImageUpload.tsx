import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./Button";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface ImageUploadProps {
  label?: string;
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({
  label = "Images",
  images,
  onImagesChange,
  maxImages = 3,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    if (files.length > remainingSlots) {
      toast.error(
        t("imageUpload.limit", {
          count: remainingSlots,
        })
      );
      return;
    }

    setUploading(true);
    try {
      const newImageUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validation du type de fichier
        if (!file.type.startsWith("image/")) {
          toast.error(t("imageUpload.invalidType", { file: file.name }));
          continue;
        }

        // Validation de la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(t("imageUpload.tooLarge", { file: file.name }));
          continue;
        }

        // Pour la démo, on simule l'upload avec une URL temporaire
        // Dans un vrai projet, il faudrait uploader vers Supabase Storage
        const reader = new FileReader();
        const imageUrl = await new Promise<string>((resolve) => {
          reader.onload = (e) => {
            resolve(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        });

        newImageUrls.push(imageUrl);
      }

      onImagesChange([...images, ...newImageUrls]);
      toast.success(
        t("imageUpload.uploadSuccess", {
          count: newImageUrls.length,
        })
      );

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error(t("imageUpload.uploadError"));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} ({images.length}/{maxImages})
        </label>
      )}

      {/* Images actuelles */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-card rounded-2xl border border-border/30 overflow-hidden"
            >
              <img
                src={image}
                alt={`Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  icon={X}
                  onClick={() => removeImage(index)}
                  className="text-white border-white/50 hover:border-white hover:bg-white/10"
                >
                  Supprimer
                </Button>
              </div>
              {/* Indicateur de position */}
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded-full">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Zone d'upload */}
      {canAddMore && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="sr-only"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className={`
              relative flex flex-col items-center justify-center
              w-full h-32 md:h-40 
              border-2 border-dashed border-border/50 
              rounded-2xl cursor-pointer
              hover:border-primary/50 hover:bg-primary/5
              transition-all duration-300
              ${uploading ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {uploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground mb-3" />
              )}
              <p className="text-sm text-foreground font-medium">
                {uploading
                  ? "Upload en cours..."
                  : "Cliquez pour ajouter des images"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG jusqu'à 5MB ({maxImages - images.length} restante
                {maxImages - images.length > 1 ? "s" : ""})
              </p>
            </div>
          </label>
        </div>
      )}

      {/* État vide */}
      {images.length === 0 && (
        <div className="text-center py-8 border border-border/30 rounded-2xl bg-card/30">
          <ImageIcon className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {t("imageUpload.noImage")}
          </p>
        </div>
      )}

      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          Limite d'images atteinte ({maxImages} maximum)
        </p>
      )}
    </div>
  );
}
