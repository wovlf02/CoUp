export const successResponse = (data, message = 'Success', status = 200) => {
  return new Response(JSON.stringify({ success: true, message, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const errorResponse = (message = 'An error occurred', status = 500, errors = null) => {
  return new Response(JSON.stringify({ success: false, message, errors }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
