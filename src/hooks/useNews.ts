import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  image_url: string | null;
  is_published: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export function useNews() {
  const queryClient = useQueryClient();

  const { data: news = [], isLoading } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as NewsItem[];
    },
  });

  const addNews = async (item: {
    title: string;
    excerpt?: string;
    content?: string;
    category?: string;
    image_url?: string;
  }) => {
    const { error } = await supabase.from("news").insert(item);
    if (!error) queryClient.invalidateQueries({ queryKey: ["news"] });
    return { error };
  };

  const updateNews = async (id: string, updates: Partial<NewsItem>) => {
    const { error } = await supabase.from("news").update(updates).eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["news"] });
    return { error };
  };

  const deleteNews = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["news"] });
    return { error };
  };

  const uploadNewsImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `news/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("program-images").upload(path, file);
    if (error) return { url: null, error };
    const { data } = supabase.storage.from("program-images").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  };

  const publishedNews = news.filter((n) => n.is_published);

  return { news, publishedNews, isLoading, addNews, updateNews, deleteNews, uploadNewsImage };
}
