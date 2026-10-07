# StudyStow RBAC Implementation

This project now uses granular admin permissions across the admin panel.

## Permission model

- dashboard: view
- books: view, create, edit, delete
- categories: view, create, edit, delete
- inventory: view, update
- orders: view, update, cancel, refund
- customers: view, create, edit, delete
- coupons: view, create, edit, delete
- reviews: view, edit, delete
- pages: view, create, edit, delete
- reports: view
- payments: view, update, refund
- adminUsers: view, invite, edit, suspend, remove
- settings: view, edit
- analytics: view
- contact: view, edit, delete
- auditLogs: view

Write actions require module view access. Write permissions do not grant unrelated write actions.

## Enforcement layers

1. Admin sidebar hides modules without `view` permission.
2. Admin page guard blocks direct URL access without the required module/action.
3. Admin action filter hides/disables UI actions without the required action.
4. Server-side API authorization is the security boundary; unauthorized requests return 401/403.
5. Settings removes owner/private fields from staff responses and blocks staff from changing owner-only fields.
6. Unknown future `/admin/*` pages fail closed until registered in the permission map.

## Owner

Owner / Super Admin uses the unrestricted owner permission set.

## Verification performed

- All TypeScript/TSX source files were syntax-parsed successfully with TypeScript's parser.
- Permission core sanity tests passed for Books view-only, Books view+create, Coupons/Settings denial, and Owner unrestricted access.
- Full `npm install`/production build could not be completed in this container because dependency installation timed out; run `npm install` and `npm run build` in the actual project before pushing.
