const fs = require('fs');
const path = require('path');

const TEAM_IMAGE_SPECS = {
  mohamed: { folder: 'mohamed', file: 'pablo.png' },
  frank: { folder: 'frank', file: 'frank.jpeg' },
  baraka: { folder: 'baraka', file: 'baraka peneza.webp' }
};

function getTeamAssetsRoot(publicDir) {
  return path.join(publicDir, 'team-assets');
}

function getTeamImagePath(memberId, publicDir) {
  const spec = TEAM_IMAGE_SPECS[memberId];
  if (!spec) return null;

  const imagePath = path.join(getTeamAssetsRoot(publicDir), spec.folder, spec.file);
  return fs.existsSync(imagePath) ? imagePath : null;
}

function attachTeamAssets(members, publicDir) {
  return (members || []).map((member) => ({
    ...member,
    imageUrl: `/team-assets/${TEAM_IMAGE_SPECS[member.id].folder}/${encodeURIComponent(TEAM_IMAGE_SPECS[member.id].file)}`,
    imagePath: getTeamImagePath(member.id, publicDir)
  }));
}

module.exports = {
  TEAM_IMAGE_SPECS,
  attachTeamAssets,
  getTeamImagePath,
  getTeamAssetsRoot
};