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
	let test = await fetch(urls[index]);

	// Modify request before passing to user
	test = new HTMLRewriter().on('title', new ElementHandler(index, isNew)).transform(test);
	test = new HTMLRewriter().on('h1#title', new ElementHandler(index, isNew)).transform(test);
	test = new HTMLRewriter().on('p#description', new ElementHandler(index, isNew)).transform(test);
	test = new HTMLRewriter().on('a#url', new ElementHandler(index, isNew)).transform(test);
	test.headers.append('Set-Cookie', `coinIndex=${index}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`); 
	return test;
}

class ElementHandler {
	
	constructor(index, isNew) {
			this.index = index;
			this.isNew = isNew;
	} 

	element(element) {
		if (element.tagName == 'title') {
			element.setInnerContent('Coin Flipper');
		} else if (element.tagName == 'h1' && element.getAttribute('id') == 'title') {
			element.setInnerContent(this.index == 1 ? 'Heads!' : "Tails!");
		} else if (element.tagName == 'p' && element.getAttribute('id') == 'description') {
			element.setInnerContent(this.isNew ? `Thanks for taking a look at my project! Have a cookie!` : `Fun fact: a universe might have diverged from the moment you flipped the coin... you should do it again!`);
		} else if (element.tagName == 'a' && element.getAttribute('id') == 'url') {
			// Set cookie to signal generation of a new value. New flip wont be generated on refresh.
			element.setInnerContent('Click here to flip again');
			element.setAttribute('href', 'https://cloudflare-app.blaxe.workers.dev/');
			element.setAttribute('onclick', `document.cookie="coinIndex=2; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/"`);
		}
	}

	comments(comment) {
		// An incoming comment
	}

	text(text) {
		// An incoming piece of text
	}

}