# RE IMAGE project contracts, deposits, and receipts

Status: Implementation in progress.

## Objective

Connect the existing website, admin Orders and Invoices tabs, and Terminal app around one project record. Require a signed agreement before collecting a project deposit, track partial payments, and email receipts and signed documents automatically.

Recommended default: sign agreement → pay 50% deposit → complete the agreed project milestone → collect the remaining balance. Ordinary POS purchases continue through normal checkout without a project contract.

## Example

Assuming no added tax:

| Item | Amount |
| --- | ---: |
| Business Hub | $1,899.00 |
| Discount | −$400.00 |
| Agreed project total | $1,499.00 |
| 50% deposit | $749.50 |
| Remaining balance | $749.50 |

Calculate the deposit after the discount. Define the treatment of applicable tax before implementation. Store amounts in integer cents and calculate the final installment as the remaining balance to avoid rounding differences.

## Staff and customer workflow

1. **Create the project.** Select or create a customer with name and email. Choose products, scope, discount, timeline, deposit percentage or amount, and the remaining payment's due date or milestone.
2. **Generate the agreement.** Populate an approved contract template with the project details, agreed price, payment schedule, and terms. Staff review it before sending.
3. **Send the signing request.** Email a secure project link with the clear action “Review your agreement and pay your deposit.” The customer reviews and signs in the RE IMAGE client portal using the drawn signature pad.
4. **Verify signing.** The backend verifies the stored signed agreement before enabling deposit collection. Enforce this on the customer website and admin/in-person checkout, not just by disabling a button.
5. **Collect the deposit.** Offer card payment or confirmed cash collection in person, and a secure online payment flow for remote customers. Do not mark a card payment paid until the backend verifies success. Cash requires explicit staff confirmation.
6. **Email the deposit receipt.** Send the original price, discount, agreed total, amount received in this payment, total paid, and balance due. Include the completed contract as a PDF or secure download link.
7. **Recall the project.** Search by customer, project, email, or order number. Select “Collect balance” for in-person payment or “Email payment request” for remote payment. Do not recreate the order or apply its discount again.
8. **Complete the balance payment.** On verified payment, update the balance and email a final receipt showing all payments, their dates, total paid, and $0.00 remaining. Preserve the original deposit receipt unchanged.

### Three- and four-payment plans

Customers may choose a payment plan. Enrollment requires explicit authorization to save a payment method with Stripe and automatically charge the agreed installments. Show the discounted price, applicable tax, total, and each charge amount and date before the customer authorizes autopay. Count the first payment toward the chosen number of installments.

For both Terminal and online enrollment, activate the plan only after verifying the signature, recording authorization for that schedule, and confirming Stripe has a reusable payment method. Schedule only the outstanding installments. After each verified payment, send a Brevo receipt. If a scheduled charge needs customer action, keep the installment open and email a secure recovery link.

For a project outside an installment plan, a deposit alone gives no authorization for future charges. Request a customer-authorized balance payment through the standard workflow above.

## Admin portal

Expand Orders with All, Unpaid, Partially paid, and Paid filters. Provide an Awaiting signature filter or view as well.

Each project detail view includes:

- Customer and project details.
- Itemized pricing, original price, discount, agreed total, applicable tax, amount paid, and balance due.
- Deposit and balance schedule, including the agreed due milestone or date.
- Contract status: Not sent, Awaiting signature, Signed, Declined, Expired, or Canceled.
- Payment history and individual receipts.
- Signature request and receipt email delivery status.
- Actions to send/view the agreement, collect the deposit or balance, send payment requests, correct an email address, and resend receipts.

Orders and Invoices should reference the same project and payment history. Inspect the current Invoices implementation before deciding what to reuse or replace.

Track contract, payment, and project progress separately. “Ready to start” requires both a completed signature and a confirmed deposit. “Paid in full” must not imply that project work is complete.

## Customer project page

Provide a secure, customer-specific page containing:

- Project summary and agreed pricing.
- Agreement review and signing action.
- Deposit payment action, unlocked only after signing.
- Signed agreement and signing record where appropriate.
- Receipts and payment history.
- Outstanding balance and payment action when requested/due.

Use authenticated access or securely scoped, expiring links. Do not expose customer documents through public, guessable URLs.

## Agreements and changes

Use the Rent Me CT drawn-signature workflow. The customer signs the versioned agreement in the authenticated portal. Preserve the issued document, drawn signature, signer identity, consent and signing time together for printing.

Lock the agreed price and contract version once signed. Later scope or price changes require a tracked amendment/change order and any required new acceptance. Preserve the original agreement, prior receipts, and payment records.

If supporting a legacy exception where payment predates signing, send the receipt immediately and a separate signing action; never label an unsigned agreement as signed. The default new-project flow prevents deposit collection before signing.

## Email and reminders

Use Brevo for branded transactional messages:

- One signing invitation per issued agreement.
- Signature reminders, proposed defaults: two days and five days after sending.
- Deposit receipt and signed contract delivery.
- Balance-payment request.
- Final paid-in-full receipt.

Stop signature reminders when signed, declined, expired, or canceled. Deduplicate automated emails and allow safe retries. Email failures must not undo a successful payment. Show delivery failures to staff and allow resending.

Keep receipt and agreement messages separate from marketing subscriptions. Entering an email for project documents does not subscribe the customer to marketing.

## Integration responsibilities

- **RE IMAGE backend:** authoritative project pricing, contract status, installment schedule, balances, payment records, receipt snapshots, and permissions.
- **Stripe:** card payments, with each payment linked to the project. Evaluate Stripe Invoicing partial-payment support against the existing invoice implementation before selecting the integration approach.
- **Brevo:** transactional emails, templates, attachments/secure document links, and delivery events.
- **RE IMAGE client portal and Supabase:** agreement review, drawn signature capture, authenticated signing record, and printable signed copy.

Validate webhook authenticity and make payment/signature processing idempotent. Prevent simultaneous attempts from collecting more than the outstanding balance. Record refunds and adjustments separately so balances and receipts remain accurate.

## Implementation stages

### 1. Project records and partial payments

- Audit the current Orders, Invoices, and Terminal integrations.
- Add customer-linked, itemized project records and stable project identifiers.
- Save pricing and discount snapshots.
- Add deposit schedules, balance calculations, and multiple payments per project.
- Add project recall and partial-payment status to admin and Terminal flows.

The current checkout treats sales as complete payments. A percentage button alone is insufficient; the balance-tracking model must come first.

### 2. Contracts and signing gate

- Integrate the Rent Me CT signature pad with authenticated project agreements.
- Add approved, versioned contract templates and staff preview.
- Send signature requests and verify authenticated signing records.
- Store completed agreements and signing records securely.
- Enforce the signature prerequisite for project deposits across every payment entry point.
- Add amendment/change-order handling.

### 3. Customer communications

- Build the secure customer project page.
- Configure the Brevo sender/domain and transactional templates.
- Generate immutable receipts for each payment and a final payment summary.
- Add signing reminders, balance-payment requests, delivery tracking, and resend actions.

## Decisions and materials needed

- Approved contract template and project terms.
- Brevo account, verified sender/domain, and receipt branding.
- Deposit default and any allowed alternatives.
- Balance due dates or milestone rules.
- Signature reminder timing.
- Applicable tax treatment and refund/adjustment rules.
- Staff permissions for discounts, sending contracts, collecting cash, and changing project terms.

## Acceptance checks

- A $1,899 project discounted to $1,499 requires a $749.50 deposit and leaves $749.50 due.
- A three- or four-payment plan requires recorded autopay authorization and a reusable payment method across both Terminal and online enrollment. Declining authorization leaves the plan inactive.
- Scheduled charges stop when the agreed balance is paid.
- Unsigned projects cannot collect a deposit through either the website or Terminal flow.
- Repeated signature notifications, payment notifications, or staff retries do not create duplicate payments or emails.
- A successful deposit appears as partially paid and generates a receipt showing the remaining balance.
- Recalling the project preserves the agreed price, discount, signed document, and prior payment.
- Collecting the remaining balance produces a paid-in-full receipt without altering the deposit receipt.
- Failed payments do not reduce the balance; failed emails do not reverse payments.
- Cash collection requires staff confirmation and records tender/change separately from the project payment amount.
- Customer links and staff permissions prevent access to another customer's or business's records.

## Reference documentation

- [Stripe partial invoice payments](https://docs.stripe.com/invoicing/partial-payments)
- [Brevo transactional email](https://developers.brevo.com/docs/send-a-transactional-email)
