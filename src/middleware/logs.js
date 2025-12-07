const logRequest = (req, res, next) => {
  const waktu = new Date().toLocaleString("id-ID");
  const method = req.method.padEnd(6, " ");
  const endpoint = req.originalUrl;

  console.log(`\n==============================`);
  console.log(`[REQUEST] ${waktu}`);
  console.log(`Method    : ${method}`);
  console.log(`Endpoint  : ${endpoint}`);

  // Log body untuk request selain GET
  if (req.method !== "GET") {
    console.log(`Body      :`, req.body);
  }

  const start = Date.now();

  // Log status response setelah selesai
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`Status    : ${res.statusCode}`);
    console.log(`Time      : ${duration} ms`);
    console.log(`==============================\n`);
  });

  next();
};

export default logRequest; // ES Module export
