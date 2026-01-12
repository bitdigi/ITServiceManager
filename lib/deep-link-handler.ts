/**
 * Deep Link Handler
 * Handles deep links from QR codes and redirects to appropriate screens
 * Format: manusapp://ticket/TICKET_ID
 */

import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

/**
 * Parse deep link URL and extract ticket ID
 */
export function parseTicketDeepLink(url: string): string | null {
  try {
    // Format: manusapp://ticket/TICKET_ID
    const match = url.match(/manusapp:\/\/ticket\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error parsing deep link:', error);
    return null;
  }
}

/**
 * Generate Telegram fallback URL for a ticket
 */
export function generateTelegramFallbackURL(ticketId: string, groupId?: string): string {
  if (groupId) {
    // Direct link to Telegram group search
    return `https://t.me/search?q=${ticketId}`;
  }
  return '';
}

/**
 * Handle deep link - open ticket or fallback to Telegram
 */
export async function handleTicketDeepLink(url: string, groupId?: string): Promise<boolean> {
  try {
    const ticketId = parseTicketDeepLink(url);
    
    if (!ticketId) {
      console.error('Invalid ticket deep link:', url);
      return false;
    }

    // Try to navigate to ticket detail screen
    // This will be handled by the router in the app
    return true;
  } catch (error) {
    console.error('Error handling deep link:', error);
    
    // Fallback to Telegram
    const telegramUrl = generateTelegramFallbackURL(parseTicketDeepLink(url) || '', groupId);
    if (telegramUrl) {
      try {
        await WebBrowser.openBrowserAsync(telegramUrl);
        return true;
      } catch (e) {
        console.error('Error opening Telegram:', e);
      }
    }
    
    return false;
  }
}

/**
 * Hook to handle deep links in the app
 */
export function useDeepLinkHandler(router: ReturnType<typeof useRouter>, groupId?: string) {
  useEffect(() => {
    // Handle deep link when app is opened from QR code
    const handleDeepLink = ({ url }: { url: string }) => {
      const ticketId = parseTicketDeepLink(url);
      
      if (ticketId) {
        // Navigate to ticket detail screen
        router.push(`/ticket-detail/${ticketId}` as any);
      } else {
        // Try fallback to Telegram
        const telegramUrl = generateTelegramFallbackURL(ticketId || '', groupId);
        if (telegramUrl) {
          WebBrowser.openBrowserAsync(telegramUrl);
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check if app was opened from a deep link
    Linking.getInitialURL().then(url => {
      if (url != null) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router, groupId]);
}
