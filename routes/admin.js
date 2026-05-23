const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { readProposal, updateProposal } = require('../lib/proposal-store');
const { getAllImages } = require('../lib/image-catalog');
const { buildDocx, buildPptx, buildPdf } = require('../lib/document-export');
const { buildProductGallery } = require('../lib/image-catalog');

const router = express.Router();
const ADMIN_PASSWORD = process.env.GDBI_ADMIN_PASSWORD || 'gdbi-admin';

function requireAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.body?.token || req.query?.token;
  if (token === ADMIN_PASSWORD) return next();
  if (req.method === 'GET' && !req.path.startsWith('/api')) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function imageStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(req.app.locals.publicDir, subfolder);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._ -]/g, '_');
      cb(null, safe);
    }
  });
}

const uploadMilitary = multer({ storage: imageStorage('military-products') });
const uploadCommercial = multer({ storage: imageStorage('commercial-products') });

router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    title: 'GDBIT Admin',
    adminToken: ADMIN_PASSWORD
  });
});

router.get('/api/content', requireAuth, (req, res) => {
  res.json(readProposal());
});

router.put('/api/content', requireAuth, express.json(), (req, res) => {
  const updated = updateProposal(req.body);
  res.json(updated);
});

router.get('/api/images/:type', requireAuth, (req, res) => {
  const type = req.params.type === 'commercial' ? 'commercial-products' : 'military-products';
  res.json(getAllImages(req.app.locals.publicDir, type));
});

router.post(
  '/api/images/:type',
  requireAuth,
  (req, res, next) => {
    const middleware =
      req.params.type === 'commercial' ? uploadCommercial.single('image') : uploadMilitary.single('image');
    middleware(req, res, next);
  },
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const sub = req.params.type === 'commercial' ? 'commercial-products' : 'military-products';
    res.json({
      file: req.file.filename,
      url: `/${sub}/${encodeURIComponent(req.file.filename)}`
    });
  }
);

router.get('/api/export/:format', requireAuth, async (req, res, next) => {
  try {
    const proposal = readProposal();
    const publicDir = req.app.locals.publicDir;
    const descriptions = proposal.product_descriptions || {};
    const galleries = {
      military: buildProductGallery(
        proposal.military_products,
        publicDir,
        '/military-products',
        'military',
        descriptions
      ),
      commercial: buildProductGallery(
        proposal.commercial_products,
        publicDir,
        '/commercial-products',
        'commercial',
        descriptions
      )
    };
    const format = req.params.format.toLowerCase();

    if (format === 'pdf') {
      const buffer = await buildPdf(proposal, galleries, publicDir);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="GDBIT-Proposal.pdf"');
      return res.send(buffer);
    }
    if (format === 'docx') {
      const buffer = await buildDocx(proposal, galleries, publicDir);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="GDBIT-Proposal.docx"');
      return res.send(buffer);
    }
    if (format === 'pptx') {
      const buffer = await buildPptx(proposal, galleries, publicDir);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      );
      res.setHeader('Content-Disposition', 'attachment; filename="GDBIT-Proposal.pptx"');
      return res.send(buffer);
    }
    res.status(400).json({ error: 'Invalid format' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
