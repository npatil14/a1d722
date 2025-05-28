import React from 'react';
import type { JourneyNodeInfo } from '../types';
import './FormList.css';

interface FormListProps {
    journeyNodes: JourneyNodeInfo[];
    onSelectJourneyNode: (nodeInfo: JourneyNodeInfo) => void;
    selectedJourneyNodeId?: string | null;
}

const FormList: React.FC<FormListProps> = ({ journeyNodes, onSelectJourneyNode, selectedJourneyNodeId }) => (
    <div className="form-list-container">
        <h2 className="form-list-title">Forms</h2>
        {journeyNodes.length === 0 && <p className="form-list-empty">No journey steps loaded.</p>}
        <ul className="form-list-ul">
            {journeyNodes.map((nodeInfo, index) => (
                <li key={nodeInfo.id} className="form-list-item-wrapper"> {/* Use nodeInfo.id for key */}
                    <button
                        onClick={() => onSelectJourneyNode(nodeInfo)}
                        className={`form-list-item-button ${selectedJourneyNodeId === nodeInfo.id ? 'selected' : ''}`}
                        title={`Select step: ${nodeInfo.name}`}
                    >
                        <span className="form-item-index">{index + 1}.</span>
                        <span className="form-name-text">{nodeInfo.name}</span>
                    </button>
                </li>
            ))}
        </ul>
    </div>
);

export default FormList;