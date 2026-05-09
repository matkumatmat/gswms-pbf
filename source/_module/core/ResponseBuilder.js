const ResponseBuilder = (function() {

  const _handlers = {
    file: function(result) {
      var blob = result.blob;
      var base64 = Utilities.base64Encode(blob.getBytes());
      var mime = blob.getContentType();
      var dataUri = 'data:' + mime + ';base64,' + encodeURIComponent(base64);
      var html = '<!DOCTYPE html><html><script>window.location.href="' + dataUri + '";</script></html>';
      return HtmlService.createHtmlOutput(html);
    },

    json: function(result) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'success', data: result }))
        .setMimeType(ContentService.MimeType.JSON);
    },
    file_direct: function(result) {
      return ContentService
        .createTextOutput(result.blob.getBytes())
        .setMimeType(result.blob.getContentType())
        .downloadAsFile(result.blob.getName());
    },

  };

  function build(result) {
    var type = (result && result._type) ? result._type : 'json';
    var handler = _handlers[type] || _handlers['json'];
    return handler(result);
  }

  function buildError(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  function register(type, handlerFn) {
    _handlers[type] = handlerFn;
  }

  return { build: build, buildError: buildError, register: register };
})();