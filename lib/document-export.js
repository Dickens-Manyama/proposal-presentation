const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  PageBreak,
  AlignmentType
} = require('docx');
const PptxGenJS = require('pptxgenjs');
const PdfPrinter = require('pdfmake');
const vfsFonts = require('pdfmake/build/vfs_fonts');
const { buildPageAssets } = require('./local-assets');

const THEME = {
  bgDark: '07150D',
  bgSurface: '0A1A10',
  green: '9AE67B',
  greenDark: '2D5A27',
  gold: 'C9A227',
  text: 'EDF7E8',
  textMuted: 'B8D4B0'
};

const pdfFonts = {
  Roboto: {
    normal: Buffer.from(vfsFonts['Roboto-Regular.ttf'], 'base64'),
    bold: Buffer.from(vfsFonts['Roboto-Medium.ttf'], 'base64'),
    italics: Buffer.from(vfsFonts['Roboto-Italic.ttf'], 'base64'),
    bolditalics: Buffer.from(vfsFonts['Roboto-MediumItalic.ttf'], 'base64')
  }
};

function resolveImagePath(publicDir, imageUrl) {
  try {
    const relative = decodeURIComponent(imageUrl.replace(/^\//, ''));
    const filePath = path.resolve(publicDir, relative);
    return fs.existsSync(filePath) ? filePath : null;
  } catch {
    return null;
  }
}

/** Base64 data URI — required for reliable image embed in Node PPTX buffers */
function loadImageData(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return null;
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const mime =
    ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : null;
  if (!mime) return null;
  try {
    const base64 = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

function addSlideImage(slide, filePath, layout) {
  const data = loadImageData(filePath);
  if (!data) return false;
  slide.addImage({
    data,
    x: layout.x,
    y: layout.y,
    w: layout.w,
    h: layout.h
  });
  return true;
}

function sectionTitle(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 }
  });
}

function bodyParagraph(text) {
  return new Paragraph({
    children: [new TextRun({ text: String(text), size: 24 })],
    spacing: { after: 120 }
  });
}

function bulletList(items) {
  return items.filter(Boolean).map(
    (item) =>
      new Paragraph({
        text: String(item),
        bullet: { level: 0 },
        spacing: { after: 80 }
      })
  );
}

function buildProposalSections(proposal) {
  return [
    { title: 'Executive Summary', body: [proposal.hero.executive_summary, ...proposal.hero.project_establishments] },
    { title: 'Vision', body: [proposal.vision_mission.vision] },
    { title: 'Mission', body: proposal.vision_mission.mission },
    { title: 'Strategic Objectives', body: proposal.strategic_objectives },
    {
      title: 'Partnership — JWAPANO',
      body: [...proposal.partnership_structure.jwapano.roles, ...proposal.partnership_structure.jwapano.contributions]
    },
    {
      title: 'Partnership — UNLOCK GROUP',
      body: [...proposal.partnership_structure.unlock_group.roles, ...proposal.partnership_structure.unlock_group.contributions]
    },
    { title: 'National Value Chain', body: proposal.value_chain || [] },
    { title: 'Plantation Locations', body: proposal.plantation_strategy.locations },
    { title: 'Plantation Benefits', body: proposal.plantation_strategy.benefits },
    {
      title: 'Manufacturing',
      body: [proposal.manufacturing_development.existing_factory, ...proposal.manufacturing_development.factory_expansion]
    },
    { title: 'Military Products', gallery: 'military' },
    { title: 'Commercial Products', gallery: 'commercial' },
    {
      title: 'Environmental Impact',
      body: [...proposal.environmental_impact.items, proposal.environmental_impact.extra_text]
    },
    { title: 'Economic Impact', body: proposal.economic_impact },
    { title: 'Revenue Streams', body: proposal.revenue_streams },
    { title: 'Investment Opportunity', body: proposal.investment_opportunity },
    { title: 'Conclusion', body: [proposal.conclusion] }
  ];
}

function addThemedSlide(pptx, { title, eyebrow, bullets, dark = true, imagePath, imageRight }) {
  const slide = pptx.addSlide();
  slide.background = { color: dark ? THEME.bgDark : THEME.bgSurface };

  if (eyebrow) {
    slide.addText(eyebrow, {
      x: 0.5,
      y: 0.35,
      w: 9,
      h: 0.35,
      fontSize: 11,
      color: THEME.gold,
      bold: true,
      charSpacing: 3
    });
  }

  slide.addText(title, {
    x: 0.5,
    y: 0.75,
    w: imagePath && !imageRight ? 4.2 : 9,
    h: 0.85,
    fontSize: 26,
    bold: true,
    color: THEME.green,
    fontFace: 'Arial'
  });

  const textW = imagePath ? (imageRight ? 4.5 : 4.2) : 9;
  const textX = imageRight ? 0.5 : 0.5;

  if (bullets && bullets.length) {
    slide.addText(bullets.map(String).join('\n'), {
      x: textX,
      y: 1.65,
      w: textW,
      h: imagePath ? 3.8 : 4.5,
      fontSize: 12,
      color: THEME.textMuted,
      bullet: { type: 'bullet', color: THEME.green },
      breakLine: true,
      valign: 'top'
    });
  }

  if (imagePath) {
    addSlideImage(slide, imagePath, {
      x: imageRight ? 5.1 : 4.8,
      y: 0.45,
      w: 4.6,
      h: 4.85
    });
  }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 5.45,
    w: 10,
    h: 0.08,
    fill: { color: THEME.gold }
  });

  return slide;
}

function addProductSlide(pptx, product, publicDir) {
  const slide = pptx.addSlide();
  slide.background = { color: THEME.bgSurface };

  slide.addText(product.name, {
    x: 0.5,
    y: 0.4,
    w: 9,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: THEME.green
  });

  if (product.description) {
    slide.addText(product.description, {
      x: 0.5,
      y: 1.05,
      w: 9,
      h: 0.9,
      fontSize: 11,
      color: THEME.textMuted
    });
  }

  const paths = product.images
    .map((url) => resolveImagePath(publicDir, url))
    .filter(Boolean);

  if (paths.length === 1) {
    addSlideImage(slide, paths[0], { x: 1.2, y: 2.05, w: 7.6, h: 3.35 });
  } else if (paths.length >= 2) {
    addSlideImage(slide, paths[0], { x: 0.45, y: 2.05, w: 4.5, h: 3.35 });
    addSlideImage(slide, paths[1], { x: 5.05, y: 2.05, w: 4.5, h: 3.35 });
  }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 5.45,
    w: 10,
    h: 0.08,
    fill: { color: THEME.gold }
  });
}

async function buildPptx(proposal, galleries, publicDir) {
  const pptx = new PptxGenJS();
  pptx.title = proposal.hero.subtitle;
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'GDBIT';

  const assets = buildPageAssets(publicDir);
  const heroImg = assets.panelOne ? resolveImagePath(publicDir, assets.panelOne) : null;

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: THEME.bgDark };
  if (heroImg) {
    addSlideImage(titleSlide, heroImg, { x: 4.85, y: 0, w: 5.15, h: 5.625 });
  }
  titleSlide.addText('GDBIT', {
    x: 0.5,
    y: 0.5,
    w: 4.5,
    h: 0.5,
    fontSize: 14,
    color: THEME.gold,
    bold: true,
    charSpacing: 6
  });
  titleSlide.addText(proposal.hero.subtitle, {
    x: 0.5,
    y: 1.1,
    w: 4.8,
    h: 1.2,
    fontSize: 22,
    bold: true,
    color: THEME.text
  });
  titleSlide.addText(proposal.hero.title, {
    x: 0.5,
    y: 2.4,
    w: 4.8,
    h: 2.5,
    fontSize: 11,
    color: THEME.textMuted
  });

  buildProposalSections(proposal).forEach((section) => {
    if (section.gallery === 'military') {
      galleries.military.forEach((p) => addProductSlide(pptx, p, publicDir));
      return;
    }
    if (section.gallery === 'commercial') {
      galleries.commercial.forEach((p) => addProductSlide(pptx, p, publicDir));
      return;
    }

    let sectionImage = null;
    if (section.title === 'Executive Summary' && heroImg) {
      sectionImage = heroImg;
    } else if (section.title === 'Manufacturing' && assets.panelTwo) {
      sectionImage = resolveImagePath(publicDir, assets.panelTwo);
    } else if (
      (section.title === 'Plantation Locations' || section.title === 'Plantation Benefits') &&
      assets.mapBg
    ) {
      sectionImage = resolveImagePath(publicDir, assets.mapBg);
    }

    addThemedSlide(pptx, {
      title: section.title,
      eyebrow: 'GDBIT PROPOSAL',
      bullets: section.body,
      dark: !['Vision', 'Mission'].includes(section.title),
      imagePath: sectionImage,
      imageRight: Boolean(sectionImage)
    });
  });

  return pptx.write({ outputType: 'nodebuffer' });
}

async function buildDocx(proposal, galleries, publicDir) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: proposal.hero.subtitle, bold: true, size: 52, color: THEME.greenDark })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 }
    }),
    new Paragraph({
      children: [new TextRun({ text: proposal.hero.title, size: 26, color: '444444' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  ];

  buildProposalSections(proposal).forEach((section, index) => {
    if (index > 0) children.push(new PageBreak());
    children.push(sectionTitle(section.title));
    if (section.gallery === 'military' || section.gallery === 'commercial') {
      const gallery = section.gallery === 'military' ? galleries.military : galleries.commercial;
      gallery.forEach((p) => {
        children.push(new Paragraph({ text: p.name, heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 80 } }));
        if (p.description) children.push(bodyParagraph(p.description));
        p.images.forEach((url) => {
          if (resolveImagePath(publicDir, url)) children.push(bodyParagraph(`[Image: ${p.name}]`));
        });
      });
    } else {
      section.body.forEach((line) => {
        if (typeof line === 'string' && line.length > 120) children.push(bodyParagraph(line));
        else children.push(...bulletList([line]));
      });
    }
  });

  return Packer.toBuffer(new Document({ title: proposal.hero.subtitle, sections: [{ children }] }));
}

function buildPdf(proposal, galleries, publicDir) {
  const content = [
    { text: proposal.hero.subtitle, style: 'coverTitle', pageBreak: 'after' },
    { text: proposal.hero.title, style: 'coverSub', margin: [0, 0, 0, 30] }
  ];

  const addProductPdfSection = (title, gallery) => {
    content.push({ text: title, style: 'header', pageBreak: 'before' });
    gallery.forEach((product) => {
      content.push({ text: product.name, style: 'subheader', margin: [0, 12, 0, 4] });
      if (product.description) content.push({ text: product.description, margin: [0, 0, 0, 8], color: '#444' });
      product.images.forEach((url) => {
        const filePath = resolveImagePath(publicDir, url);
        if (!filePath) return;
        try {
          content.push({ image: filePath, width: 220, margin: [0, 6, 12, 12] });
        } catch {
          /* skip */
        }
      });
    });
  };

  buildProposalSections(proposal).forEach((section, index) => {
    if (section.gallery === 'military') {
      addProductPdfSection('Military Products to be Produced', galleries.military);
      return;
    }
    if (section.gallery === 'commercial') {
      addProductPdfSection('Public and Commercial Products', galleries.commercial);
      return;
    }
    content.push({ text: section.title, style: 'header', margin: [0, index === 0 ? 0 : 20, 0, 8] });
    if (index === 0) {
      content.push({ text: section.body[0], margin: [0, 0, 0, 12] });
      content.push({ ul: section.body.slice(1) });
    } else {
      content.push({ ul: section.body });
    }
  });

  const docDefinition = {
    info: { title: proposal.hero.subtitle, author: 'GDBIT' },
    content,
    styles: {
      coverTitle: { fontSize: 26, bold: true, color: '#2d5a27', alignment: 'center', margin: [0, 100, 0, 12] },
      coverSub: { fontSize: 12, alignment: 'center', color: '#444' },
      header: { fontSize: 17, bold: true, color: '#2d5a27' },
      subheader: { fontSize: 13, bold: true, color: '#1a2e1a' }
    },
    defaultStyle: { fontSize: 11, lineHeight: 1.35 }
  };

  return new Promise((resolve, reject) => {
    const pdfDoc = new PdfPrinter(pdfFonts).createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', (c) => chunks.push(c));
    pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

module.exports = { buildDocx, buildPptx, buildPdf };
