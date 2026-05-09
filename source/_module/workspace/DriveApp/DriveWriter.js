// source/_module/workspace/DriveApp/DriveWriter.js
const DriveWriter = (function() {
  return {
    /**
     * Membuat file baru dari blob di folder tertentu
     * @param {Blob} blob
     * @param {string} fileName
     * @param {string} folderId - optional
     * @returns {File} file yang baru dibuat
     */
    createFile: function(blob, fileName, folderId = null) {
      if (folderId) {
        const folder = DriveApp.getFolderById(folderId);
        return folder.createFile(blob.setName(fileName));
      }
      return DriveApp.createFile(blob.setName(fileName));
    },

    /**
     * Memindahkan file ke folder tujuan
     */
    moveFileToFolder: function(fileId, targetFolderId) {
      const file = DriveReader.getFileById(fileId);
      const targetFolder = DriveReader.getFolderById(targetFolderId);
      file.moveTo(targetFolder);
    },

    /**
     * Menyalin file ke folder tujuan (membuat duplikat)
     * @returns {File} file baru hasil salinan
     */
    copyFileToFolder: function(fileId, targetFolderId, newName = null) {
      const file = DriveReader.getFileById(fileId);
      const targetFolder = DriveReader.getFolderById(targetFolderId);
      const newFile = file.makeCopy(newName || file.getName(), targetFolder);
      return newFile;
    },

    /**
     * Menghapus file (ke trash)
     */
    trashFile: function(fileId) {
      const file = DriveReader.getFileById(fileId);
      file.setTrashed(true);
    }
  };
})();