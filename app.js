const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

const site = {
  title: 'Green Defence Bamboo Initiative Tanzania',
  tagline: 'A living story of bamboo, industry, and national value',
  hero: {
    title: 'Building Tanzania\'s Green Defence Future',
    text:
      'Green Defence Bamboo Initiative Tanzania is a real-world bamboo growth platform that brings together agriculture, manufacturing, environmental restoration, and strategic supply chains.',
  },
  sections: [
    {
      eyebrow: 'What This Is',
      title: 'A bamboo initiative people can understand at a glance',
      text:
        'Instead of reading a formal proposal, visitors see the project as a clear public-facing website that explains why bamboo matters, who is involved, and how the value chain works.',
    },
    {
      eyebrow: 'The Partnership',
      title: 'JWAPANO Bamboo Tanzania and UNLOCK Group Limited',
      text:
        'JWAPANO brings bamboo cultivation, factory know-how, and product development. UNLOCK brings business development, financing, market strategy, and expansion support.',
    },
    {
      eyebrow: 'Where It Starts',
      title: 'Military lands, reserved zones, and the Lindi factory',
      text:
        'The story begins with secure plantation areas and the existing bamboo processing base in Lindi, then expands into a broader national industrial network.',
    },
  ],
  highlights: [
    {
      title: 'Defence-ready materials',
      text: 'Barracks furniture, storage systems, shelters, panels, and practical field products.',
    },
    {
      title: 'Public and commercial goods',
      text: 'Furniture, flooring, school desks, household goods, briquettes, and export products.',
    },
    {
      title: 'Environmental value',
      text: 'Carbon capture, soil protection, reforestation, and reduced pressure on forests.',
    },
    {
      title: 'Economic growth',
      text: 'Jobs, training, investment, export potential, and a stronger local bamboo industry.',
    },
  ],
  timeline: [
    'Plant bamboo in secure locations',
    'Process the harvest through Lindi',
    'Create military and public products',
    'Scale into national and export markets',
  ],
  products: [
    {
      category: 'Military',
      title: 'Barracks furniture',
      text: 'Durable bamboo seating and storage for defence accommodation.',
      image:
        'https://plus.unsplash.com/premium_photo-1704686580555-6f31384f756a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      category: 'Military',
      title: 'Field shelters',
      text: 'Fast-deploy structures with a strong natural aesthetic.',
      image:
        'https://plus.unsplash.com/premium_photo-1663045329140-c0aca6cea47f?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      category: 'Commercial',
      title: 'Premium furniture',
      text: 'Elegant bamboo tables and chairs for homes, hospitality, and offices.',
      image:
        'https://plus.unsplash.com/premium_photo-1682147364229-f5faa0fd9bd7?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      category: 'Industrial',
      title: 'Factory production',
      text: 'A realistic view of the kind of workshop and processing environment the project can support.',
      image:
        'https://plus.unsplash.com/premium_photo-1682147355592-dc8677611a7b?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
  ],
};

app.get('/', (req, res) => {
  res.render('index', { site });
});

app.listen(port, () => {
  console.log(`GDBI site running on http://localhost:${port}`);
});