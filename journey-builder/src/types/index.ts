export interface FieldOption {
    id: string; // e.g., "formId.fieldId" or "global.propertyKey"
    name: string; // e.g., "Form A - Email" or "Client Name"
    sourceName: string; // e.g., "Form A" or "Global Data"
    sourceType: 'direct' | 'transitive' | 'global';
}

export interface Field {
    id: string; // This should be the key from field_schema.properties
    name: string; // This can be field_schema.properties[key].title or the key itself
    type?: string; // e.g., field_schema.properties[key].avantos_type
    // Add any other relevant properties from field_schema
}

export interface Form {
    id: string; // e.g., f_01jk7ap2r3ewf9gx6a9r09gzjv
    name: string;
    description?: string;
    fields: Field[]; // Derived from field_schema
    // Add other properties from the form object in graph.json if needed
}

export interface NodeData {
    id: string; // bp_c_...
    component_key: string; // form-bad163fd...
    component_type: string; // "form"
    component_id: string; // f_01jk7ap2r3ewf9gx6a9r09gzjv (links to Form.id)
    name: string; // "Form F"
    prerequisites: string[]; // Array of component_key for parent nodes
}

export interface GraphNode {
    id: string; // form-bad163fd... (this is the node's own ID in the graph)
    type: string; // "form"
    data: NodeData;
}

export interface GraphEdge {
    source: string; // component_key of source node
    target: string; // component_key of target node
}

export interface GraphData {
    id: string;
    name: string;
    description?: string;
    nodes: GraphNode[];
    edges: GraphEdge[];
    forms: Form[]; // This is the detailed form definitions from graph.json
}

// Prefill configuration for a specific field in a specific form
export interface PrefillConfig {
    formId: string;
    fieldId: string;
    sourceFieldId: string; // e.g., "formX.fieldY" or "global.propertyZ"
    sourceFieldName: string; // For display purposes
    sourceType: 'direct' | 'transitive' | 'global';
}

// Map of target FormId -> Map of target FieldId -> PrefillConfig
export type PrefillConfigs = Record<string, Record<string, PrefillConfig | null>>;


export interface DataSource {
    id: string;
    name: string;
    getOptions: (
        currentForm: Form,
        allForms: Form[],
        nodes: GraphNode[],
        edges: GraphEdge[]
    ) => Promise<FieldOption[]>;
}