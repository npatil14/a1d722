import type { Form, GraphNode, GraphEdge, Field, NodeData } from '../types';

export const getFormById = (formId: string, allForms: Form[]): Form | undefined => {
    return allForms.find(f => f.id === formId);
};

export const getNodeByComponentId = (componentId: string, nodes: GraphNode[]): GraphNode | undefined => {
    return nodes.find(n => n.data.component_id === componentId);
};

export const getNodeByComponentKey = (componentKey: string, nodes: GraphNode[]): GraphNode | undefined => {


    return nodes.find(n => n.id === componentKey);
};

// Get direct parent nodes (prerequisites), ensuring uniqueness of returned nodes
export const getDirectDependencies = (
    formNodeId: string,
    nodes: GraphNode[],
    _edges: GraphEdge[]
): GraphNode[] => {
    const node = nodes.find(n => n.id === formNodeId);
    if (!node || !node.data.prerequisites || node.data.prerequisites.length === 0) {
        return [];
    }

    const dependentNodesMap = new Map<string, GraphNode>();
    node.data.prerequisites.forEach(prereqNodeId => {

        const depNode = nodes.find(n => n.id === prereqNodeId);
        if (depNode) {

            if (!dependentNodesMap.has(depNode.id)) {
                dependentNodesMap.set(depNode.id, depNode);
            }
        } else {
            console.warn(`Prerequisite node with id ${prereqNodeId} not found.`);
        }
    });
    return Array.from(dependentNodesMap.values());
};

// Get all transitive parent nodes
export const getTransitiveDependencies = (
    formNodeId: string,
    nodes: GraphNode[],
    edges: GraphEdge[]
): GraphNode[] => {
    const allDeps = new Map<string, GraphNode>();
    const queue: GraphNode[] = [];


    const directDeps = getDirectDependencies(formNodeId, nodes, edges);
    directDeps.forEach(dep => {
        if (!allDeps.has(dep.id)) {
            allDeps.set(dep.id, dep);
            queue.push(dep);
        }
    });

    while (queue.length > 0) {
        const currentDepNode = queue.shift();
        if (currentDepNode) {

            const parents = getDirectDependencies(currentDepNode.id, nodes, edges);
            for (const parent of parents) {
                if (!allDeps.has(parent.id)) {
                    allDeps.set(parent.id, parent);
                    queue.push(parent);
                }
            }
        }
    }
    return Array.from(allDeps.values());
};

export const extractFieldsFromFormDefinition = (formDefinition: any): Field[] => {
    if (!formDefinition.field_schema || !formDefinition.field_schema.properties) {
        return [];
    }
    return Object.entries(formDefinition.field_schema.properties).map(([key, value]: [string, any]) => ({
        id: key,
        name: value.title || key,
        type: value.avantos_type,
    }));
};

export const mapGraphDataToAppForms = (graphDataForms: any[]): Form[] => {
    return graphDataForms.map(f => ({
        id: f.id,
        name: f.name,
        description: f.description,
        fields: extractFieldsFromFormDefinition(f),
    }));
};

export const getFormNodeData = (form: Form, nodes: GraphNode[]): NodeData | undefined => {
    const node = nodes.find(n => n.data.component_id === form.id);
    return node?.data;
}
