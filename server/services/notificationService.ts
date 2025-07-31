import { DealData, sendWhatsAppNotifications } from './whatsapp';
import { sendTelegramMessage, generateTelegramAccountsMessage, generateTelegramLogisticsMessage, generateTelegramBossMessage } from './telegram';

// Telegram Chat IDs from environment
const TELEGRAM_CHAT_ID_ACCOUNTS = process.env.TELEGRAM_CHAT_ID_ACCOUNTS;
const TELEGRAM_CHAT_ID_LOGISTICS = process.env.TELEGRAM_CHAT_ID_LOGISTICS;
const TELEGRAM_CHAT_ID_BOSS1 = process.env.TELEGRAM_CHAT_ID_BOSS1;
const TELEGRAM_CHAT_ID_BOSSOG = process.env.TELEGRAM_CHAT_ID_BOSSOG;

export async function sendDealNotifications(deal: DealData) {
  const notifications = [];

  // --- Telegram Notifications ---
  if (TELEGRAM_CHAT_ID_ACCOUNTS) {
    const accountsMessage = generateTelegramAccountsMessage(deal);
    notifications.push(
      sendTelegramMessage(TELEGRAM_CHAT_ID_ACCOUNTS, accountsMessage)
        .then(() => ({ recipient: 'telegram_accounts', status: 'success' }))
        .catch((error) => ({ recipient: 'telegram_accounts', status: 'failed', error: error.message }))
    );
  }

  if (TELEGRAM_CHAT_ID_LOGISTICS) {
    const logisticsMessage = generateTelegramLogisticsMessage(deal);
    notifications.push(
      sendTelegramMessage(TELEGRAM_CHAT_ID_LOGISTICS, logisticsMessage)
        .then(() => ({ recipient: 'telegram_logistics', status: 'success' }))
        .catch((error) => ({ recipient: 'telegram_logistics', status: 'failed', error: error.message }))
    );
  }

  if (TELEGRAM_CHAT_ID_BOSS1) {
    const bossMessage = generateTelegramBossMessage(deal);
    notifications.push(
      sendTelegramMessage(TELEGRAM_CHAT_ID_BOSS1, bossMessage)
        .then(() => ({ recipient: 'telegram_boss1', status: 'success' }))
        .catch((error) => ({ recipient: 'telegram_boss1', status: 'failed', error: error.message }))
    );
  }

  if (TELEGRAM_CHAT_ID_BOSSOG) {
    const bossMessage = generateTelegramBossMessage(deal);
    notifications.push(
      sendTelegramMessage(TELEGRAM_CHAT_ID_BOSSOG, bossMessage)
        .then(() => ({ recipient: 'telegram_bossog', status: 'success' }))
        .catch((error) => ({ recipient: 'telegram_bossog', status: 'failed', error: error.message }))
    );
  }

  // --- WhatsApp Notifications ---
  // The existing `sendWhatsAppNotifications` function already handles checking for phone numbers.
  notifications.push(sendWhatsAppNotifications(deal));

  // Wait for all notifications to complete
  const results = await Promise.allSettled(notifications);

  console.log('All notifications sent:', results);
  return results;
}
