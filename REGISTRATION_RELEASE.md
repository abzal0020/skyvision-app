# Corporate homepage and registration

The public homepage now uses a corporate banner, company introduction, business directions, catalog and contact links. A single header entry opens the existing portal sign-in page. Russian and Chinese are supported. The earlier participant diagram has been removed.

Registration collects a business classification (production, forwarder, buyer, other), company name, country, city, contact name, optional position, telephone, email, password and password confirmation. Profile data is submitted as private Auth user metadata. Passwords are sent only to Supabase Auth, never stored in that metadata or browser storage. Business classification is not an authorization role.

Email confirmation remains enabled. At the first company setup, the saved registration values prefill the company form; the user reviews and creates the public company page. The personal profile also prefills name, position and city. Existing company/profile data takes precedence. Adding a subsequent company starts with an empty form.

Applied remote migration: `allow_other_company_activity`. Source SQL: `database/company-other-activity.sql`. The only database change expands the existing activity check constraint; grants and RLS are unchanged. The resulting constraint was queried and verified as validated.

Validation: unit tests cover the signup payload, password mismatch, metadata defaults and non-authoritative business types. `tools/corporate-check.cjs` checks the public flow in a browser using an intercepted signup response (no test emails sent), both languages and narrow viewports. Actual email delivery is not part of this check.

The Supabase security advisor was inspected. Existing notices concern legacy functions, GraphQL schema visibility, template tables with no policies, and disabled leaked-password checks. This release adds no functions or grants and does not change those unrelated settings. See [Supabase advisor documentation](https://supabase.com/docs/guides/database/database-linter) for the reported checks.

The CRCT public site was consulted for the separation of corporate website and portal. Its private workflow was not accessible; no private screens, code or content were copied.
