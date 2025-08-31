function handler(event) {
    var request = event.request;
    var uri = request.uri;
    var incomingHost = request.headers['host'] ? request.headers['host'].value : '';
    var desiredDomain = '%%DESIRED_DOMAIN%%';

    // Helper to generate a 301 redirect
    function redirect(newUri) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: {
                "location": { "value": 'https://' + desiredDomain + newUri }
            }
        };
    }

    // If host is wrong, redirect to the correct domain
    if (incomingHost !== desiredDomain) {
        return redirect(uri);
    }

    // If URI ends with '/index.html', redirect to clean '/'
    if (uri.endsWith('/index.html')) {
        return redirect(uri.slice(0, -10)); // Remove 'index.html'
    }

    // If URI looks like a folder but missing trailing slash
    if (!uri.includes('.') && !uri.endsWith('/')) {
        return redirect(uri + '/');
    }

    // Rewrite for backend: append 'index.html' if uri ends with '/'
    if (uri.endsWith('/')) {
        request.uri += 'index.html';
    }

    return request;
}