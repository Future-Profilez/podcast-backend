const { errorResponse } = require("../utils/ErrorHandling");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../prismaconfig");
const { create } = require("xmlbuilder2");
exports.getpodcastLists = catchAsync(async (req, res) => {
  const podcastId = req.params.podcastId;
  const type = req.params.type || 'video'; // 'video' | 'audio'
  const podcast = await prisma.podcast.findUnique({
    where: { uuid: podcastId },
  });
  if (!podcast) {
    return errorResponse(res, "Podcast not found", 404);
  }
  const episodes = await prisma.episode.findMany({
    where: { podcastId: podcast?.id },
    include: { podcast: true },
    orderBy: { createdAt: "desc" }
  });
  if (!episodes || episodes.length === 0) {
    return errorResponse(res, "No episodes found", 404);
  }
  const feed = create({ version: "1.0", encoding: "UTF-8" })
    .ele("rss", {
      version: "2.0",
      "xmlns:itunes": "http://www.itunes.com/dtds/podcast-1.0.dtd",
      "xmlns:googleplay": "http://www.google.com/schemas/play-podcasts/1.0"
    })
    .ele("channel");

  // Channel metadata
  feed.ele("title").txt(podcast.name).up();
  feed.ele("link").txt(`https://thepropertyportfolio.com.au/episode/${podcast?.uuid}`).up();
  feed.ele("description").txt(podcast.description || podcast.name).up();
  feed.ele("language").txt("en-au").up();
  feed.ele("itunes:author").txt(podcast.author || "The Property Portfolio Podcast").up();
  feed.ele("itunes:summary").txt(podcast.description || podcast.name).up();
  feed.ele("itunes:subtitle").txt(podcast.name).up();
  feed.ele("itunes:explicit").txt("no").up();
  
  feed.ele("itunes:owner")
    .ele("itunes:name").txt(podcast.author || "The Property Portfolio Podcast").up()
    .ele("itunes:email").txt(podcast.email || "thepropertyportfoliopodcast@gmail.com").up()
  .up();
  
  feed.ele("itunes:category", { text: "Business" })
    .ele("itunes:category", { text: "Investing" }).up()
  .up();
  feed.ele("itunes:image").att("href", podcast?.thumbnail || "").up();

  // Generate episodes based on type
  episodes.forEach((ep, index) => {
    const item = feed.ele("item");
    
    // Dynamic enclosure based on type
    let enclosureUrl, mimeType, fileSize = "627572736";
    
    if (type === 'audio') {
      enclosureUrl = ep.audioLink;
      mimeType = "audio/mpeg"; // Spotify/Apple compliant
    } else { // video
      enclosureUrl = ep.link;
      mimeType = "video/mp4"; // YouTube/others
    }

    item.ele("title").txt(ep.title).up();
    item.ele("description").txt(ep.description || "").up();
    item.ele("link").txt(`https://thepropertyportfolio.com.au/podcast/${ep.uuid}`).up();
    item.ele("guid", { isPermaLink: "false" })
      .txt(`https://thepropertyportfolio.com.au/podcast/${ep.uuid}`).up();
    item.ele("pubDate").txt(new Date(ep.createdAt).toUTCString()).up();
    item.ele("itunes:duration").txt(ep.durationInSec?.toString() || "60").up();
    item.ele("itunes:explicit").txt("no").up();
    item.ele("itunes:season").txt(ep.season || 1).up();
    item.ele("itunes:episode").txt(ep.episodeNumber || index + 1).up();
    item.ele("itunes:episodeType").txt("full").up();

    if (ep.thumbnail) {
      item.ele("itunes:image").att("href", ep.thumbnail).up();
    }

    // Dynamic enclosure
    item.ele("enclosure", {
      url: enclosureUrl,
      type: mimeType,
      length: fileSize
    }).up();
  });

  const xml = feed.end({ prettyPrint: true });
  res.set("Content-Type", "application/rss+xml");
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