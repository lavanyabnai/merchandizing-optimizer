import { useMutation, useQueryClient } from "@tanstack/react-query"
import { client } from "@/lib/hono"

type CreateLocationRequest = {
  name: string
  country: string
  address?: string
  code?: string
  city?: string
  region?: string
  latitude?: number
  longitude?: number
  autofillCoordinates?: boolean
  postalCode?: string
}

export const useCreateLocation = () => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (json: CreateLocationRequest) => {
      try {
        const response = await client.api.locations.$post({ json })

        if (!response.ok) {
          let errorMessage = `Failed to create location: ${response.status}`;
          
          try {
            const errorData = await response.json();
            if ('error' in errorData) {
              errorMessage = errorData.error;
            }
          } catch {
            // If JSON parsing fails, fall back to text
            const errorText = await response.text();
            if (errorText && errorText !== 'Internal Server Error') {
              errorMessage = errorText;
            }
          }
          
          console.error("Location creation failed:", errorMessage);
          throw new Error(errorMessage);
        }

        const result = await response.json()
        return result
      } catch (error) {
        console.error("Location creation error:", error)
        throw error
      }
    },
    onSuccess: (data) => {
      console.log("Location created successfully:", data)
      queryClient.invalidateQueries({ queryKey: ["locations"] })
    },
    onError: (error) => {
      console.error("Location creation failed:", error)
    },
  })

  return mutation
}
