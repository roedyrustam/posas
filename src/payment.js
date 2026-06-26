// ========== KasirPro Payment Service (Xendit Integration) ==========
// This service handles integration with Xendit for QRIS, E-wallets, and VA.

const XENDIT_SECRET_KEY = 'YOUR_XENDIT_SECRET_KEY_HERE'; // User should replace this
const XENDIT_URL = 'https://api.xendit.co/v2/invoices';

/**
 * Create a Xendit Invoice
 * In a real app, this should be called from a secure backend (like Supabase Edge Functions)
 * to avoid exposing the Secret Key. For this demo, we simulate the flow.
 */
export async function createPaymentInvoice({ external_id, amount, payer_email, description }) {
  console.log('Initiating Xendit Payment for:', external_id);
  
  // Simulation: Since we don't have a backend proxy yet, we simulate the response
  // In production, use: fetch(XENDIT_URL, { method: 'POST', auth: { username: KEY }, body: ... })
  
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: 'inv_' + Math.random().toString(36).substr(2, 9),
        external_id: external_id,
        status: 'PENDING',
        merchant_name: 'KasirPro Store',
        merchant_profile_picture_url: 'https://kasirpro.app/logo.png',
        amount: amount,
        description: description,
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        invoice_url: `https://checkout.xendit.co/web/${external_id}`, // Mock URL
        available_banks: [],
        available_retail_outlets: [],
        available_paylater: [],
        available_qr_codes: [{ barcode_data: '00020101021226660011ID123456789012345678901234567890123', type: 'DYNAMIC' }]
      });
    }, 1500);
  });
}

/**
 * Check payment status
 */
export async function checkPaymentStatus(invoiceId) {
  // Simulation: 70% chance of success for testing
  return new Promise((resolve) => {
    setTimeout(() => {
      const isPaid = Math.random() > 0.3;
      resolve(isPaid ? 'PAID' : 'PENDING');
    }, 1000);
  });
}
