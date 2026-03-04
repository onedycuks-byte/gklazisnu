import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Discussion {
  id: string;
  author_name: string;
  message: string;
  is_approved: boolean;
  admin_reply: string | null;
  replied_at: string | null;
  created_at: string;
}

export function useDiscussions(showAll = false) {
  const queryClient = useQueryClient();

  const { data: discussions = [], isLoading } = useQuery({
    queryKey: ["discussions", showAll],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Discussion[];
    },
  });

  const addDiscussion = async (input: { author_name: string; message: string }) => {
    const { error } = await supabase.from("discussions").insert(input);
    if (!error) queryClient.invalidateQueries({ queryKey: ["discussions"] });
    return { error };
  };

  const replyDiscussion = async (id: string, reply: string) => {
    const { error } = await supabase
      .from("discussions")
      .update({ admin_reply: reply, replied_at: new Date().toISOString() })
      .eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["discussions"] });
    return { error };
  };

  const deleteDiscussion = async (id: string) => {
    const { error } = await supabase.from("discussions").delete().eq("id", id);
    if (!error) queryClient.invalidateQueries({ queryKey: ["discussions"] });
    return { error };
  };

  return { discussions, isLoading, addDiscussion, replyDiscussion, deleteDiscussion };
}
