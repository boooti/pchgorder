import db from '../server/db.js';

db.exec(`UPDATE daily_order_sessions SET sponsor_mode = 'SPONSOR_100', sponsor_name = 'Sếp bao 100%' WHERE status = 'OPEN'`);
console.log('Successfully updated active session to SPONSOR_100');
