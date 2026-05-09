// source/server/service/archieve/ArchieveService.js

/**
 * Central service for document archiving (Upload, Download, Delete).
 * @param {ArchieveRepository} repository
 * @constructor
 */
function ArchieveService(repository) {
  this.repo = repository;
  this.currentUser = null;

  /** @param {{ email: string }} user */
  this.setCurrentUser = function(user) { this.currentUser = user; };

  /**
   * Upload file: decode base64, store in Drive, record metadata in sheet.
   * @param {Object} payload
   * @param {string} payload.fileName
   * @param {string} payload.mimeType
   * @param {string} payload.base64Data   - raw base64 or data URI
   * @param {string} [payload.entityId]
   * @param {string} [payload.entityType]
   * @param {string} [payload.documentType]
   * @param {boolean} [payload.isPublic]
   * @param {string} [payload.notes]
   * @param {string} [payload.remarks]
   * @returns {Object} metadata record
   */
  this.uploadFile = function(payload) {
    // 1. Normalize base64
    const { mimeType: parsedMime, base64: pureBase64 } = FileUtils.parseBase64(payload.base64Data);
    const mimeType = payload.mimeType || parsedMime || 'application/octet-stream';
    if (!pureBase64) throw new Error('Invalid base64 data');

    if (!FileUtils.isValidBase64(pureBase64)) {
    throw new Error('Invalid base64 data');
    }

    // 2. Create Blob
    const blob = Utilities.newBlob(Utilities.base64Decode(pureBase64), mimeType, payload.fileName);

    // 3. Route to folder based on MIME type
    const folders = ApplicationConfig.drive.archieve.folders || [];
    const targetFolderName = FileUtils.isImage(mimeType) ? 'ProductPhotos' : 'Documents';
    const targetFolder = folders.find(f => f.folderName === targetFolderName);
    if (!targetFolder) throw new Error(`Folder "${targetFolderName}" not configured`);

    // 4. Save to Drive
    const file = DriveWriter.createFile(blob, payload.fileName, targetFolder.folderId);
    const driveFileId = file.getId();
    const fileSize = file.getSize();
    const url = file.getUrl();
    const thumbnailUrl = FileUtils.isImage(mimeType)
      ? DriveReader.getThumbnailUrl(driveFileId, ApplicationConfig.settings.photoThumbnailSize)
      : null;

    // 5. Build metadata record
    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const record = {
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

    // 6. Persist metadata
    this.repo.create(record);
    return record;
  };

  /**
   * Retrieve file metadata by ID.
   * @param {string} id
   * @returns {Object|null}
   */
  this.getFileMetadata = function(id) {
    return this.repo.findById(id);
  };

  /**
   * Download file: return JSON with base64 content.
   * @param {string} id
   * @returns {{ id: string, fileName: string, mimeType: string, base64: string }}
   */
  this.downloadFile = function(id) {
    const metadata = this.repo.findById(id);
    if (!metadata) throw new Error('File metadata not found');
    if (!metadata.driveFileId) throw new Error('Drive file ID missing');

    const blob = DriveReader.getFileBlob(metadata.driveFileId);
    return {
      id: metadata.id,
      fileName: metadata.fileName,
      mimeType: metadata.mimeType,
      base64: Utilities.base64Encode(blob.getBytes())
    };
  };

  /**
   * Update metadata fields (non‑file properties).
   * @param {string} id
   * @param {Object} updates
   * @returns {Object}
   */
  this.updateFileMetadata = function(id, updates) {
    const existing = this.repo.findById(id);
    if (!existing) throw new Error('File metadata not found');

    const audit = AuditUtils.getAuditTrail(this.currentUser ? this.currentUser.email : null);
    const allowed = [
      'entityId', 'entityType', 'entityName', 'documentType',
      'documentDate', 'expireDate', 'remarks', 'tags', 'isPublic', 'notes'
    ];
    const merged = Object.assign({}, existing);
    allowed.forEach(field => {
      if (updates[field] !== undefined) merged[field] = updates[field];
    });
    merged.updatedAt = audit.updatedAt;
    merged.updatedBy = audit.updatedBy;

    this.repo.update(id, merged);
    return merged;
  };

  /**
   * Delete file: trash from Drive + soft-delete metadata.
   * @param {string} id
   */
  this.deleteFile = function(id) {
    const metadata = this.repo.findById(id);
    if (!metadata) throw new Error('File metadata not found');

    if (metadata.driveFileId) {
      DriveWriter.trashFile(metadata.driveFileId);
    }
    this.repo.delete(id);
    return { success: true, id: id };
  };
}