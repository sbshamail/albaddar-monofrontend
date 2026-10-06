// Local-list patch helpers — apply a create/update/delete response directly
// to in-memory table state instead of a full router.refresh() refetch.

/** Replace the item with a matching id, or append if it's new. */
export function upsertById<T extends { id: number }>(
  list: T[],
  item: T,
): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const next = [...list];
  next[idx] = item;
  return next;
}

export function removeById<T extends { id: number }>(
  list: T[],
  id: number,
): T[] {
  return list.filter((x) => x.id !== id);
}

interface TreeNode {
  id: number;
  parent_id: number | null;
  children: this[];
}

function findNode<T extends TreeNode>(tree: T[], id: number): T | undefined {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findNode(node.children as T[], id);
    if (found) return found;
  }
  return undefined;
}

export function removeTreeNode<T extends TreeNode>(
  tree: T[],
  id: number,
): T[] {
  return tree
    .filter((node) => node.id !== id)
    .map((node) =>
      node.children.length
        ? { ...node, children: removeTreeNode(node.children as T[], id) }
        : node,
    );
}

function insertUnderParent<T extends TreeNode>(
  tree: T[],
  parentId: number,
  node: T,
): T[] {
  return tree.map((n) => {
    if (n.id === parentId) return { ...n, children: [...n.children, node] };
    if (n.children.length)
      return {
        ...n,
        children: insertUnderParent(n.children as T[], parentId, node),
      };
    return n;
  });
}

/**
 * Insert or update a node in a category-style tree, keyed by `parent_id`.
 * Preserves the node's existing `children` (a create/update response never
 * carries them) and re-parents it if `parent_id` changed.
 */
export function upsertTreeNode<T extends TreeNode>(tree: T[], node: T): T[] {
  const existing = findNode(tree, node.id);
  const fullNode: T = { ...node, children: existing?.children ?? [] };
  const withoutNode = removeTreeNode(tree, node.id);

  return node.parent_id == null
    ? [...withoutNode, fullNode]
    : insertUnderParent(withoutNode, node.parent_id, fullNode);
}
