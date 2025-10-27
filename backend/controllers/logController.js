// backend/controllers/logController.js
const fs = require('fs');
const path = require('path');
const Log = require('../models/Log');

// Import all parsers and log type detector
const { detectLogType } = require('../utils/detectLogType');
const { getParserForLine } = require('../parser');

exports.uploadLog = async (req, res) => {
  try {
    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', req.file.filename);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');

    const allParsedLogs = [];

    for (const line of lines) {
      const parser = getParserForLine(line);
      if (!parser) continue;
      let parsed = [];
      try {
        parsed = parser.parse(line);
      } catch (err) {
        console.warn(`⚠️ Skipped line due to error: ${err.message}`);
        continue;
      }
      if (Array.isArray(parsed)) {
        allParsedLogs.push(...parsed);
      } else if (parsed) {
        allParsedLogs.push(parsed);
      }
    }

    console.log(`✅ Total parsed logs: ${allParsedLogs.length}`);

    if (allParsedLogs.length === 0) {
      return res.status(400).json({ error: 'No valid log lines parsed' });
    }

    await Log.deleteMany({});
    await Log.insertMany(allParsedLogs);
    fs.unlinkSync(filePath);

    return res.json({ message: 'Logs parsed and saved', count: allParsedLogs.length });
  } catch (err) {
    console.error('🔥 Error in uploadLog:', err.message);
    return res.status(500).json({ error: 'Error parsing log file' });
  }
};

exports.getLogs = async (req, res) => {
  try {
    const { 
      level, 
      search, 
      source, 
      method, 
      status, 
      fromDate, 
      toDate, 
      ip,
      page = 1, 
      limit = 50 
    } = req.query;
    
    const filter = {};

    // Build comprehensive filter
    if (level) filter.level = level.toUpperCase();
    if (search) filter.message = { $regex: search, $options: 'i' };
    if (source) filter.source = source;
    if (method) filter.method = method.toUpperCase();
    if (status) filter.status = parseInt(status);
    if (ip) filter.ip = { $regex: ip, $options: 'i' };

    // Date range filtering
    if (fromDate || toDate) {
      filter.timestamp = {};
      if (fromDate) filter.timestamp.$gte = new Date(fromDate);
      if (toDate) filter.timestamp.$lte = new Date(toDate);
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination info
    const totalCount = await Log.countDocuments(filter);
    
    // Use aggregation pipeline for better performance with large datasets
    const logs = await Log.aggregate([
      { $match: filter },
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]).allowDiskUse(true);

    res.json({
      logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        limit: parseInt(limit),
        hasNext: skip + logs.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error('🔥 Error in getLogs:', err.message);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

exports.getLogStats = async (req, res) => {
  try {
    const totalLogs = await Log.countDocuments();
    const errorLogs = await Log.countDocuments({ level: 'ERROR' });
    const infoLogs = await Log.countDocuments({ level: 'INFO' });
    
    // Get log count by source
    const sourceStats = await Log.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      total: totalLogs,
      errors: errorLogs,
      info: infoLogs,
      sources: sourceStats
    });
  } catch (err) {
    console.error('🔥 Error in getLogStats:', err.message);
    res.status(500).json({ error: 'Failed to fetch log statistics' });
  }
};
