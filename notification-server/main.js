const webPush = require('web-push');
const fetch = require("node-fetch");

urls = fetch('https://1e75e4aa.ngrok.io/api/subscriptions/')
  .then(response=>response.json())
  .then(res => getUrl (res) 
    // console.log('Request succeeded with JSON response:' res);
, err => console.log('Request rejected with JSON response', err))


function getUrl(urls) {
	// console.log(urls);
	// urls.forEach(url);
	for (var url in urls) {
	  if (urls.hasOwnProperty(url)) {
	    var val = urls[url];
	    // console.log(val['urlEndpoint']);
	    sendNotif(val['urlEndpoint'], val['p256dh'], val['auth'])
	  }
	}
}

function sendNotif(url, p256dh, auth) {

	let newUrl = 'https://fcm.googleapis.com/fcm/send/'+String(url);
	let args = process.argv.slice(2);
	// console.log(newUrl+"\n");
	// console.log(p256dh+"\n");
	// console.log(auth+"\n");
	// return

	const pushSubscription = {"endpoint":newUrl,"expirationTime":null,"keys":{"p256dh":p256dh,"auth":auth}};

	const publicKey = 'BHrLS-PxethlBJJIwsaAwO7IrW4V_r8euex7UG9z6rFw27pOetgXFBst1UQ7idAvelEjz6QVrCRfqHWni0hhnxE';
	const privateKey = 'ZjWaeUJAh44x-BJF3Zqynao88oU9-1Xui2cBHbWmsbo';

	const message = "This is a test Message!";
	const clickUrl = args[0];

	let payload = JSON.stringify({ title: "Test Message for Url", url: clickUrl });

	const options = {
	  gcmAPIKey: '969438153936',
	  TTL: 60,
	  vapidDetails: {
	  	subject: 'mailto:pranav.v@captainweb.in',
	  	publicKey: publicKey,
	  	privateKey: privateKey
	  }
	};

	webPush.sendNotification(
		pushSubscription,
		payload,
		options
	);
	// return url
}