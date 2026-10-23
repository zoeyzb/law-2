# Contact delivery setup for the HMR concept site

This is a fictional law-firm demonstration, not legal intake. The dial links use (872) 242-0771. Website inquiries go to sierra@recoverrevenue.company (To) and eric@reviro.com (CC).

The Vercel function /api/contact sends by Resend and claims success ONLY after receiving a provider-generated message ID. If sending is unavailable, users receive a populated email draft link. They must press Send in their mail application. Draft creation does not prove delivery.

To enable automatic sending:
1. Verify recoverrevenue.company in Resend. As of October 23, 2026, outbound DKIM and SPF records are failed (inbound MX is verified). Do not replace Google Workspace mail records accidentally.
2. Create a dedicated sending-only Resend API key and store it securely as RESEND_API_KEY in the Vercel law-2 project; never commit it.
3. Add CONTACT_FROM in Vercel using a verified sender on that domain, such as HMR Concept <website@recoverrevenue.company>.
4. Redeploy, test with a NON-confidential message, confirm inbox delivery and real Resend receipt, and test errors.
5. Before a real law-firm launch, replace fictional attorneys, addresses, case results, credentials, reviews and portraits with real attorney-approved content and privacy/legal intake workflows.

Run automated endpoint checks: node --test test/contact.test.js
