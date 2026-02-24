import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Program {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  collected_amount: number;
  qris_image_url: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function usePrograms() {
  const queryClient = useQueryClient();

  const { data: programs = [], isLoading } = useQuery({
    queryKey: ["programs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Program[];
    },
  });

  const addProgram = async (program: {
    title: string;
    description?: string;
    target_amount: number;
    qris_image_url?: string;
  }) => {
    const { error } = await supabase.from("programs").insert(program);
    if (!error) queryClient.invalidateQueries({ queryKey: ["programs"] });
    return { error };
  };

  const updateProgram = async (id: string, updates: Partial<Program>) => {
    const { error } = await supabase.from("programs").update(updates).eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["programs"] });
    return { error };
  };

  const deleteProgram = async (id: string) => {
    const { error } = await supabase.from("programs").delete().eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["programs"] });
    return { error };
  };

  const uploadProgramImage = async (file: File, folder: "images" | "qris" = "images") => {
    const ext = file.name.split(".").pop();
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("program-images").upload(path, file);
    if (error) return { url: null, error };
    const { data } = supabase.storage.from("program-images").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  };

  const activePrograms = programs.filter((p) => p.is_active);

  return { programs, activePrograms, isLoading, addProgram, updateProgram, deleteProgram, uploadProgramImage };
}
