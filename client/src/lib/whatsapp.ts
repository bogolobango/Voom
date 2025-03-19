/**
 * WhatsApp Cloud API integration utilities
 * Requires environment variables:
 * - WHATSAPP_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_BUSINESS_ACCOUNT_ID
 */

interface WhatsAppConfig {
  token?: string;
  phoneNumberId?: string;
  businessAccountId?: string;
}

export interface WhatsAppMessagePayload {
  recipientPhoneNumber: string;
  messageText: string;
  previewUrl?: boolean;
}

export interface WhatsAppTemplatePayload {
  recipientPhoneNumber: string;
  templateName: string;
  languageCode: string;
  components?: {
    type: 'header' | 'body' | 'button';
    parameters: Array<{
      type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
      text?: string;
      currency?: {
        code: string;
        amount: number;
      };
      date_time?: {
        fallback_value: string;
      };
      image?: {
        link: string;
      };
      document?: {
        link: string;
      };
      video?: {
        link: string;
      };
    }>;
  }[];
}

class WhatsAppService {
  private config: WhatsAppConfig = {};
  private isConfigured = false;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    // Try to load config from environment variables
    this.config = {
      token: import.meta.env.VITE_WHATSAPP_TOKEN,
      phoneNumberId: import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID,
      businessAccountId: import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID
    };
    
    this.checkConfiguration();
  }

  /**
   * Check if the WhatsApp API is configured properly
   */
  checkConfiguration(): boolean {
    this.isConfigured = !!(
      this.config.token &&
      this.config.phoneNumberId &&
      this.config.businessAccountId
    );
    
    return this.isConfigured;
  }

  /**
   * Update the WhatsApp configuration
   */
  updateConfig(config: WhatsAppConfig): void {
    this.config = {
      ...this.config,
      ...config
    };
    
    this.checkConfiguration();
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendMessage(payload: WhatsAppMessagePayload): Promise<any> {
    if (!this.isConfigured) {
      console.error('WhatsApp API not configured');
      throw new Error('WhatsApp API not configured. Please set environment variables.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.token}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: payload.recipientPhoneNumber,
            type: 'text',
            text: {
              preview_url: payload.previewUrl || false,
              body: payload.messageText
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }

  /**
   * Send a template message via WhatsApp
   */
  async sendTemplateMessage(payload: WhatsAppTemplatePayload): Promise<any> {
    if (!this.isConfigured) {
      console.error('WhatsApp API not configured');
      throw new Error('WhatsApp API not configured. Please set environment variables.');
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.token}`
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: payload.recipientPhoneNumber,
            type: 'template',
            template: {
              name: payload.templateName,
              language: {
                code: payload.languageCode
              },
              components: payload.components || []
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API error: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }

  /**
   * Check if a phone number is valid for WhatsApp
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Ensure it has the + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Get the configuration status
   */
  getConfigStatus(): {
    isConfigured: boolean;
    missingParams: string[];
  } {
    const missingParams = [];
    
    if (!this.config.token) missingParams.push('WHATSAPP_TOKEN');
    if (!this.config.phoneNumberId) missingParams.push('WHATSAPP_PHONE_NUMBER_ID');
    if (!this.config.businessAccountId) missingParams.push('WHATSAPP_BUSINESS_ACCOUNT_ID');
    
    return {
      isConfigured: this.isConfigured,
      missingParams
    };
  }
}

// Create and export a singleton instance
export const whatsappService = new WhatsAppService();