export default class TreeVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.treeRoot = null;
        this.expandedNodes = new Set();
    }

    clear() {
        this.container.innerHTML = '';
    }

    reset() {
        this.clear();
        this.treeRoot = null;
        this.expandedNodes.clear();
    }

    render(treeRoot, scrollToRoot = false) {
        this.treeRoot = treeRoot;
        this.clear();
        if (!this.treeRoot) return;

        // If it's a new search tree, clear previous expansions and follow the best path
        if (scrollToRoot) {
            this.expandedNodes.clear();
            this.expandBestPath(this.treeRoot);
        } else if (this.expandedNodes.size === 0) {
            this.expandedNodes.add(this.getNodeId(this.treeRoot));
        }

        const treeContainer = document.createElement('div');
        treeContainer.className = 'tree-container-inner';
        this.renderNode(this.treeRoot, treeContainer);
        this.container.appendChild(treeContainer);

        // Center the scroll position
        if (scrollToRoot) {
            setTimeout(() => {
                // Find the best move node at Depth 1 if it exists
                const bestMoveNode = treeContainer.querySelector('.tree-node.best-path[data-depth="1"]');
                const targetNode = bestMoveNode || treeContainer.querySelector('.tree-node');

                if (targetNode) {
                    const containerRect = this.container.getBoundingClientRect();
                    const nodeRect = targetNode.getBoundingClientRect();
                    const currentScrollLeft = this.container.scrollLeft;
                    
                    // Calculate target scroll to center the node
                    const targetScrollLeft = currentScrollLeft + (nodeRect.left - containerRect.left) - (containerRect.width / 2) + (nodeRect.width / 2);
                    this.container.scrollTo({
                        left: targetScrollLeft,
                        behavior: 'smooth'
                    });
                }
            }, 100); // Slightly longer delay to ensure layout is stable
        }
    }

    expandBestPath(node) {
        if (!node) return;
        this.expandedNodes.add(this.getNodeId(node));
        if (node.children) {
            const bestChild = node.children.find(c => c.isBest);
            if (bestChild) {
                this.expandBestPath(bestChild);
            }
        }
    }

    getNodeId(node) {
        // Create a unique ID based on move history/depth and board state
        // We use board state string to ensure uniqueness even if multiple nodes have same depth/move
        // (though in minimax tree, depth+move sequence is enough, but board is safer)
        const boardStr = node.board.join('');
        return `${node.depth}-${node.move}-${boardStr}`;
    }

    renderNode(node, parentElement, isOnBestPath = true) {
        const nodeId = this.getNodeId(node);
        const isExpanded = this.expandedNodes.has(nodeId);
        const hasChildren = node.children && node.children.length > 0;

        // Container for this node and its children
        const nodeAndChildren = document.createElement('div');
        nodeAndChildren.className = 'tree-node-wrapper';

        // Add depth tag if it's the first node at this level
        if (!parentElement.querySelector(`.depth-tag[data-depth="${node.depth}"]`)) {
            const depthTag = document.createElement('div');
            depthTag.className = 'depth-tag';
            depthTag.setAttribute('data-depth', node.depth);
            depthTag.innerText = `Depth ${node.depth}`;
            nodeAndChildren.appendChild(depthTag);
        }

        const nodeEl = document.createElement('div');
        nodeEl.className = `tree-node ${hasChildren ? 'expandable' : ''} ${isExpanded ? 'expanded' : 'collapsed'}`;
        if (isOnBestPath) {
            nodeEl.classList.add('best-path');
        }
        nodeEl.setAttribute('data-depth', node.depth);
        
        // Add click handler for expansion
        if (hasChildren) {
            nodeEl.onclick = (e) => {
                e.stopPropagation();
                if (isExpanded) {
                    this.expandedNodes.delete(nodeId);
                } else {
                    // Collapse other nodes at the same depth (siblings)
                    // We also collapse any nodes that are deeper than this level 
                    // to keep the view clean as requested.
                    for (let id of this.expandedNodes) {
                        const depth = parseInt(id.split('-')[0]);
                        if (depth >= node.depth) {
                            this.expandedNodes.delete(id);
                        }
                    }
                    this.expandedNodes.add(nodeId);
                }
                this.render(this.treeRoot);
            };
        }

        // Add mini board
        const boardEl = document.createElement('div');
        boardEl.className = 'mini-board';
        node.board.forEach((cell, i) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'mini-cell';
            if (typeof cell !== 'number') {
                cellEl.innerText = cell;
                cellEl.classList.add(cell === 'X' ? 'x-cell' : 'o-cell');
            }
            boardEl.appendChild(cellEl);
        });
        nodeEl.appendChild(boardEl);

        // Add info
        const infoEl = document.createElement('div');
        infoEl.className = 'node-info';
        const scoreStr = node.score === null ? '?' : node.score;
        infoEl.innerHTML = `<div>Score: ${scoreStr}</div><div>Move: ${node.move !== null ? node.move : 'Start'}</div>`;
        if (hasChildren) {
            const indicator = document.createElement('div');
            indicator.className = 'expand-indicator';
            indicator.innerText = isExpanded ? '[-] Click to collapse' : '[+] Click to expand';
            infoEl.appendChild(indicator);
        }
        nodeEl.appendChild(infoEl);
        nodeAndChildren.appendChild(nodeEl);
        parentElement.appendChild(nodeAndChildren);

        if (hasChildren && isExpanded) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            node.children.forEach(child => {
                this.renderNode(child, childrenContainer, isOnBestPath && child.isBest);
            });
            nodeAndChildren.appendChild(childrenContainer);
        }
    }
}
