// source/server/service/archieve/ArchieveService.js

function ArchieveService(repository) {
  this.repo = repository;
  this.currentUser = null;

  var archieveCfg = ApplicationConfig.dataSources.driveArchieve;

  var cacheGroup = CacheManager.resolveCacheGroup({
    domain: 'archive',
    spreadsheetId: archieveCfg.spreadsheetId,
    sheetName: archieveCfg.sheetName
  });

  function _invalidateCache() {
    CacheManager.invalidate(cacheGroup);
  }

  this.setCurrentUser = function(user) { this.currentUser = user; };

  this.uploadFile = function(payload) {
    var parsed = FileUtils.parseBase64(payload.base64Data);
    var mimeType = payload.mimeType || parsed.mimeType || 'application/octet-stream';
    var pureBase64 = parsed.base64;
    if (!pureBase64) throw new Error('Invalid base64 data');
    if (!FileUtils.isValidBase64(pureBase64)) throw new Error('Invalid base64 data');

    var blob = Utilities.newBlob(Utilities.base64Decode(pureBase64), mimeType, payload.fileName);

    var folders = ApplicationConfig.drive.archieve.folders || [];
    var targetFolderName = FileUtils.isImage(mimeType) ? 'ProductPhotos' : 'Documents';
    var targetFolder = folders.find(function(f) { return f.folderName === targetFolderName; });
    if (!targetFolder) throw new Error('Folder "' + targetFolderName + '" not configured');

    var file = DriveWriter.createFile(blob, payload.fileName, targetFolder.folderId);
    var driveFileId = file.getId();
    var fileSize = file.getSize();
    var url = file.getUrl();
    var thumbnailUrl = FileUtils.isImage(mimeType)
      ? DriveReader.getThumbnailUrl(driveFileId, ApplicationConfig.settings.photoThumbnailSize)
      : null;

    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var record = {
      id: AppUtils.generateUUID(),
      createdAt: audit.updatedAt,
      updatedAt: audit.updatedAt,
      updatedBy: audit.updatedBy,
      statues: 'ACTIVE',
      entityId: payload.entityId || null,
      entityType: payload.entityType || null,
      entityName: payload.entityName || null,
      documentType: payload.documentType || null,
      fileName: payload.fileName,
      fileSize: FileUtils.formatBytes(fileSize),
      mimeType: mimeType,
      driveFileId: driveFileId,
      driveFolderId: targetFolder.folderId,
      url: url,
      thumbnailUrl: thumbnailUrl,
      documentDate: payload.documentDate || null,
      expireDate: payload.expireDate || null,
      remarks: payload.remarks || null,
      tags: payload.tags || null,
      isPublic: payload.isPublic === true ? 'TRUE' : 'FALSE',
      notes: payload.notes || null
    };

    this.repo.create(record);
    _invalidateCache();
    return record;
  };

  this.getFileMetadata = function(id) {
    return this.repo.findById(id);
  };

  this.downloadFile = function(id) {
    var metadata = this.repo.findById(id);
    if (!metadata) throw new Error('File metadata not found');
    if (!metadata.driveFileId) throw new Error('Drive file ID missing');
    var blob = DriveReader.getFileBlob(metadata.driveFileId);
    return {
      id: metadata.id,
      fileName: metadata.fileName,
      mimeType: metadata.mimeType,
      base64: Utilities.base64Encode(blob.getBytes())
    };
  };

  this.updateFileMetadata = function(id, updates) {
    var existing = this.repo.findById(id);
    if (!existing) throw new Error('File metadata not found');
    var audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    var allowed = [
      'entityId', 'entityType', 'entityName', 'documentType',
      'documentDate', 'expireDate', 'remarks', 'tags', 'isPublic', 'notes'
    ];
    var merged = {};
    Object.keys(existing).forEach(function(k) { merged[k] = existing[k]; });
    allowed.forEach(function(field) {
      if (updates[field] !== undefined) merged[field] = updates[field];
    });
    merged.updatedAt = audit.updatedAt;
    merged.updatedBy = audit.updatedBy;
    this.repo.update(id, merged);
    _invalidateCache();
    return merged;
  };

  this.deleteFile = function(id) {
    var metadata = this.repo.findById(id);
    if (!metadata) throw new Error('File metadata not found');
    if (metadata.driveFileId) DriveWriter.trashFile(metadata.driveFileId);
    this.repo.delete(id);
    _invalidateCache();
    return { success: true, id: id };
  };
}