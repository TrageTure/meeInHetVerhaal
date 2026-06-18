const FORM_SUBMIT_TOKEN = '9e8df21b281f8e5e6206d17478ac8fe8'
const CONTACT_ENDPOINT = `https://formsubmit.co/ajax/${FORM_SUBMIT_TOKEN}`

export async function sendContactEmail(message) {
  const payload = {
    Naam: message.name.trim(),
    'E-mailadres': message.email.trim(),
    Bericht: message.message.trim(),
    'Updates ontvangen': message.marketingConsent ? 'Ja' : 'Nee',
    _replyto: message.email.trim(),
    _subject: `Nieuw bericht via Mee in het verhaal van ${message.name.trim()}`,
    _template: 'basic',
    _captcha: 'false',
  }

  const response = await fetch(CONTACT_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Verzenden is niet gelukt. Probeer het straks opnieuw.')
  }
}
