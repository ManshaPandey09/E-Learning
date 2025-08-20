app.post("/upload", upload.single("file"), (req, res) => {
  const subject = req.body.subject;
  const filename = req.file.originalname; // real file name
  const filepath = req.file.path;

  db.query(
    "INSERT INTO pdfs (subject, name, filePath) VALUES (?, ?, ?)",
    [subject, filename, filepath],
    (err, result) => {
      if (err) throw err;
      res.json({ id: result.insertId, subject, name: filename, filePath: filepath });
    }
  );
});
