// SMS gateway helper. Greenweb is wired in; for ElitBuzz or ReveSMS replace the URL/params below.
export async function sendSms(phone, message) {
  const token = process.env.SMS_TOKEN;
  if (!token) {
    console.log(`[SMS to ${phone}] ${message}`);
    return;
  }
  try {
    const body = new URLSearchParams({ token, to: phone, message });
    await fetch('https://api.greenweb.com.bd/api.php', { method: 'POST', body });
  } catch (e) {
    console.error('SMS failed:', e.message);
  }
}
