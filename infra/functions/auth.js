function btoa(input) {
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    input = String(input);
    var bitmap, a, b, c,
        result = "", i = 0,
        rest = input.length % 3;

    for (; i < input.length;) {
        if ((a = input.charCodeAt(i++)) > 255
                || (b = input.charCodeAt(i++)) > 255
                || (c = input.charCodeAt(i++)) > 255)
            throw new TypeError("Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range.");

        bitmap = (a << 16) | (b << 8) | c;
        result += b64.charAt(bitmap >> 18 & 63) + b64.charAt(bitmap >> 12 & 63)
                + b64.charAt(bitmap >> 6 & 63) + b64.charAt(bitmap & 63);
    }

    return rest ? result.slice(0, rest - 3) + "===".substring(rest) : result;
}


function handler(event) {
    var authHeaders = event.request.headers.authorization;
  
    // The Base64-encoded Auth string that should be present.
    // It is an encoding of `Basic base64([username]:[password])`
    // The username and password are:
    var username = 'user';
    var password = 'pass';

    var expected = 'Basic ' + btoa(`${username}:${password}`);
  
    // If an Authorization header is supplied and it's an exact match, pass the
    // request on through to CloudFront/the origin without any modification.
    if (authHeaders && authHeaders.value === expected) {
      return event.request;
    }
  
    // But if we get here, we must either be missing the auth header or the
    // credentials failed to match what we expected.
    // Request the browser present the Basic Auth dialog.
    var response = {
      statusCode: 401,
      statusDescription: "Unauthorized",
      headers: {
        "www-authenticate": {
          value: 'Basic realm="Enter your credentials"',
        },
      },
    };
  
    return response;
  }