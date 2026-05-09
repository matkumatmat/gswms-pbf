// source/_module/workspace/GmailApp/GmailWrapper.js
const GmailWrapper = (function() {
  return {
    /**
     * Kirim email
     * @param {string} to - alamat email penerima
     * @param {string} subject
     * @param {string} body - plain text
     * @param {Object} options - { htmlBody, attachments, cc, bcc, name }
     */
    sendEmail: function(to, subject, body, options = {}) {
      const params = {
        to: to,
        subject: subject,
        body: body
      };
      if (options.htmlBody) params.htmlBody = options.htmlBody;
      if (options.cc) params.cc = options.cc;
      if (options.bcc) params.bcc = options.bcc;
      if (options.name) params.name = options.name;
      if (options.attachments && options.attachments.length) params.attachments = options.attachments;
      GmailApp.sendEmail(params.to, params.subject, params.body, params);
    },

    /**
     * Mendapatkan draft email terbaru
     */
    createDraft: function(to, subject, body, options = {}) {
      const params = { to, subject, body };
      if (options.htmlBody) params.htmlBody = options.htmlBody;
      if (options.cc) params.cc = options.cc;
      if (options.bcc) params.bcc = options.bcc;
      if (options.name) params.name = options.name;
      if (options.attachments) params.attachments = options.attachments;
      return GmailApp.createDraft(params.to, params.subject, params.body, params);
    }
  };
})();