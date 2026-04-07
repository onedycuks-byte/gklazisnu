import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Archive {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
  description: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export function useArchives() {
  const queryClient = useQueryClient();

  const { data: archives = [], isLoading } = useQuery({
    queryKey: ["archives"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("archives" as any)
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]) as Archive[];
    },
  });

  const uploadAndAdd = async ({ file, description }: { file: File; description: string }) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("archives")
      .upload(path, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("archives").getPublicUrl(path);

    const { error } = await supabase.from("archives" as any).insert({
      file_name: file.name,
      file_url: urlData.publicUrl,
      file_size: file.size,
      description: description || null,
    } as any);
    if (error) throw error;
  };

  const addMutation = useMutation({
    mutationFn: uploadAndAdd,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["archives"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (archive: Archive) => {
      // Extract storage path from URL
      const url = new URL(archive.file_url);
      const pathParts = url.pathname.split("/archives/");
      if (pathParts[1]) {
        await supabase.storage.from("archives").remove([decodeURIComponent(pathParts[1])]);
      }
      const { error } = await supabase.from("archives" as any).delete().eq("id", archive.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["archives"] }),
  });

  return {
    archives,
    isLoading,
    addArchive: addMutation.mutateAsync,
    isAdding: addMutation.isPending,
    deleteArchive: deleteMutation.mutateAsync,
  };
}
