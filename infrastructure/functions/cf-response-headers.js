function handler(event) {
    var response = event.response;
    var headers = response.headers;
    var uri = event.request.uri;

    headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubDomains' };
    headers['content-security-policy'] = { value: "frame-ancestors 'none'" };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['permissions-policy'] = { value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' };
    headers['x-xss-protection'] = { value: '0' };
    delete headers['server'];
    delete headers['x-amz-server-side-encryption'];

    var cacheControl = 'public, max-age=86400';
    if (response.statusCode >= 400) {
        cacheControl = 'no-cache';
    } else if (/\.[0-9a-f]{20,}\.|_hu_?[0-9a-f]{8,}\./.test(uri)) {
        cacheControl = 'public, max-age=31536000, immutable';
    } else if (uri.endsWith('.html')) {
        cacheControl = 'public, max-age=0, must-revalidate';
    }
    headers['cache-control'] = { value: cacheControl };

    return response;
}
