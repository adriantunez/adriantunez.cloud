// CloudFront viewer-request function. Placeholders are filled in by CDK.
// - Production: redirects other hosts (www) to the main domain.
// - Previews: pr<N>.<preview domain> is served from /<prefix>/pr<N>/ in the bucket.
// - Both: clean URLs (no index.html, trailing slash on folders).
function handler(event) {
    var request = event.request;
    var uri = request.uri;
    var host = request.headers.host ? request.headers.host.value : '';
    var mainDomain = '%%MAIN_DOMAIN%%';
    var previewSuffix = '.%%PREVIEW_DOMAIN%%';
    var prefix = '';

    function redirect(location) {
        return {
            statusCode: 301,
            statusDescription: 'Moved Permanently',
            headers: { location: { value: location } }
        };
    }

    if (host.endsWith(previewSuffix)) {
        var label = host.slice(0, -previewSuffix.length);
        if (!/^pr\d+$/.test(label)) {
            return redirect('https://' + mainDomain + uri);
        }
        prefix = '/%%PREVIEW_PREFIX%%/' + label;
    } else if (host !== mainDomain) {
        return redirect('https://' + mainDomain + uri);
    }

    if (uri.endsWith('/index.html')) {
        return redirect('https://' + host + uri.slice(0, -10));
    }
    if (!uri.includes('.') && !uri.endsWith('/')) {
        return redirect('https://' + host + uri + '/');
    }
    if (uri.endsWith('/')) {
        uri += 'index.html';
    }

    request.uri = prefix + uri;
    return request;
}
