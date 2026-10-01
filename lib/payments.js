export const PAYMENT_CONFIG = {
  paystack: { publicKey: process.env.NEXT_PUBLIC_PAYSTACK_KEY || 'pk_test_mock', mode: 'test' },
  payfast: { merchant_id: 'mock', enabled: false },
  capitec: { account: '1055581251', name: 'Phethagatsa', branch: '470010' },
  paxi: { fee: 60 }
}
