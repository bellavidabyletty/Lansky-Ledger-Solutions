import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://uunfhkenfzqpsefysfrq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_-GllBTBxUhHem6DvP2bB4A_KBcFA7VH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const itemsService = {
    async getAllItems() {
          const { data, error } = await supabase
            .from("items")
            .select("*")
            .order("created_at", { ascending: false });

      if (error) throw error;
          return data || [];
    },

    async addItem(item: {
          name: string;
          cost: number;
          price: number;
          status: string;
    }) {
          const { data, error } = await supabase
            .from("items")
            .insert([item])
            .select();

      if (error) throw error;
          return data?.[0];
    },

    async updateItem(id: number, updates: any) {
          const { data, error } = await supabase
            .from("items")
            .update(updates)
            .eq("id", id)
            .select();

      if (error) throw error;
          return data?.[0];
    },

    async deleteItem(id: number) {
          const { error } = await supabase
            .from("items")
            .delete()
            .eq("id", id);

      if (error) throw error;
    },

    async getItemsByStatus(status: string) {
          const { data, error } = await supabase
            .from("items")
            .select("*")
            .eq("status", status)
            .order("created_at", { ascending: false });

      if (error) throw error;
          return data || [];
    },
};
