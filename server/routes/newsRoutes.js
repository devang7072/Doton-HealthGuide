const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const router = express.Router();

/**
 * GET /api/news
 * Fetches Punjab/India health news and converts to JSON.
 */
router.get('/', async (req, res) => {
  try {
    const RSS_URL = 'https://news.google.com/rss/search?q=Punjab+health+medical&hl=en-IN&gl=IN&ceid=IN:en';
    const response = await axios.get(RSS_URL);
    
    // Parse XML to JSON
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(response.data);
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ message: 'Failed to fetch news' });
  }
});

module.exports = router;
