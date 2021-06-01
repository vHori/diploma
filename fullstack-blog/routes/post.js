const express = require('express')
const aposToLexForm = require('apos-to-lex-form')
const natural = require('natural')
const SpellCorrector = require('spelling-corrector');
const SW = require('stopword');
const router = express.Router()
const Post = require('../models/Post')

const spellCorrector = new SpellCorrector();
spellCorrector.loadDictionary();

// http://localhost:5000/api/post (GET)
router.get('/', async (req, res) => {
	const posts = await Post.find({})
	res.status(200).json(posts)
})

// http://localhost:5000/api/post (POST)
router.post('/', async (req, res) => {

	const review = req.body.review;
	const lexedReview = aposToLexForm(review);
	const casedReview = lexedReview.toLowerCase();
    const alphaOnlyReview = casedReview.replace(/[^a-zA-Z\s]+/g, '');

	const { WordTokenizer } = natural;
    const tokenizer = new WordTokenizer();
    const tokenizedReview = tokenizer.tokenize(alphaOnlyReview);

    tokenizedReview.forEach((word, index) => {
    	tokenizedReview[index] = spellCorrector.correct(word);
  	})

  	const filteredReview = SW.removeStopwords(tokenizedReview);

  	const { SentimentAnalyzer, PorterStemmer } = natural;
  	const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
  	const analysis = analyzer.getSentiment(filteredReview);

	const postData = {
		title: req.body.title,
		review: req.body.review,
		reviewResult: analysis 
	}

	const post = new Post(postData)

	await post.save()

	res.status(201).json(post)
})

// http://localhost:5000/api/post/id (DELETE)
router.delete('/:id', async (req, res) => {

	await Post.remove({_id: req.params.id})

	res.status(200).json({
		message: 'Deleted'
	})
	
})

module.exports = router