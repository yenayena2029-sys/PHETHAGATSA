export interface CurrencyItem {
  code: string;
  symbol: string;
  name: string;
}

export const ALL_CURRENCIES: CurrencyItem[] = [
  { code: "USD", symbol: "$", name: "USD - US Dollar ($)" },
  { code: "EUR", symbol: "€", name: "EUR - Euro (€)" },
  { code: "MAD", symbol: "MAD", name: "MAD - Moroccan Dirham (MAD)" },
  { code: "GBP", symbol: "£", name: "GBP - British Pound (£)" },
  { code: "CAD", symbol: "CA$", name: "CAD - Canadian Dollar (CA$)" },
  { code: "AUD", symbol: "A$", name: "AUD - Australian Dollar (A$)" },
  { code: "JPY", symbol: "¥", name: "JPY - Japanese Yen (¥)" },
  { code: "CNY", symbol: "CN¥", name: "CNY - Chinese Yuan (CN¥)" },
  { code: "INR", symbol: "₹", name: "INR - Indian Rupee (₹)" },
  { code: "CHF", symbol: "CHF", name: "CHF - Swiss Franc (CHF)" },
  { code: "ZAR", symbol: "R", name: "ZAR - South African Rand (R)" },
  { code: "AED", symbol: "AED", name: "AED - UAE Dirham (AED)" },
  { code: "SAR", symbol: "SR", name: "SAR - Saudi Riyal (SR)" },
  { code: "QAR", symbol: "QR", name: "QAR - Qatari Riyal (QR)" },
  { code: "KWD", symbol: "KD", name: "KWD - Kuwaiti Dinar (KD)" },
  { code: "BHD", symbol: "BD", name: "BHD - Bahraini Dinar (BD)" },
  { code: "OMR", symbol: "OR", name: "OMR - Omani Rial (OR)" },
  { code: "EGP", symbol: "EGP", name: "EGP - Egyptian Pound (EGP)" },
  { code: "TRY", symbol: "₺", name: "TRY - Turkish Lira (TRY)" },
  { code: "RUB", symbol: "₽", name: "RUB - Russian Ruble (₽)" },
  { code: "BRL", symbol: "R$", name: "BRL - Brazilian Real (R$)" },
  { code: "MXN", symbol: "MX$", name: "MXN - Mexican Peso (MX$)" },
  { code: "SGD", symbol: "S$", name: "SGD - Singapore Dollar (S$)" },
  { code: "NZD", symbol: "NZ$", name: "NZD - New Zealand Dollar (NZ$)" },
  { code: "HKD", symbol: "HK$", name: "HKD - Hong Kong Dollar (HK$)" },
  { code: "SEK", symbol: "kr", name: "SEK - Swedish Krona (kr)" },
  { code: "NOK", symbol: "kr", name: "NOK - Norwegian Krone (kr)" },
  { code: "DKK", symbol: "kr", name: "DKK - Danish Krone (kr)" },
  { code: "PLN", symbol: "zł", name: "PLN - Polish Zloty (zł)" }
];
