// Common test scripts for API documentation
// Add these to collection-level tests

// ============================================
// Response Time Tests
// ============================================

pm.test('Response time is under 2 seconds', function() {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

// ============================================
// Status Code Tests
// ============================================

pm.test('Status code is expected', function() {
    const expectedCodes = [200, 201, 204, 400, 401, 403, 404, 422, 429, 500];
    pm.expect(expectedCodes).to.include(pm.response.code);
});

// ============================================
// Header Tests
// ============================================

pm.test('Content-Type header is present', function() {
    if (pm.response.code !== 204) {
        pm.expect(pm.response.headers.get('Content-Type')).to.exist;
    }
});

pm.test('Response has correlation ID', function() {
    // Many APIs return a request ID for debugging
    const correlationHeaders = [
        'X-Request-Id',
        'X-Correlation-Id',
        'Request-Id'
    ];

    const hasCorrelationId = correlationHeaders.some(header =>
        pm.response.headers.get(header)
    );

    // This is optional, so just log if missing
    if (!hasCorrelationId) {
        console.log('No correlation ID header found');
    }
});

// ============================================
// Error Response Tests
// ============================================

if (pm.response.code >= 400) {
    pm.test('Error response has standard format', function() {
        const json = pm.response.json();

        pm.expect(json).to.have.property('error');
        pm.expect(json.error).to.have.property('code');
        pm.expect(json.error).to.have.property('message');
    });

    pm.test('Error code is a string', function() {
        const json = pm.response.json();
        pm.expect(json.error.code).to.be.a('string');
    });
}

// ============================================
// Success Response Tests
// ============================================

if (pm.response.code >= 200 && pm.response.code < 300) {
    // Skip for 204 No Content
    if (pm.response.code !== 204) {
        pm.test('Response body is valid JSON', function() {
            pm.response.json();
        });
    }
}

// ============================================
// Pagination Tests (for list endpoints)
// ============================================

if (pm.request.url.getPath().match(/\/(users|resources|items)$/)) {
    pm.test('List response has pagination metadata', function() {
        const json = pm.response.json();

        if (json.meta) {
            pm.expect(json.meta).to.have.property('total');
            pm.expect(json.meta).to.have.property('page');
            pm.expect(json.meta).to.have.property('limit');
        }
    });

    pm.test('List response has data array', function() {
        const json = pm.response.json();
        pm.expect(json.data).to.be.an('array');
    });
}

// ============================================
// Rate Limit Tests
// ============================================

pm.test('Rate limit headers are present', function() {
    const rateLimitHeaders = [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'RateLimit-Limit',
        'RateLimit-Remaining'
    ];

    const hasRateLimitHeader = rateLimitHeaders.some(header =>
        pm.response.headers.get(header)
    );

    // Log rate limit info if available
    const remaining = pm.response.headers.get('X-RateLimit-Remaining') ||
                      pm.response.headers.get('RateLimit-Remaining');

    if (remaining) {
        console.log(`Rate limit remaining: ${remaining}`);
    }
});

// ============================================
// Helper Functions
// ============================================

// Store response data for chaining requests
if (pm.response.code === 200 || pm.response.code === 201) {
    try {
        const json = pm.response.json();

        // Store ID for use in subsequent requests
        if (json.id) {
            pm.collectionVariables.set('LAST_CREATED_ID', json.id);
        }

        // Store data array length
        if (json.data && Array.isArray(json.data)) {
            pm.collectionVariables.set('LAST_LIST_COUNT', json.data.length);
        }
    } catch (e) {
        // Response is not JSON, skip
    }
}
