import { useQuery } from '@tanstack/react-query';

import { client } from '@/lib/hono';

export const useGetPaymentterms = () => {
  const query = useQuery({
    queryKey: ['paymentterms'],
    queryFn: async () => {
      const response = await client.api.paymentterms.$get();
      console.log(response, 'response');

      if (!response.ok) {
        throw new Error('Failed to fetch PaymentTerms');
      }

      const { data } = await response.json();

      return data;
    }
  });

  return query;
};
