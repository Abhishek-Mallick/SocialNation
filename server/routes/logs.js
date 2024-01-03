import express from 'express';
import moment from 'moment';
import winston from 'winston';

const logs = [];
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'DD/MM/YYYY HH:mm:ss'
    }),
    winston.format.colorize(),
    winston.format.printf(info => `${info.timestamp} - ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console()
  ]
});

const router = express.Router();

router.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} ${res.statusCode}`);
  logs.push({
    timestamp: moment().format('DD/MM/YYYY HH:mm:ss'),
    method: req.method,
    path: req.path,
    status: res.statusCode
  });
  next();
});

router.get('/', (req, res) => {
  const htmlTable = `
    <html>
      <head>
        <title>Server Logs</title>
        <style>
          /* Styles */
        </style>
      </head>
      <body>
        <h2>Server Logs</h2>
        <table>
          <tr>
            <th>Timestamp</th>
            <th>Method</th>
            <th>Path</th>
            <th>Status</th>
          </tr>
          ${logs.map(log => `
            <tr>
              <td>${log.timestamp}</td>
              <td>${log.method}</td>
              <td>${log.path}</td>
              <td>${log.status}</td>
            </tr>
          `).join('')}
        </table>
      </body>
    </html>
  `;

  res.send(htmlTable);
});

export { router, logs };
