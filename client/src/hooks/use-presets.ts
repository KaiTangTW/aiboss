import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertPreset } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePresets() {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: [api.presets.list.path],
    queryFn: async () => {
      const res = await fetch(api.presets.list.path);
      if (!res.ok) throw new Error("Failed to fetch presets");
      return api.presets.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertPreset) => {
      const res = await fetch(api.presets.create.path, {
        method: api.presets.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.presets.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create preset");
      }
      return api.presets.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.presets.list.path] });
      toast({
        title: "Preset saved",
        description: "Your custom timer has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.presets.delete.path, { id });
      const res = await fetch(url, { method: api.presets.delete.method });
      
      if (!res.ok) {
        if (res.status === 404) throw new Error("Preset not found");
        throw new Error("Failed to delete preset");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.presets.list.path] });
      toast({
        title: "Preset deleted",
        description: "The preset has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });
}
