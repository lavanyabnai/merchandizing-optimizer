import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetCashaccounts = () => {
  const query = useQuery({
    queryKey: ['cashaccounts'],
    queryFn: async () => {
      const response = await client.api.cashaccounts.$get();

      if (!response.ok) {
        throw new Error('Failed to fetch cashaccounts');
      }

      const { data } = await response.json();
      
      return data;
    }
  });

  return query;
};
