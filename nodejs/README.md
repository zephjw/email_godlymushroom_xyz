# Godly Mushroom Webmail

This version replaces the demo inbox with a working Hostinger Email client for mailboxes ending in `@godlymushroom.xyz`.

## Improvements

- Uses the real IMAP inbox and SMTP sending paths.
- Removes hard-coded sample emails and fake login success messages.
- Uses an HTTP-only, SameSite session cookie instead of exposing a session id to browser JavaScript.
- Restricts sign-in to the configured mail domain.
- Adds login rate limiting and general request limiting.
- Validates recipient, subject and message input.
- Sanitizes HTML email bodies before displaying them.
- Uses HTTPS-safe IMAP certificate validation.
- Adds folder loading, message search, message reading and compose/send UI.
- Adds the missing `mailparser` and `sanitize-html` dependencies.

## Install

```bash
npm install
```

Create `.env`:

```env
PORT=3000
NODE_ENV=production
MAIL_DOMAIN=godlymushroom.xyz
```

Run:

```bash
npm start
```

Put the HTML file behind the same origin as the Node.js API, or reverse-proxy `/api` to port 3000. Use HTTPS in production. Hostinger Email uses IMAP over SSL on `imap.hostinger.com:993` and SMTP over SSL on `smtp.hostinger.com:465`; STARTTLS SMTP on port 587 is an alternative if required.

## Important production note

This is a mailbox client, not a replacement for Hostinger Webmail. The server keeps mailbox credentials in its in-memory session store so it can make IMAP and SMTP connections. For a multi-user production deployment, use a reviewed encrypted session store, strict account authorization, audit logging, CSRF protection for any cross-site deployment, and a process manager with HTTPS termination. Never commit `.env` or mailbox passwords to source control.