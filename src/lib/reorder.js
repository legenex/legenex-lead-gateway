// Shared ordering helpers for reorderable lists.
// Sort by manual sort_order first; ties break by creation date ascending
// (oldest first, newest last). New items are appended with nextSortOrder().
export function sortByOrder(items) {
  return [...items].sort((a, b) => {
    const sa = a.sort_order || 0;
    const sb = b.sort_order || 0;
    if (sa !== sb) return sa - sb;
    return new Date(a.created_date || 0) - new Date(b.created_date || 0);
  });
}

export function nextSortOrder(items) {
  return items.reduce((m, c) => Math.max(m, c.sort_order || 0), 0) + 1;
}