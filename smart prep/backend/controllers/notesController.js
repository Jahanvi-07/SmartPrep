const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Note = require('../models/Note');

/**
 * Cleans extracted text by normalizing whitespace and removing control chars.
 */
const cleanText = (raw) => {
  return raw
    .replace(/\r\n/g, '\n')        // Normalize line endings
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '') // Strip control chars
    .replace(/\n{3,}/g, '\n\n')    // Collapse excessive newlines
    .trim();
};

/**
 * Extract text from uploaded file based on extension.
 */
const extractText = async (filePath, originalName) => {
  const ext = path.extname(originalName).toLowerCase();

  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }

  if (ext === '.docx') {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  if (ext === '.txt') {
    return fs.readFileSync(filePath, 'utf-8');
  }

  throw new Error(`Unsupported file type: ${ext}`);
};

// @desc    Upload and process a note file
// @route   POST /api/notes/upload
// @access  Private
const uploadNote = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { file } = req;
    const allowedExts = ['.pdf', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExts.includes(ext)) {
      // Clean up uploaded file
      fs.unlinkSync(file.path);
      return res.status(400).json({
        message: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.',
      });
    }

    // Extract text from the file
    const rawText = await extractText(file.path, file.originalname);
    const content = cleanText(rawText);

    if (!content || content.length === 0) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ message: 'Could not extract any text from the file.' });
    }

    // Create note in DB
    const note = await Note.create({
      userId: req.user._id,
      fileName: file.originalname,
      content,
    });

    // Clean up temp file after processing
    fs.unlinkSync(file.path);

    res.status(201).json({
      _id: note._id,
      fileName: note.fileName,
      content: note.content,
      createdAt: note.createdAt,
    });
  } catch (error) {
    // Ensure temp file cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('Upload error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to process file' });
  }
};

// @desc    Get all notes for the logged-in user
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('fileName content createdAt');

    res.json(notes);
  } catch (error) {
    console.error('Get notes error:', error.message);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
};

// @desc    Get a single note by ID
// @route   GET /api/notes/:id
// @access  Private
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Get note error:', error.message);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error.message);
    res.status(500).json({ message: 'Failed to delete note' });
  }
};

module.exports = { uploadNote, getNotes, getNoteById, deleteNote };
