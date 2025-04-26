import { HttpInterceptorFn } from '@angular/common/http';

export const contentTypeInterceptor: HttpInterceptorFn = (req, next) => {
  // Define the exempted route
  const exemptedRoute = '/api/v1/uploads';

  // Check if the method is POST, PUT, or PATCH and Content-Type is not already set
  const shouldSetContentType =
    ['POST', 'PUT', 'PATCH'].includes(req.method) &&
    !req.headers.has('Content-Type') &&
    !req.url.includes(exemptedRoute); // Exempt specific route

  // Update headers conditionally
  const headers = shouldSetContentType
    ? req.headers.set('Content-Type', 'application/json')
    : req.headers;

  // Clone the request with updated headers
  const clonedRequest = req.clone({ headers });

  // Pass the cloned request to the next handler
  return next(clonedRequest);
};
