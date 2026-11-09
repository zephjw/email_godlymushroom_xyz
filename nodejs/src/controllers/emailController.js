const { emailService } = require('../services');
const { validateSendPayload } = require('../utils/validator');

class EmailController {
  /**
   * Retrieves list of email summaries from the specified folder.
   */
  async getEmails(req, res, next) {
    const folder = String(req.query.folder || 'INBOX').slice(0, 64);
    const imap = emailService.createImap(req.mailSession);

    try {
      await emailService.openBox(imap, folder);
      const emails = await emailService.fetchList(imap);
      return res.json({ emails });
    } catch (err) {
      return res.status(502).json({ message: 'Could not read this mail folder' });
    } finally {
      emailService.close(imap);
    }
  }

  /**
   * Retrieves full email content for a single message by UID.
   */
  async getEmailByUid(req, res, next) {
    const uid = Number(req.params.uid);
    if (!Number.isInteger(uid) || uid < 1) {
      return res.status(400).json({ message: 'Invalid message id' });
    }

    const folder = String(req.query.folder || 'INBOX');
    const imap = emailService.createImap(req.mailSession);

    try {
      await emailService.openBox(imap, folder);
      const email = await emailService.fetchOne(imap, uid);
      return res.json({ email });
    } catch (err) {
      return res.status(502).json({ message: 'Could not open this message' });
    } finally {
      emailService.close(imap);
    }
  }

  /**
   * Sends an outgoing email message.
   */
  async sendEmail(req, res, next) {
    const validation = validateSendPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message });
    }

    const { to, subject, text } = req.body;

    try {
      const result = await emailService.sendEmail(req.mailSession, {
        to,
        subject,
        text,
      });
      return res.json({ success: true, messageId: result.messageId });
    } catch (err) {
      return res.status(502).json({ message: 'The message could not be sent' });
    }
  }
}

const emailController = new EmailController();

module.exports = emailController;
