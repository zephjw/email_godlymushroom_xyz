/**
 * Represents an email summary item in mailbox listing.
 */
class EmailSummary {
  constructor({ uid, from = '', to = '', subject = '', date = '', preview = '' }) {
    this.uid = uid;
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.date = date;
    this.preview = preview;
  }
}

/**
 * Represents full details of an email.
 */
class EmailDetail {
  constructor({ uid, from = '', to = '', subject = '', date = '', text = '', html = '' }) {
    this.uid = uid;
    this.from = from;
    this.to = to;
    this.subject = subject;
    this.date = date;
    this.text = text;
    this.html = html;
  }
}

module.exports = {
  EmailSummary,
  EmailDetail,
};
