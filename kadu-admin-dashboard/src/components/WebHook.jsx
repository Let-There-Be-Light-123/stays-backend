// WebhookService.js

import { useEffect } from 'react';
import Config from '../config/config';

const handleWebhook = (bookingReference, newStatus) => {
  useEffect(() => {
    const webhookEndpoint = `${Config.BASE_URL}/api/webhook`;

    const fetchData = async () => {
      try {
        const body = {
            booking_reference: bookingReference,
            status: newStatus,
        };
        const response = await fetch(webhookEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),          
        });

        const data = await response.json(); // Parse JSON response

        console.log('Webhook response:', data.message);
      } catch (error) {
        console.error('Failed to handle webhook:', error.message);
      }
    };

    fetchData();
  }, []);
  return null;
};

export default handleWebhook;
