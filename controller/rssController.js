const { errorResponse, successResponse, validationErrorResponse } = require("../utils/ErrorHandling");
const catchAsync = require("../utils/catchAsync");
const prisma = require("../prismaconfig");
const { create } = require('xmlbuilder2');

exports.getpodcastLists = catchAsync(async (req, res) => {

   const podcast = await prisma.podcast.findUnique({
      where: { uuid: req.params.uuid },
      include: { files: true }
   });

   if (!podcast) {
      return errorResponse(res, "Podcast not found", 404);
   }

   const feed = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('rss', {
         version: '2.0',
         'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
         'xmlns:googleplay': 'http://www.google.com/schemas/play-podcasts/1.0'
      })
      .ele('channel')
         .ele('title').txt(podcast.name).up()
         .ele('link').txt(`https://yourdomain.com/podcast/${podcast.uuid}`).up()
         .ele('description').txt(podcast.description || '').up()
         .ele('language').txt(podcast.language || 'en').up()
         .ele('itunes:author').txt(podcast?.author || podcast?.Author || process.env.APP_NAME || "PODCAST").up()
         .ele('itunes:summary').txt(podcast.description || '').up()
         .ele('itunes:explicit').txt(podcast.explicit ? 'yes' : 'no').up()
         .ele('itunes:owner')
            .ele('itunes:name').txt(podcast.author || 'Owner').up()
            .ele('itunes:email').txt(podcast.email || 'owner@example.com').up()
         .up()
         .ele('itunes:image').att('href', podcast.thumbnail || 'https://yourdomain.com/default-thumbnail.png').up();

   // Loop through episodes
   podcast.files.forEach(ep => {
      const item = feed.ele('item');
      item.ele('title').txt(ep.title || '').up();
      item.ele('description').txt(ep.description || '').up();
      item.ele('guid').txt(ep.uuid || ep.createdAt).up();
      item.ele('pubDate').txt(new Date(ep.createdAt).toUTCString()).up();
      item.ele('itunes:duration').txt(ep.durationInSeconds?.toString() || ep.duration*60 || '60' ).up();
      item.ele('itunes:explicit').txt('no').up();
      if (ep.thumbnail) {
         item.ele('itunes:image').att('href', ep.thumbnail).up();
      }
      const sizeinBytes = ep.size * 1048576;
      item.ele('enclosure', {
         url: ep.link,
         type: ep.mime || 'audio/mpeg', // Use audio/mp4 or video/mp4 if video
         length: sizeinBytes?.toString() || '' // Optional but recommended
      }).up();
   });

   const xml = feed.end({ prettyPrint: true });

   res.set('Content-Type', 'application/rss+xml');
   res.send(xml);
});









































   
// exports.getpodcastLists = catchAsync(async (req, res) => {
//       const podcast = await prisma.podcast.findUnique({
//          where: { uuid:'01388be3-bc0f-43ea-89aa-e8b6f7e04e6d'},
//          include: {
//             files: true,
//          } 
//       });
//       console.log("podcasts", podcast)
//       if (!podcast) {
//          return errorResponse(res, "Podcast not found", 404);
//       }

//     const feed = create({ version: '1.0', encoding: 'UTF-8' })
//       .ele('rss', {
//          version: '2.0',
//          'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
//          'xmlns:googleplay': 'http://www.google.com/schemas/play-podcasts/1.0'
//       })
//       .ele('channel')
//          .ele('title').txt(podcast?.name).up()
//          .ele('description').txt(podcast?.description).up()
//          .ele('link').txt(`https://podcastify.vercel.app/podcast/${podcast?.link}`).up()
//          .ele('language').txt(podcast?.language || 'English').up()
//          .ele('itunes:author').txt(podcast?.author || podcast?.Author || process.env.APP_NAME || "PODCAST").up()
//          .ele('itunes:image').att('href', podcast?.thumbnail || '' ).up()
//          .ele('itunes:explicit').txt('no').up()
//          .ele('itunes:email').txt(podcast?.email || 'creator@example.com').up();
      
//       podcast?.files?.forEach(ep => {
//          feed.ele('item')
//             .ele('title').txt(ep.title).up()
//             .ele('description').txt(ep.description).up()
//             .ele('enclosure').att({
//                url: ep.audioUrl,
//                type: ep.mime || 'audio/mpeg', // Convert .mp4 to .mp3 for real usage
//                length: ep.durationInSeconds
//             }).up()
//             .ele('guid').txt(ep.guid).up()
//             .ele('pubDate').txt(ep.createdAt).up()
//             .ele('itunes:duration').txt(ep.durationInSeconds).up()
//             .ele('itunes:image').att('href', ep.thumbnail).up()
//             .ele('itunes:explicit').txt('no').up()
//             .up();
//       });

//       const xml = feed.end({ prettyPrint: true });
//       res.set('Content-Type', 'application/rss+xml');
//       res.send(xml);
   
// });