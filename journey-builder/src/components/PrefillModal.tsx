import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import type { Field, Form, FieldOption, GraphNode, GraphEdge, PrefillConfig } from '../types';
import { availableDataSources } from '../datasources';
import './PrefillModal.css';

interface PrefillModalProps {
    targetField: Field;
    currentForm: Form; // This is the form definition
    selectedJourneyNodeId: string; // ID of the actual graph node instance
    allForms: Form[]; // All form definitions
    nodes: GraphNode[]; // All graph nodes
    edges: GraphEdge[]; // All graph edges
    currentPrefill: PrefillConfig | null;
    onClose: () => void;
    onSavePrefill: (
        targetFieldId: string,
        sourceFieldId: string,
        sourceFieldName: string,
        sourceType: 'direct' | 'transitive' | 'global'
    ) => void;
}

if (typeof window !== 'undefined') {
    const appElement = document.getElementById('root');
    if (appElement) {
        Modal.setAppElement(appElement);
    } else {
        Modal.setAppElement(document.createElement('div'));
    }
}

const PrefillModal: React.FC<PrefillModalProps> = ({
    targetField,
    currentForm,
    selectedJourneyNodeId,
    allForms,
    nodes,
    edges,
    currentPrefill,
    onClose,
    onSavePrefill,
}) => {
    const [optionsBySource, setOptionsBySource] = useState<Record<string, FieldOption[]>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(currentPrefill?.sourceFieldId);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});


    useEffect(() => {
        const fetchOptions = async () => {
            setIsLoading(true);
            const allOptions: Record<string, FieldOption[]> = {};
            const initialExpansionState: Record<string, boolean> = {};
            for (const dataSource of availableDataSources) {
                try {
                    const opts = await dataSource.getOptions(
                        selectedJourneyNodeId,
                        allForms,
                        nodes,
                        edges
                    );
                    if (opts.length > 0) {
                        allOptions[dataSource.name] = opts;
                        initialExpansionState[dataSource.name] = true;
                    }
                } catch (error) {
                    console.error(`Error fetching options from ${dataSource.name} for node ${selectedJourneyNodeId}:`, error);
                }
            }
            setOptionsBySource(allOptions);
            setExpandedSources(initialExpansionState);
            setIsLoading(false);
        };

        if (selectedJourneyNodeId) {
            fetchOptions();
        }
    }, [selectedJourneyNodeId, allForms, nodes, edges, currentForm]);

    const handleSave = () => {
        if (selectedOptionId) {
            let selectedOpt: FieldOption | undefined;
            for (const key in optionsBySource) {
                selectedOpt = optionsBySource[key].find(opt => opt.id === selectedOptionId);
                if (selectedOpt) break;
            }
            if (selectedOpt) {
                onSavePrefill(targetField.id, selectedOpt.id, selectedOpt.name, selectedOpt.sourceType);
            }
        }
    };

    const toggleSourceExpansion = (sourceName: string) => {
        setExpandedSources(prev => ({ ...prev, [sourceName]: !prev[sourceName] }));
    };

    const filteredOptionsBySource: Record<string, FieldOption[]> = {};
    Object.entries(optionsBySource).forEach(([sourceName, opts]) => {
        const filtered = opts.filter(option =>
            option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sourceName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filtered.length > 0) {
            filteredOptionsBySource[sourceName] = filtered;
        }
    });


    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '550px',
            maxHeight: '80vh',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column' as 'column',
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            zIndex: 1000,
        }
    };

    return (
        <Modal isOpen onRequestClose={onClose} style={customStyles} contentLabel={`Select data element to map for ${targetField.name}`}>
            <h2 className="modal-title">Select data element to map</h2>
            <p className="modal-subtitle">Available data for field: <strong>{targetField.name}</strong></p>

            <input
                type="text"
                placeholder="Search available data..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="options-container">
                {isLoading && <p className="loading-text">Loading options...</p>}
                {!isLoading && Object.keys(filteredOptionsBySource).length === 0 && <p className="no-options-text">No prefill options available{searchTerm && ' for your search'}.</p>}

                {Object.entries(filteredOptionsBySource).map(([sourceName, opts]) => (
                    <div key={sourceName} className="source-group">
                        <button onClick={() => toggleSourceExpansion(sourceName)} className="source-header">
                            {expandedSources[sourceName] ? '▼' : '▶'} {sourceName} ({opts.length})
                        </button>
                        {expandedSources[sourceName] && (
                            <ul className="options-list">
                                {opts.map((option) => (
                                    <li
                                        key={option.id}
                                        className={`option-item ${selectedOptionId === option.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedOptionId(option.id)}
                                    >
                                        {option.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>

            <div className="modal-actions">
                <button onClick={onClose} className="button-cancel">
                    CANCEL
                </button>
                <button onClick={handleSave} disabled={!selectedOptionId} className="button-select">
                    SELECT
                </button>
            </div>
        </Modal>
    );
};

export default PrefillModal;
