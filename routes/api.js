const express = require('express');
const path = require('path');
const { readProposal } = require('../lib/proposal-store');
const { buildProductGallery } = require('../lib/image-catalog');
const { buildDocx, buildPptx, buildPdf } = require('../lib/document-export');

const router = express.Router();

function getGalleries(publicDir) {
  const proposal = readProposal();
  const descriptions = proposal.product_descriptions || {};
  return {
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
}

router.get('/proposal', (req, res) => {
  const proposal = readProposal();
  const galleries = getGalleries(req.app.locals.publicDir);
  res.json({ proposal, galleries });
});

router.get('/export/:format', async (req, res, next) => {
  try {
    const proposal = readProposal();
    const galleries = getGalleries(req.app.locals.publicDir);
    const format = req.params.format.toLowerCase();
    const publicDir = req.app.locals.publicDir;

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

    res.status(400).json({ error: 'Unsupported format. Use pdf, docx, or pptx.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
