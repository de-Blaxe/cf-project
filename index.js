addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
	const urls = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
							  .then((response) => {
							    return response.json();
							  })
							  .then((data) => {
							    console.log(data.variants);
							    return data.variants;
							  });
	console.log(urls[0])
	// const urls = JSON.parse(response.body)
	// console.log(response.body)
  return await fetch(urls[0])
}
