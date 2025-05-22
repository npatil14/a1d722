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
        currentForm: Form,
        allForms: Form[], // form definitions
        nodes: GraphNode[], // graph nodes
        edges: GraphEdge[]
    ): Promise<FieldOption[]> {
        const currentNode = nodes.find(n => n.data.component_id === currentForm.id);
        if (!currentNode) {
            console.warn(`Current graph node not found for formId: ${currentForm.id}`);
            return [];
        }

        const directDepNodes = getDirectDependencies(currentNode.data.component_key, nodes, edges);

        let options: FieldOption[] = [];
        directDepNodes.forEach(depNode => {
            options = options.concat(getFieldsFromDependentNode(depNode, allForms, 'direct'));
        });

        return options;
    }
}

export class TransitiveDependencyProvider implements DataSource {
    id = 'transitive';
    name = 'Transitive Dependencies (Excluding Direct)';

    async getOptions(
        currentForm: Form,
        allForms: Form[],
        nodes: GraphNode[],
        edges: GraphEdge[]
    ): Promise<FieldOption[]> {
        const currentNode = nodes.find(n => n.data.component_id === currentForm.id);
        if (!currentNode) {
            console.warn(`Current graph node not found for formId: ${currentForm.id} in TransitiveProvider`);
            return [];
        }

        const allTransitiveDepNodes = getTransitiveDependencies(currentNode.data.component_key, nodes, edges);
        const directDepKeys = new Set(
            getDirectDependencies(currentNode.data.component_key, nodes, edges).map(n => n.data.component_key)
        );

        let options: FieldOption[] = [];
        allTransitiveDepNodes.forEach(depNode => {
            if (!directDepKeys.has(depNode.data.component_key)) {
                options = options.concat(getFieldsFromDependentNode(depNode, allForms, 'transitive'));
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
        _currentForm: Form,
        _allForms: Form[],
        _nodes: GraphNode[],
        _edges: GraphEdge[]
    ): Promise<FieldOption[]> {
        return this.globalProperties.map(prop => ({
            id: prop.id, // Global IDs are inherently unique
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
