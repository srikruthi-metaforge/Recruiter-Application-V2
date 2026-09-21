/**
 * Masks email address:
 * e.g., "priyanka.sharma@gmail.com" -> "p***************a@gmail.com"
 * e.g., "vishwateja.t@gmail.com" -> "v***********t@gmail.com"
 */
export function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return email || ''
  const parts = email.split('@')
  const user = parts[0]
  const domain = parts[1]
  if (user.length <= 2) {
    return user[0] + '*'.repeat(user.length - 1) + '@' + domain
  }
  const firstChar = user[0]
  const lastChar = user[user.length - 1]
  const maskedMiddle = '*'.repeat(user.length - 2)
  return `${firstChar}${maskedMiddle}${lastChar}@${domain}`
}

/**
 * Masks phone number:
 * e.g., "+91 98210 44905" -> "+91**********"
 */
export function maskPhone(phone: string): string {
  if (!phone) return '+91**********'
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) {
    const parts = trimmed.split(' ')
    const countryCode = parts[0]
    return `${countryCode}**********`
  }
  return '+91**********'
}
