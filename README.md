# Technical Support Assistant

Laravel and Vue decision tree for support agents. The interface loads Arabic or English troubleshooting data from JSON files in `storage/app/data/`; choices and back navigation run in the browser.

## Data handling

- Keep customer identifiers, credentials, and payment details out of this site.
- Verify live outages, ticket references, classifications, and SLAs in the approved support system. The outage guide describes fields to inspect; it does not maintain outage records.
- Treat PDF-derived procedures as training references and verify time-sensitive procedures in the current system.

## Local development

```bash
composer install
npm install
php artisan key:generate
npm run build
php artisan serve
```

Decision trees are validated with `php artisan trees:validate`.
