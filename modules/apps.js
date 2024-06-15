export function displayApps(apps) {
  const list = document.getElementById('appsList');
  /* apps.forEach(function(app) {
    if (app.type === 'packaged_app' || app.type === 'hosted_app') {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = app.appLaunchUrl || app.homepageUrl;
      a.textContent = app.name;
      li.appendChild(a);
      list.appendChild(li);
    }
  }); */
}
