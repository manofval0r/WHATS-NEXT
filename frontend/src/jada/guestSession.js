const GUEST_SESSION_KEY = 'jada_guest_session';

export function getGuestSessionId() {
  return sessionStorage.getItem(GUEST_SESSION_KEY);
}

export function getOrCreateGuestSessionId() {
  let sid = sessionStorage.getItem(GUEST_SESSION_KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(GUEST_SESSION_KEY, sid);
  }
  return sid;
}

export function clearGuestSessionId() {
  sessionStorage.removeItem(GUEST_SESSION_KEY);
}
