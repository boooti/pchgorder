/**
 * Utility module to check employee eligibility and relationship to order sessions.
 * 
 * An employee is considered related to and eligible for a session if ANY of these criteria are met:
 * 1. Session scope is 'ALL' (or empty/null) - Company-wide session, open to everyone.
 * 2. The employee is the creator / host of the session (session.created_by_employee_id === employee.id).
 * 3. The employee is the sponsor:
 *    - session.sponsor_type === 'SPONSOR' and session.sponsor_name matches employee.name.
 * 4. Session scope is 'DEPARTMENT':
 *    - The employee's department is included in session.eligible_departments.
 * 5. Session scope is 'CUSTOM':
 *    - The employee's id is included in session.eligible_employee_ids.
 * 
 * If none of the above are true, the employee has no relation to the group session,
 * cannot view it in the active sessions list, and cannot place orders in it.
 */

function isEmployeeEligibleForSession(session, employee) {
  if (!session) return false;

  // 1. Company-wide session
  const scopeType = session.scope_type || 'ALL';
  if (scopeType === 'ALL') {
    return true;
  }

  // Group session requires a valid identified employee
  if (!employee) {
    return false;
  }

  // 2. The creator / host of the group is ALWAYS eligible
  if (session.created_by_employee_id && session.created_by_employee_id === employee.id) {
    return true;
  }

  // 3. The sponsor of the session is ALWAYS eligible
  if (session.sponsor_type === 'SPONSOR' && session.sponsor_name && employee.name) {
    const spName = session.sponsor_name.toLowerCase().trim();
    const empName = employee.name.toLowerCase().trim();
    if (spName === empName || spName.includes(empName) || empName.includes(spName)) {
      return true;
    }
  }

  // 4. Department-based scope
  if (scopeType === 'DEPARTMENT' && session.eligible_departments) {
    try {
      const depts = typeof session.eligible_departments === 'string'
        ? JSON.parse(session.eligible_departments)
        : session.eligible_departments;
      if (Array.isArray(depts) && employee.department && depts.includes(employee.department)) {
        return true;
      }
    } catch (e) {
      console.error('Error parsing session eligible_departments:', e);
    }
  }

  // 5. Custom employee IDs scope
  if (scopeType === 'CUSTOM' && session.eligible_employee_ids) {
    try {
      const empIds = typeof session.eligible_employee_ids === 'string'
        ? JSON.parse(session.eligible_employee_ids)
        : session.eligible_employee_ids;
      if (Array.isArray(empIds) && empIds.includes(employee.id)) {
        return true;
      }
    } catch (e) {
      console.error('Error parsing session eligible_employee_ids:', e);
    }
  }

  return false;
}

const crypto = require('crypto');

function hashPassword(password) {
  if (!password) return null;
  return crypto.createHash('sha256').update(String(password).trim()).digest('hex');
}

function verifyPassword(inputPassword, storedHash) {
  if (!storedHash) return true; // No password required
  if (!inputPassword) return false;
  return hashPassword(inputPassword) === storedHash;
}

/**
 * Sorts an array of objects having a `name` property alphabetically by Vietnamese FIRST NAME (Tên).
 * If first names are identical (e.g. Dư Văn Đạt vs Hưng Tấn Đạt), falls back to comparing the full name.
 */
function sortVietnameseByFirstName(list) {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const partsA = (a.name || '').trim().split(/\s+/);
    const partsB = (b.name || '').trim().split(/\s+/);
    const firstNameA = partsA[partsA.length - 1] || '';
    const firstNameB = partsB[partsB.length - 1] || '';
    const cmp = firstNameA.localeCompare(firstNameB, 'vi', { sensitivity: 'base' });
    if (cmp !== 0) return cmp;
    return (a.name || '').localeCompare(b.name || '', 'vi');
  });
}

module.exports = {
  isEmployeeEligibleForSession,
  hashPassword,
  verifyPassword,
  sortVietnameseByFirstName
};
