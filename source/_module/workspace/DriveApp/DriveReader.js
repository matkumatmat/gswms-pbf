// source/_module/workspace/DriveApp/DriveReader.js
const DriveReader = (function() {
  return {
    /**
     * Mendapatkan file berdasarkan ID
     */
    getFileById: function(fileId) {
      return DriveApp.getFileById(fileId);
    },

    /**
     * Mendapatkan URL thumbnail gambar dari Drive
     * @param {string} fileId
     * @param {string} size - 'w200', 'w800', dll
     */
    getThumbnailUrl: function(fileId, size = 'w800') {
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
    },

    /**
     * Mencari file berdasarkan nama (mengembalikan array file)
     */
    findFilesByName: function(fileName) {
      const files = DriveApp.getFilesByName(fileName);
      const result = [];
      while (files.hasNext()) result.push(files.next());
      return result;
    },

    /**
     * Mendapatkan folder berdasarkan ID
     */
    getFolderById: function(folderId) {
      return DriveApp.getFolderById(folderId);
    },

    /**
     * Dapatkan file sebagai Blob
     */
    getFileBlob: function(fileId) {
      return this.getFileById(fileId).getBlob();
    }
  };
})();