const fs = require('fs');
const path = require('path');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

/** Exact image assignment per product — filenames in military-products / commercial-products */
const MANUAL_IMAGE_MAP = {
  military: {
    'Barracks furniture': ['camp structures.jpg', 'military storage unit.jpg'],
    'Bamboo flooring': ['bamboo flooring.jpg'],
    'Field shelters': ['field shelters.jpg', 'bamboo shelter good.jpg'],
    'Bamboo fencing systems': ['bamboo fencing.jpg'],
    'Tactical storage units': ['military storage unit.jpg', 'storage unit.jpg'],
    'Training camp structures': ['camp structures.jpg', 'field shelters.jpg'],
    'Bamboo composite panels': ['roofing sheets.jpg', 'camp structures.jpg'],
    'Eco-friendly packaging solutions': ['bamboo packaging.jpg', 'packaging.jpg']
  },
  commercial: {
    Furniture: ['furniture 1.jpg', 'furniture 2.jpg'],
    'Toothpicks and skewers': ['toothpick.jpg', 'toothpic 2.jpg'],
    'Bamboo flooring': ['flooring.jpg', 'flooring 1.jpg'],
    'Construction materials': ['constructing materials.jpg'],
    'Household products': ['household product.jpg', 'household 2.jpg'],
    'Charcoal briquettes': ['charcoal bricks.jpg', 'charcoal bricks 2.jpg'],
    'Decorative products': ['decorative product.jpg', 'decorative products2.jpg'],
    'School desks and office furniture': [
      'school desks and office 1.jpg',
      'schooldesks and office.jpg'
    ]
  }
};

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function isReadableRasterImage(filePath) {
  try {
    const buf = fs.readFileSync(filePath).slice(0, 4);
    if (buf[0] === 0xff && buf[1] === 0xd8) return true;
    if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return true;
    return false;
  } catch {
    return false;
  }
}

function listImages(folderPath) {
  if (!fs.existsSync(folderPath)) return [];
  return fs
    .readdirSync(folderPath)
    .filter((file) => IMAGE_EXT.has(path.extname(file).toLowerCase()))
    .filter((file) => isReadableRasterImage(path.join(folderPath, file)))
    .map((file) => ({
      file,
      name: path.parse(file).name,
      normalized: normalize(path.parse(file).name)
    }));
}

function resolveManualFiles(productName, images, type) {
  const manual = MANUAL_IMAGE_MAP[type]?.[productName];
  if (!manual) return null;
  const available = new Set(images.map((i) => i.file));
  return manual.filter((file) => available.has(file));
}

function buildProductGallery(products, publicFolder, urlPrefix, type, descriptions = {}) {
  const folderPath = path.join(publicFolder, urlPrefix.replace(/^\//, ''));
  const images = listImages(folderPath);
  const descMap = descriptions[type] || descriptions || {};

  return products.map((name) => {
    const manualFiles = resolveManualFiles(name, images, type);
    const picked =
      manualFiles && manualFiles.length
        ? manualFiles
        : [];

    return {
      name,
      description: descMap[name] || '',
      images: picked.map((file) => `${urlPrefix}/${encodeURIComponent(file)}`)
    };
  });
}

function getAllImages(publicFolder, subfolder) {
  const folderPath = path.join(publicFolder, subfolder);
  return listImages(folderPath).map((img) => ({
    file: img.file,
    url: `/${subfolder}/${encodeURIComponent(img.file)}`
  }));
}

module.exports = {
  buildProductGallery,
  getAllImages,
  listImages,
  MANUAL_IMAGE_MAP
};
