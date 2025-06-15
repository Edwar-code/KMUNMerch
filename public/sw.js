self.addEventListener('push', function (event) {
  if (event.data) {
    let data;
    try {
      data = event.data.json();
    } catch (e) {
      // If JSON parsing fails, use text data instead
      const text = event.data.text();
      data = {
        title: 'Notification',
        body: text
      };
    }
    
    const options = {
      body: data.body,
      icon: data.icon || '/logo.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})
 
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')
  event.notification.close()
  event.waitUntil(clients.openWindow('https://avenuefashion.co.ke'))
})