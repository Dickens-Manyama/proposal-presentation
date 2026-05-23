const path = require('path');
const { listImages } = require('./image-catalog');

function imageUrl(folder, file) {
  if (!file) return null;
  return `/${folder}/${encodeURIComponent(file)}`;
}

function findFile(images, filename) {
  if (!filename) return null;
  const hit = images.find((img) => img.file === filename);
  return hit ? hit.file : null;
}

/** Hero panel: building / structure imagery only */
function buildPageAssets(publicDir) {
  const teamAssets = listImages(path.join(publicDir, 'team-assets'));
  const military = listImages(path.join(publicDir, 'military-products'));
  const commercial = listImages(path.join(publicDir, 'commercial-products'));

  const bambooHero = findFile(teamAssets, 'bamboo.jpg');
  const camp = findFile(military, 'camp structures.jpg');
  const fieldShelter = findFile(military, 'field shelters.jpg');
  const bambooShelter = findFile(military, 'bamboo shelter good.jpg');
  const constructing = findFile(commercial, 'constructing materials.jpg');
  const logo = findFile(teamAssets, 'company logo.jpeg');

  return {
    heroBg:
      imageUrl('team-assets', bambooHero) ||
      imageUrl('military-products', camp) ||
      imageUrl('commercial-products', constructing),
    mapBg: imageUrl('military-products', camp) || imageUrl('military-products', fieldShelter),
    conclusionBg:
      imageUrl('commercial-products', constructing) || imageUrl('military-products', fieldShelter),
    panelOne: imageUrl('military-products', camp),
    panelTwo: imageUrl('commercial-products', constructing) || imageUrl('military-products', fieldShelter),
    panelThree:
      imageUrl('military-products', fieldShelter) ||
      imageUrl('military-products', bambooShelter),
    logo: imageUrl('team-assets', logo)
  };
}

module.exports = { buildPageAssets, imageUrl };
