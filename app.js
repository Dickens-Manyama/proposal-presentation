const express = require('express');
const path = require('path');
const { readProposal } = require('./lib/proposal-store');
const { buildProductGallery } = require('./lib/image-catalog');
const { buildPageAssets } = require('./lib/local-assets');
const { attachTeamAssets } = require('./lib/team-assets');
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

app.locals.publicDir = publicDir;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use('/public', express.static(publicDir));

const site = {
  title: 'Green Defence Bamboo Initiative Tanzania',
  tagline: 'Strategic partnership proposal — UNLOCK GROUP LIMITED × JWAPANO Bamboo Tanzania'
};

function loadProposalViewData() {
  const proposal = readProposal();
  const descriptions = proposal.product_descriptions || {};
  const militaryGallery = buildProductGallery(
    proposal.military_products,
    publicDir,
    '/military-products',
    'military',
    descriptions
  );
  const commercialGallery = buildProductGallery(
    proposal.commercial_products,
    publicDir,
    '/commercial-products',
    'commercial',
    descriptions
  );
  const assets = buildPageAssets(publicDir);
  const teamMembers = attachTeamAssets(proposal.team?.members || [], publicDir);
  return { proposal, militaryGallery, commercialGallery, assets, teamMembers };
}

app.get('/', (req, res) => {
  const viewData = loadProposalViewData();
  res.render('index', { site, ...viewData });
});

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`GDBIT site running on http://localhost:${port}`);
});
