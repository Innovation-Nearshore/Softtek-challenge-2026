'use strict';

/**
 * Upload middleware (SRP: only configures multer for CSV file uploads).
 * Decouples file-handling config from route and controller logic.
 */

const multer = require('multer');
const path = require('path');
const os = require('os');

const upload = multer({
  dest: os.tmpdir(),
  fileFilter: (_req, file, cb) => {
    const isCSV =
      file.mimetype === 'text/csv' ||
      path.extname(file.originalname).toLowerCase() === '.csv';
    if (isCSV) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos CSV'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
