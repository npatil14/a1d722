import type { DataSource, FieldOption, Form, GraphNode, GraphEdge } from '../types';
import { getDirectDependencies, getTransitiveDependencies, getFormById } from '../utils/graphUtils';

const getFieldsFromDependentNode = (
    depNode: GraphNode,
    allForms: Form[],
    sourceType: 'direct' | 'transitive'
): FieldOption[] => {
    const formDef = getFormById(depNode.data.component_id, allForms);
    if (!formDef) {
        console.warn(`Form definition not found for component_id: ${depNode.data.component_id} (Node: ${depNode.data.name})`);
        return [];
    }

    // Map over the fields in the form definition
    return formDef.fields.map(field => ({
        id: `${depNode.data.component_key}.${field.id}`,

        name: `${depNode.data.name} - ${field.name}`,

        sourceName: depNode.data.name,
        sourceType: sourceType,
    }));
};

export class DirectDependencyProvider implements DataSource {
    id = 'direct';
    name = 'Direct Dependencies';

    async getOptions(
        selectedGraphNodeId: string,
        allFormDefinitions: Form[],
        allGraphNodes: GraphNode[],
        allGraphEdges: GraphEdge[]
    ): Promise<FieldOption[]> {
        const currentNode = allGraphNodes.find(n => n.id === selectedGraphNodeId); // Use selectedGraphNodeId
        if (!currentNode) {
            console.warn(`DirectDependencyProvider: Current graph node not found for id: ${selectedGraphNodeId}`);
            return [];
        }

        const directDepNodes = getDirectDependencies(currentNode.id, allGraphNodes, allGraphEdges); // Use currentNode.id

        let options: FieldOption[] = [];
        directDepNodes.forEach(depNode => {
            options = options.concat(getFieldsFromDependentNode(depNode, allFormDefinitions, 'direct'));
        });
        return options;
    }
}

export class TransitiveDependencyProvider implements DataSource {
    id = 'transitive';
    name = 'Transitive Dependencies (Excluding Direct)';

    async getOptions(
        selectedGraphNodeId: string,
        allFormDefinitions: Form[],
        allGraphNodes: GraphNode[],
        allGraphEdges: GraphEdge[]
    ): Promise<FieldOption[]> {
        const currentNode = allGraphNodes.find(n => n.id === selectedGraphNodeId);
        if (!currentNode) {
            console.warn(`TransitiveDependencyProvider: Current graph node not found for id: ${selectedGraphNodeId}`);
            return [];
        }

        const allTransitiveDepNodes = getTransitiveDependencies(currentNode.id, allGraphNodes, allGraphEdges); // Use currentNode.id
        const directDepKeys = new Set(
            getDirectDependencies(currentNode.id, allGraphNodes, allGraphEdges).map(n => n.id) // Use node.id for keys
        );

        let options: FieldOption[] = [];
        allTransitiveDepNodes.forEach(depNode => {
            if (!directDepKeys.has(depNode.id)) { // Use node.id for checking
                options = options.concat(getFieldsFromDependentNode(depNode, allFormDefinitions, 'transitive'));
            }
        });
        return options;
    }
}

export class GlobalDataProvider implements DataSource {
    id = 'global';
    name = 'Global Data';

    private globalProperties = [
        { id: 'global.clientName', name: 'Client Name', value: 'Acme Corp' },
        { id: 'global.clientId', name: 'Client ID', value: 'CID-12345' },
        { id: 'global.actionCategory', name: 'Action Category', value: 'Onboarding' },
    ];

    async getOptions(
        _selectedGraphNodeId: string,
        _allFormDefinitions: Form[],
        _allGraphNodes: GraphNode[],
        _allGraphEdges: GraphEdge[]
    ): Promise<FieldOption[]> {
        return this.globalProperties.map(prop => ({
            id: prop.id, // Global IDs are inherently unique by design here
            name: prop.name,
            sourceName: 'Global Data',
            sourceType: 'global',
        }));
    }
}

export const availableDataSources: DataSource[] = [
    new DirectDependencyProvider(),
    new TransitiveDependencyProvider(),
    new GlobalDataProvider(),
];
