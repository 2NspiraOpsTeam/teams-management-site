// Retirement gateway for the former preview. No requests reach the preview DB.
export default {
  async fetch(request) {
    const source = new URL(request.url);
    const destination = new URL('https://www.teamsmanagement.com/');
    destination.pathname = source.pathname;
    destination.search = source.search;
    return new Response(null, {
      status: 308,
      headers: {
        Location: destination.href,
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};
