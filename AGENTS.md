# Teams Management operating instructions

Read [the operations index](docs/operations/README.md) before changing Cloudflare resources, migrating data, or preparing a release. It links the current Waterbear handoff, recovery procedure, and future production promotion procedure.

Waterbear is the development environment. Production work in 2Nspira requires explicit owner approval for the concrete release or recovery action. Promote approved code with production configuration; preserve the production database and credentials. Never deploy from an assumed default branch without checking the actual release baseline.

This repository is public. Keep database exports, recovery archives, access codes, contact lists, secrets, OAuth tokens, and private QA evidence outside Git. Recovery tooling generates private files; use a protected directory outside the checkout.
