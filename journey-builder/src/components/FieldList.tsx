import React, { useState } from 'react';
import type { Form, Field, PrefillConfig, GraphNode, GraphEdge } from '../types';
import PrefillModal from './PrefillModal';
import './FieldList.css';

interface FieldListProps {
    form: Form;
    allForms: Form[];
    nodes: GraphNode[];
    edges: GraphEdge[];
    prefillConfigs: Record<string, PrefillConfig | null>;
    onUpdatePrefill: (
        targetFormId: string,
        targetFieldId: string,
        config: { sourceFieldId: string; sourceFieldName: string; sourceType: 'direct' | 'transitive' | 'global' } | null
    ) => void;
}

const FieldList: React.FC<FieldListProps> = ({
    form,
    allForms,
    nodes,
    edges,
    prefillConfigs,
    onUpdatePrefill,
}) => {
    const [selectedFieldForModal, setSelectedFieldForModal] = useState<Field | null>(null);

    const handleFieldClick = (field: Field) => {
        setSelectedFieldForModal(field);
    };

    const handleClearPrefill = (e: React.MouseEvent, fieldId: string) => {
        e.stopPropagation(); // Prevent opening modal when clearing
        onUpdatePrefill(form.id, fieldId, null);
    };

    const handleSavePrefill = (
        targetFieldId: string,
        sourceFieldId: string,
        sourceFieldName: string,
        sourceType: 'direct' | 'transitive' | 'global'
    ) => {
        onUpdatePrefill(form.id, targetFieldId, { sourceFieldId, sourceFieldName, sourceType });
        setSelectedFieldForModal(null); // Close modal on save
    };

    return (
        <div className="field-list-container">
            <h2>Prefill fields for {form.name}</h2>
            {form.fields.length === 0 && <p>This form has no fields defined.</p>}
            <ul className="field-list">
                {form.fields.map((field) => {
                    const currentPrefill = prefillConfigs[field.id];
                    return (
                        <li
                            key={field.id}
                            className={`field-item ${currentPrefill ? 'prefilled' : 'not-prefilled'}`}
                            onClick={() => handleFieldClick(field)}
                            title={currentPrefill ? `Click to change prefill for ${field.name}` : `Click to configure prefill for ${field.name}`}
                        >
                            <span className="field-name">
                                {field.name}
                                {currentPrefill && (
                                    <span className="prefill-source">: {currentPrefill.sourceFieldName}</span>
                                )}
                            </span>
                            {currentPrefill && (
                                <button
                                    className="clear-prefill-btn"
                                    onClick={(e) => handleClearPrefill(e, field.id)}
                                    title={`Clear prefill for ${field.name}`}
                                >
                                    &times;
                                </button>
                            )}
                        </li>
                    );
                })}
            </ul>
            {selectedFieldForModal && (
                <PrefillModal
                    targetField={selectedFieldForModal}
                    currentForm={form}
                    allForms={allForms}
                    nodes={nodes}
                    edges={edges}
                    currentPrefill={prefillConfigs[selectedFieldForModal.id] || null}
                    onClose={() => setSelectedFieldForModal(null)}
                    onSavePrefill={handleSavePrefill}
                />
            )}
        </div>
    );
};

export default FieldList;
