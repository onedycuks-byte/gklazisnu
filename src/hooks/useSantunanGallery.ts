import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export function useSantunanGallery() {
  const queryClient = useQueryClient();

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["santunan_gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("santunan_gallery" as any)
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data || []) as unknown as GalleryImage[];
    },
  });

  const addImageMutation = useMutation({
    mutationFn: async ({ image_url, caption }: { image_url: string; caption?: string }) => {
      const { error } = await supabase
        .from("santunan_gallery" as any)
        .insert({ image_url, caption: caption || null, sort_order: images.length } as any);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["santunan_gallery"] }),
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("santunan_gallery" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["santunan_gallery"] }),
  });

  const uploadImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `gallery-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("santunan-gallery").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("santunan-gallery").getPublicUrl(path);
    return data.publicUrl;
  };

  return {
    images,
    isLoading,
    addImage: addImageMutation.mutateAsync,
    isAdding: addImageMutation.isPending,
    deleteImage: deleteImageMutation.mutateAsync,
    uploadImage,
  };
}
