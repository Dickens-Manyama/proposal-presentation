const fs = require('fs');
const path = require('path');

const TEAM_IMAGE_SPECS = {
  mohamed: { folder: 'mohamed', file: 'pablo.png' },
  frank: { folder: 'frank', file: 'frank.jpeg' },
  baraka: { folder: 'baraka', file: 'baraka peneza.webp' }
};

function getWorkspaceRoot(publicDir) {
  return path.resolve(publicDir, '..', '..');
}

function getTeamImagePath(memberId, workspaceRoot) {
  const spec = TEAM_IMAGE_SPECS[memberId];
  if (!spec) return null;

  const imagePath = path.join(workspaceRoot, spec.folder, spec.file);
  return fs.existsSync(imagePath) ? imagePath : null;
}

function attachTeamAssets(members, workspaceRoot) {
  return (members || []).map((member) => ({
    ...member,
    imageUrl: `/team-assets/${TEAM_IMAGE_SPECS[member.id].folder}/${encodeURIComponent(TEAM_IMAGE_SPECS[member.id].file)}`,
    imagePath: getTeamImagePath(member.id, workspaceRoot)
  }));
}

module.exports = {
  TEAM_IMAGE_SPECS,
  attachTeamAssets,
  getTeamImagePath,
  getWorkspaceRoot
};