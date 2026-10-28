# Get started (/get-started)

## PayPal Checkout [#paypal-checkout]

Add PayPal Checkout to your integration so customers can pay using any funding source linked to their PayPal account - including PayPal balance, bank accounts, cards, and Pay Later options.

***

## Payments [#payments]

### [Pay Later](/pay-later/overview/)
Add Pay Later to a PayPal Checkout so a merchant can get paid right away while a customer can pay over time.

### [APMs](/payment-methods/)
Add regional payment methods through partnerships with PayPal to extend a merchant's global reach.

### [In-person](https://www.paypal.com/business/pos-system)
Choose from 3 point-of-sale systems to accept payments in a physical location, by connecting a terminal to PayPal's servers.

### [Donations](/sdk/donate/)
Add the PayPal Donate button to keep customers within a digital experience and not redirect them to a donation page elsewhere.

***

## Revenue [#revenue]

### [Invoicing](/invoicing/about)
Add the ability to create and send customized invoices to customers to receive payment through PayPal's secure payment page.

### [Subscriptions](/subscriptions/about)
Integrate subscriptions to an existing PayPal Checkout to offer recurring billing to customers at regular intervals.

### [Payouts](/payouts/)
Send funds to multiple recipients at once, pay sellers on a marketplace, or compensate gig workers quickly and at scale.

### [Disputes](/disputes/overview/)
Add the ability to handle disputes and chargebacks from customers with PayPal's clear and structured management process.

### [Reports](/reports/overview/)
Add actionable intelligence and data in the form of PayPal reports to help manage day-to-day and long-term operations.

***

## Resources [#resources]

### [APIs](/api/)
Use our REST APIs, authenticate with OAuth 2.0 access tokens, and return HTTP response codes and JSON responses.

### [Upgrade old integrations](/upgrade/)
Identify a legacy or deprecated integration and follow guidance to upgrade to a newer and better PayPal product.

```bash
curl -v -X POST "https://api-m.sandbox.paypal.com/v1/oauth2/token" \
  -u "CLIENT_ID:CLIENT_SECRET" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials"
```
