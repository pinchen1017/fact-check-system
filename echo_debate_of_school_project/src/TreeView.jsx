function TreeNode({ node }){
  if (!node) return null

  const hasChildren = Array.isArray(node.children) && node.children.length > 0

  return (
    <div className={`tree-node ${node.isRoot ? 'root-node' : ''}`}>
      <div className="node-header">{node.title || '節點'}</div>
      {node.content ? (
        <div className="node-body">{node.content}</div>
      ) : null}
      {hasChildren ? (
        <div className="tree-branches">
          {node.children.map((child, idx) => (
            <div className="tree-branch" key={idx}>
              <div className="branch-connector"></div>
              <TreeNode node={child} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function TreeView({ data }){
  if (!data) return null

  // Accept either an explicit tree or build a minimal one from provided fields
  const tree = data.detailTree || {
    title: data.title || '分析總覽',
    content: data.perspective || undefined,
    isRoot: true,
    children: [
      typeof data.correctness === 'number' ? {
        title: '正確性',
        content: `${data.correctness}%`,
      } : null,
      typeof data.truthfulness === 'number' ? {
        title: '真實性分數',
        content: `${data.truthfulness}%`,
      } : null,
    ].filter(Boolean),
  }

  // Ensure root flag
  tree.isRoot = true

  return (
    <div className="analysis-tree">
      <div className="tree-root">
        <TreeNode node={tree} />
      </div>
    </div>
  )
}

export default TreeView


