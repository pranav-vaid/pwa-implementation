<script>
isSubscribed = false;
swReg();

function urlBase64ToUint8Array(base64String) {
  // console.log(base64String);
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
  // console.log(padding);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  // console.log(base64);

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
  return outputArray;
}

function swReg() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('service-worker.js', {scope: '/wordpress/'}).then(registration => {
            // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
            // console.log(reg);
        navigator.serviceWorker.ready.then(reg => getSub(reg))
      })
          }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
          });
  } else {
      console.log('service worker is not supported');
    }
}



function getSub(registration) {
  registration.pushManager.getSubscription()
  .then(subscription => {
    isSubscribed = (subscription !== null);
    if (isSubscribed) {
      console.log('User IS already subscribed.');
    } else {
      console.log('User IS NOT subscribed.');
      notification(registration);
    }
  });
  return true;
}

function notification(registration) {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications!');
  } else {

    // this will ask user permission for displaying notifications
     
     Notification.requestPermission(status => {
      console.log("Notification permission status: ", status);})
     .then(function() {
    if (Notification.permission == 'granted') {
  // console.log(reg);
  if ('pushManager' in registration) {
        console.log('The service worker supports push');
      } else {
        console.log('The service worker doesn\'t support push');
      }


  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array('BHrLS-PxethlBJJIwsaAwO7IrW4V_r8euex7UG9z6rFw27pOetgXFBst1UQ7idAvelEjz6QVrCRfqHWni0hhnxE')
  })
  .then(subscription => {
    // console.log(subscription);   
    // console.log("------------------------------------------");   
    subscription = JSON.stringify({subscription});
    json_subs = JSON.parse(subscription);

    // subscription.json();
    // console.log(Object.values(subscription));

    var endpoint = json_subs['subscription']['endpoint'];
    // console.log(endpoint);
    // console.log('----------------');
    var auth = json_subs['subscription']['keys']['auth'];
    var key = json_subs['subscription']['keys']['p256dh'];
    console.log('User is subscribed:');
    // console.log(subscription);

    endpoint = endpoint.match(/https:\/\/fcm\.googleapis\.com\/fcm\/send\/(.*)/);
    var data = {
      endpoint: endpoint[1],
      auth: auth,
      key: key
    }
    var endpointUrl = 'https://1e75e4aa.ngrok.io/api/endpoint/'+endpoint[1]+'?auth='+auth+'&key='+key;
    // console.log(endpointUrl);
    // console.log(key);
    // console.log(auth);
    // console.log(JSON.stringify(data));
    fetch(endpointUrl, {
    method: 'post',
    headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response=>response.json())
    .then(function (res) {
      console.log('Request succeeded with JSON response:', res);
    })
    .catch(function (error) {
      console.log('Request failed', error);
    });

    isSubscribed = true;
  })
  .catch(err => {
    if (Notification.permission == 'denied') {
      console.warn('Permission for notifications was denied');
    } else {
      console.error('Failed to subscribe the user: ', err);
    }
  });
  console.log("Notification permission successfully accepted!!");
  return 'granted';
  //   // });
  } else {
    console.log("User denied notification permission.");
    // fetch(endpointUrl, {
    //   method: 'delete',
    //   headers: {
    //       'Content-type': 'application/json'
    //     },
    //   })
    //   .then(response=>response.json())
    //   .then(function (res) {
    //     console.log('Request succeeded with JSON response:', res);
    //     console.log('User Deleted.')
    //   })
    //   .catch(function (error) {
    //     console.log('Request failed', error);
    //   });
    return 'denied';
  }
  })
  }
}
</script>
