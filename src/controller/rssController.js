const { errorResponse } = require("../utils/ErrorHandling");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../prismaconfig");
const { create } = require('xmlbuilder2');

exports.getpodcastLists = catchAsync(async (req, res) => {

  const episodes = await prisma.episode.findMany({
    include: { podcast: true }
  });

  if (!episodes || episodes.length === 0) {
    return errorResponse(res, "No episodes found", 404);
  }

  const podcast = episodes[0].podcast; // Take podcast data from first episode

  const feed = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rss', {
      version: '2.0',
      'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
      'xmlns:googleplay': 'http://www.google.com/schemas/play-podcasts/1.0'
    })
    .ele('channel')

      // Channel (Podcast) Metadata
      .ele('title').txt(podcast.name).up()
      .ele('link').txt(`https://thepropertyportfolio.com.au/episode/${podcast.uuid}`).up()
      .ele('description').txt(podcast.description || podcast.name).up()
      .ele('language').txt(podcast.language || 'en-US').up()
      .ele('itunes:author').txt(podcast.author || "Unknown Author").up()
      .ele('itunes:summary').txt(podcast.description || podcast.name).up()
      .ele('itunes:subtitle').txt(podcast.name).up()
      .ele('itunes:explicit').txt('no').up()
      .ele('itunes:owner')
        .ele('itunes:name').txt(podcast.author).up()
        .ele('itunes:email').txt(podcast.email).up()
      .up()
      .ele('itunes:image').att('href', podcast.thumbnail).up();

  // Add all episodes
  episodes.forEach((ep, index) => {
    const item = feed.ele('item');

    item.ele('title').txt(ep.title).up();
    item.ele('description').txt(ep.description).up();
    item.ele('guid').txt(ep.uuid).up();
    item.ele('pubDate').txt(new Date(ep.createdAt).toUTCString()).up();
    item.ele('itunes:duration').txt(ep.durationInSec?.toString() || '60').up();
    item.ele('itunes:explicit').txt('no').up();

    // Season + Episode numbering
    item.ele('itunes:season').txt(ep.season || 1).up();
    item.ele('itunes:episode').txt(ep.episodeNumber || index + 1).up();
    item.ele('itunes:episodeType').txt('full').up();

    if (ep.thumbnail) {
      item.ele('itunes:image')
        .att('href', ep.thumbnail)
      .up();
    }

    item.ele('enclosure', {
      url: ep.link && ep.link !== "null" ? ep.link : `https://thepropertyportfolio.com.au/episode/${ep.uuid}.mp3`,
      type: ep.mimefield || 'audio/mpeg',
      length: ((ep.size || 1) * 1048576).toString()
    }).up();
  });

  const xml = feed.end({ prettyPrint: true });

  res.set('Content-Type', 'application/rss+xml');
  res.send(xml);
});


// exports.getpodcastLists = catchAsync(async (req, res) => {

//    const podcast = await prisma.podcast.findUnique({
//       where: { uuid: req.params.uuid },
//       include: { files: true }
//    });

//    if (!podcast) {
//       return errorResponse(res, "Podcast not found", 404);
//    }

//    const feed = create({ version: '1.0', encoding: 'UTF-8' })
//       .ele('rss', {
//          version: '2.0',
//          'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
//          'xmlns:googleplay': 'http://www.google.com/schemas/play-podcasts/1.0'
//       })
//       .ele('channel')
//          .ele('title').txt(podcast.name).up()
//          .ele('link').txt(`https://yourdomain.com/podcast/${podcast.uuid}`).up()
//          .ele('description').txt(podcast.description || '').up()
//          .ele('language').txt(podcast.language || 'en').up()
//          .ele('itunes:author').txt(podcast?.author || podcast?.Author || process.env.APP_NAME || "PODCAST").up()
//          .ele('itunes:summary').txt(podcast.description || '').up()
//          .ele('itunes:explicit').txt(podcast.explicit ? 'yes' : 'no').up()
//          .ele('itunes:owner')
//             .ele('itunes:name').txt(podcast.author || 'Owner').up()
//             .ele('itunes:email').txt(podcast.email || 'owner@example.com').up()
//          .up()
//          .ele('itunes:image').att('href', podcast.thumbnail || 'https://yourdomain.com/default-thumbnail.png').up();

//    // Loop through episodes
//    podcast.files.forEach(ep => {
//       const item = feed.ele('item');
//       item.ele('title').txt(ep.title || '').up();
//       item.ele('description').txt(ep.description || '').up();
//       item.ele('guid').txt(ep.uuid || ep.createdAt).up();
//       item.ele('pubDate').txt(new Date(ep.createdAt).toUTCString()).up();
//       item.ele('itunes:duration').txt(ep.durationInSeconds?.toString() || ep.duration*60 || '60' ).up();
//       item.ele('itunes:explicit').txt('no').up();
//       if (ep.thumbnail) {
//          item.ele('itunes:image').att('href', ep.thumbnail).up();
//       }
//       const sizeinBytes = ep.size * 1048576;
//       item.ele('enclosure', {
//          url: ep.link,
//          type: ep.mime || 'audio/mpeg', // Use audio/mp4 or video/mp4 if video
//          length: sizeinBytes?.toString() || '' // Optional but recommended
//       }).up();
//    });

//    const xml = feed.end({ prettyPrint: true });

//    res.set('Content-Type', 'application/rss+xml');
//    res.send(xml);
// });