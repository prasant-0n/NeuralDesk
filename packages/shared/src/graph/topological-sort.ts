/**
 * NeuralDesk Pure Graph Engine
 * Implements Kahn's Topological Sorting Algorithm with cycle detection and cycle path isolation.
 */

export interface GraphValidationResult {
  isValid: boolean;
  sortedOrder?: string[];
  cyclePath?: string[];
  error?: string;
}

export interface SimpleEdge {
  source: string;
  target: string;
}

/**
 * Validates graph connectivity and computes execution topological order using Kahn's algorithm.
 * Guarantees Directed Acyclic Graph (DAG) invariant.
 */
export function topologicalSortKahn(
  nodeKeys: string[],
  edges: SimpleEdge[]
): GraphValidationResult {
  const inDegree: Map<string, number> = new Map();
  const adjacencyList: Map<string, string[]> = new Map();

  // Initialize graph data structures
  for (const node of nodeKeys) {
    inDegree.set(node, 0);
    adjacencyList.set(node, []);
  }

  // Populate edges and calculate in-degrees
  for (const edge of edges) {
    if (!inDegree.has(edge.source) || !inDegree.has(edge.target)) {
      return {
        isValid: false,
        error: `Edge references non-existent node: ${edge.source} -> ${edge.target}`,
      };
    }
    adjacencyList.get(edge.source)!.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Enqueue nodes with zero in-degree (root trigger nodes)
  const queue: string[] = [];
  for (const [node, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  const sortedOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedOrder.push(current);

    const neighbors = adjacencyList.get(current) ?? [];
    for (const neighbor of neighbors) {
      const updatedDegree = (inDegree.get(neighbor) ?? 1) - 1;
      inDegree.set(neighbor, updatedDegree);
      if (updatedDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  // If sorted count matches total nodes, graph is acyclic
  if (sortedOrder.length === nodeKeys.length) {
    return {
      isValid: true,
      sortedOrder,
    };
  }

  // Cycle detected: isolate cyclic subgraph
  const cycleNodes = nodeKeys.filter((n) => !sortedOrder.includes(n));
  return {
    isValid: false,
    error: `Graph contains a directed cycle involving nodes: [${cycleNodes.join(", ")}]`,
    cyclePath: cycleNodes,
  };
}
