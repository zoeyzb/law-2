# Contact delivery setup for the HMR concept site

This is a fictional law-firm demonstration, not legal intake. The dial links use (872) 242-0771. Website inquiries go to sierra@recoverrevenue.company (To) and eric@reviro.com (CC).

The Vercel function /api/contact sends by Resend and claims success ONLY after receiving a provider-generated message ID. If sending is unavailable, users receive a populated email draft link. They must press Send in their mail application. Draft creation does not prove delivery.

Deployment operations (2026-10-23):
1. The three necessary outbound records were ADDED in Vercel DNS for recoverrevenue.company: `resend._domainkey` TXT, `send` MX, and `send` SPF TXT. Resend subsequently marked ALL THREE outbound records VERIFIED. The domain as a whole showed `partially_verified` because an optional inbound MX check was still pending. This contact form requires **outbound** email only.
2. The existing Google Workspace MX and Google DKIM were left completely untouched. Do not replace root MX records to configure this form.
3. A dedicated Resend **sending_access** key restricted to this domain was created and set as an encrypted `RESEND_API_KEY` for Vercel project `law-2` (production, preview, development). It is not committed to Git.
4. `CONTACT_FROM` is set to `HMR Concept <website@recoverrevenue.company>` in Vercel. Deployments built AFTER these environment variables were added will have them.
5. Run a single NON-confidential end-to-end test after redeploy, and verify a real Resend ID plus inbox receipt. A provider-accepted ID does not alone prove arrival in the inbox.
6. Before a real law-firm launch, replace fictional attorneys, addresses, case results, credentials, reviews and portraits with real attorney-approved content and privacy/legal intake workflows.

Run automated endpoint checks: node --test test/contact.test.js
