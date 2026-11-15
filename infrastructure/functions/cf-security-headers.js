function handler(event) {
    var headers = event.response.headers;

    headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubDomains' };
    headers['content-security-policy'] = { value: "frame-ancestors 'none'" };
    headers['x-frame-options'] = { value: 'DENY' };
    headers['permissions-policy'] = { value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' };
    headers['x-xss-protection'] = { value: '0' };
    delete headers['server'];
    delete headers['x-amz-server-side-encryption'];

    return event.response;
}
