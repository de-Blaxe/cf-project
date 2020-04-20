addEventListener('fetch', event => {
	event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
	
	const urls = await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
							  .then((response) => {
							    return response.json();
							  })
							  .then((data) => {
							    return data.variants;
							  });

	// Determine which page should be shown
	const cookie = request.headers.get('cookie');
	let index;
	let isNew;
	if (cookie && cookie.includes('coinIndex=1')) {
		index = 1;
		isNew = false;
	} else if (cookie && cookie.includes('coinIndex=0')) {
		index = 0;
		isNew = false;
	} else if (cookie && cookie.includes('coinIndex=2')) {
		index =  Math.random() < 0.5 ? 0 : 1;
		isNew = false
	} else {
		index = Math.random() < 0.5 ? 0 : 1;
		isNew = true;
	}

	// Get page
	let page = await fetch(urls[index]);

	// Modify request before passing to user
	transformedPage = new HTMLRewriter()
		.on('title', new TitleHandler())
		.on('h1#title', new Header1Handler(index))
		.on('p#description', new DescriptionHandler(isNew))
		.on('a#url', new ButtonHandler()).transform(page);
	transformedPage.headers.append('Set-Cookie', `coinIndex=${index}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`); 
	return transformedPage;
}

class TitleHandler {

	element(element) {
		element.setInnerContent('Coin Flipper');
	}

}

class Header1Handler {

	constructor(index) {
		this.index = index;
	}

	element(element) {
		element.setInnerContent(this.index == 1 ? 'Heads!' : "Tails!");
	}

}

class DescriptionHandler {

	constructor(isNew) {
		this.isNew = isNew;
	}

	element(element) {
		element.setInnerContent(this.isNew ? 
			`Thanks for taking a look at my project! Have a cookie!` : 
			`Fun fact: an alternate universe might have diverged from the moment you flipped the coin... you should do it again!`);
	}

}

class ButtonHandler {

	element(element) {
		element.setInnerContent('Click here to flip again');
		element.setAttribute('href', 'https://cloudflare-app.blaxe.workers.dev/');
		element.setAttribute('onclick', `document.cookie="coinIndex=2; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/"`);
	}

}
