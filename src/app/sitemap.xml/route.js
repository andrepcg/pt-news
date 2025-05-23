import { getAllArticles, getAllTagsWithFrequency, listOfDates } from "../utils";

const URL = "https://n.andrepcg.ovh";

export const dynamic = "force-static"

function generateSiteMap(tags, dates) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${URL}</loc>
     </url>
     <url>
       <loc>${URL}/tags</loc>
     </url>
     ${dates
       .map((date) => {
         return `
       <url>
           <loc>${`${URL}/date/${date}`}</loc>
       </url>
     `;
       })
       .join("")}
     ${tags
       .map(({ tag }) => {
         return `
       <url>
           <loc>${`${URL}/tags/${encodeURIComponent(tag)}`}</loc>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

export async function GET() {
  const tags = await getAllTagsWithFrequency();
  const dates = await listOfDates();
  const body = generateSiteMap(tags, dates);

  return new Response(body, {
    status: 200,
    headers: {
      "Cache-control": "public, s-maxage=86400, stale-while-revalidate",
      "content-type": "application/xml",
    },
  });
}
