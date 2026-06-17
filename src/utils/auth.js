export const getAuthToken = () => localStorage.getItem("token");

export function getRolesFromToken() {
  try {
    const token = getAuthToken();
    if (!token) return [];
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Array.isArray(payload.roles) ? payload.roles : [];
  } catch {
    return [];
  }
}

export function mergeUserRoles(user) {
  if (!user) return null;
  const apiRoles = Array.isArray(user.roles) ? user.roles : [];
  const roles = [...new Set([...apiRoles, ...getRolesFromToken()])];
  return { ...user, roles };
}

export function userHasRole(user, role) {
  if (user?.roles?.includes(role)) return true;
  return getRolesFromToken().includes(role);
}

export function userIsAdmin(user) {
  return userHasRole(user, "ROLE_ADMIN");
}

export function userIsOrganizer(user) {
  return userHasRole(user, "ROLE_ORGANISATEUR");
}

/** Utilisateur renvoyé par /api/me ou /api/auth/home. */
export function normalizeSessionUser(meRes, homeRes) {
  const raw =
    homeRes?.data?.user ||
    meRes?.data?.user ||
    meRes?.data?.data ||
    null;
  return mergeUserRoles(raw);
}
