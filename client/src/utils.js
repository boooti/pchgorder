// Shared helper utilities for Drink Order App

export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN').format(amount || 0);
}

/**
 * Checks whether an employee has relationship / eligibility for an order session.
 * 
 * Criteria:
 * 1. scope_type === 'ALL' (or empty/null) -> Company-wide (public)
 * 2. Group creator (created_by_employee_id === currentUser.id)
 * 3. Group sponsor (sponsor_type === 'SPONSOR' and sponsor_name matches currentUser.name)
 * 4. Department scope (scope_type === 'DEPARTMENT' and currentUser.department in eligible_departments)
 * 5. Custom employee list (scope_type === 'CUSTOM' and currentUser.id in eligible_employee_ids)
 */
export function checkIsEligible(sess, user) {
  if (!sess) return false;
  const scopeType = sess.scope_type || 'ALL';
  if (scopeType === 'ALL') return true;
  if (!user) return false;

  // 1. Group Creator / Host
  if (sess.created_by_employee_id && sess.created_by_employee_id === user.id) {
    return true;
  }

  // 2. Sponsor
  if (sess.sponsor_type === 'SPONSOR' && sess.sponsor_name && user.name) {
    const spName = sess.sponsor_name.toLowerCase().trim();
    const empName = user.name.toLowerCase().trim();
    if (spName === empName || spName.includes(empName) || empName.includes(spName)) {
      return true;
    }
  }

  // 3. Department Scope
  if (scopeType === 'DEPARTMENT' && sess.eligible_departments) {
    try {
      const depts = typeof sess.eligible_departments === 'string'
        ? JSON.parse(sess.eligible_departments)
        : sess.eligible_departments;
      if (Array.isArray(depts) && user.department && depts.includes(user.department)) {
        return true;
      }
    } catch (e) {}
  }

  // 4. Custom Employee Scope
  if (scopeType === 'CUSTOM' && sess.eligible_employee_ids) {
    try {
      const ids = typeof sess.eligible_employee_ids === 'string'
        ? JSON.parse(sess.eligible_employee_ids)
        : sess.eligible_employee_ids;
      if (Array.isArray(ids) && ids.includes(user.id)) {
        return true;
      }
    } catch (e) {}
  }

  return false;
}

/**
 * Sorts an array of employee objects alphabetically by Vietnamese First Name (Tên).
 */
export function sortVietnameseByFirstName(list) {
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
