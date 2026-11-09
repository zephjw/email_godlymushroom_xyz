const Imap = require('imap');
const nodemailer = require('nodemailer');
const { simpleParser } = require('mailparser');
const config = require('../config');
const { EmailSummary, EmailDetail } = require('../models/email');
const { sanitizeEmailHtml } = require('../utils/sanitizer');

class EmailService {
  /**
   * Instantiates an Imap client for the provided credentials.
   * @param {{ email: string, password: string }} credentials
   * @returns {Imap}
   */
  createImap(credentials) {
    return new Imap({
      user: credentials.email,
      password: credentials.password,
      host: config.mail.imap.host,
      port: config.mail.imap.port,
      tls: config.mail.imap.tls,
      tlsOptions: config.mail.imap.tlsOptions,
    });
  }

  /**
   * Instantiates an SMTP transport for the provided credentials.
   * @param {{ email: string, password: string }} credentials
   */
  createSmtp(credentials) {
    return nodemailer.createTransport({
      host: config.mail.smtp.host,
      port: config.mail.smtp.port,
      secure: config.mail.smtp.secure,
      auth: {
        user: credentials.email,
        pass: credentials.password,
      },
    });
  }

  /**
   * Connects to IMAP and opens the specified mailbox folder.
   * @param {Imap} imap
   * @param {string} folder
   * @returns {Promise<any>}
   */
  openBox(imap, folder) {
    return new Promise((resolve, reject) => {
      imap.once('ready', () => {
        imap.openBox(folder, false, (err, box) => {
          if (err) return reject(err);
          resolve(box);
        });
      });
      imap.once('error', reject);
      imap.connect();
    });
  }

  /**
   * Safely closes an IMAP connection.
   * @param {Imap} imap
   */
  close(imap) {
    if (!imap) return;
    try {
      imap.end();
    } catch {
      // Ignored
    }
  }

  /**
   * Fetches an email summary list from an already opened IMAP mailbox.
   * @param {Imap} imap
   * @param {number} [limit=50]
   * @returns {Promise<EmailSummary[]>}
   */
  fetchList(imap, limit = config.mail.maxFetchListLimit) {
    return new Promise((resolve, reject) => {
      imap.search(['ALL'], (err, uids) => {
        if (err) return reject(err);
        const chosen = uids.slice(-limit).reverse();
        if (!chosen.length) return resolve([]);

        const out = [];
        const fetchStream = imap.fetch(chosen, {
          bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE MESSAGE-ID)',
          struct: true,
        });

        fetchStream.on('message', (msg, seq) => {
          let raw = '';
          msg.on('body', (stream) => {
            stream.on('data', (chunk) => {
              raw += chunk.toString('utf8');
            });
          });
          msg.once('end', () => {
            const headers = Imap.parseHeaders(raw);
            out.push(
              new EmailSummary({
                uid: chosen[seq - 1] || seq,
                from: headers.from?.[0] || '',
                to: headers.to?.[0] || '',
                subject: headers.subject?.[0] || '',
                date: headers.date?.[0] || '',
                preview: '',
              })
            );
          });
        });

        fetchStream.once('error', reject);
        fetchStream.once('end', () => resolve(out));
      });
    });
  }

  /**
   * Fetches full email content by UID from an already opened IMAP mailbox.
   * @param {Imap} imap
   * @param {number} uid
   * @returns {Promise<EmailDetail>}
   */
  fetchOne(imap, uid) {
    return new Promise((resolve, reject) => {
      const fetchStream = imap.fetch(uid, { bodies: '', struct: true });
      let found = false;

      fetchStream.on('message', (msg) => {
        msg.on('body', (stream) => {
          let raw = '';
          stream.on('data', (chunk) => {
            raw += chunk.toString('utf8');
          });
          stream.once('end', async () => {
            try {
              const parsed = await simpleParser(raw);
              found = true;
              resolve(
                new EmailDetail({
                  uid,
                  from: parsed.from?.text || '',
                  to: parsed.to?.text || '',
                  subject: parsed.subject || '',
                  date: parsed.date || '',
                  text: parsed.text || '',
                  html: parsed.html ? sanitizeEmailHtml(parsed.html) : '',
                })
              );
            } catch (err) {
              reject(err);
            }
          });
        });
      });

      fetchStream.once('error', reject);
      fetchStream.once('end', () => {
        if (!found) reject(new Error('Message not found'));
      });
    });
  }

  /**
   * Verifies mailbox credentials by connecting to IMAP and opening INBOX.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<boolean>}
   */
  async verifyCredentials(email, password) {
    const imap = this.createImap({ email, password });
    try {
      await this.openBox(imap, 'INBOX');
      return true;
    } finally {
      this.close(imap);
    }
  }

  /**
   * Sends an email via SMTP.
   * @param {{ email: string, password: string }} credentials
   * @param {{ to: string, subject: string, text: string }} mailOptions
   * @returns {Promise<{ success: boolean, messageId: string }>}
   */
  async sendEmail(credentials, { to, subject, text }) {
    const transport = this.createSmtp(credentials);
    const info = await transport.sendMail({
      from: credentials.email,
      to: to.trim(),
      subject: subject.trim(),
      text,
    });
    return {
      success: true,
      messageId: info.messageId,
    };
  }
}

const emailService = new EmailService();

module.exports = emailService;
